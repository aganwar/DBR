# Priority List – Modern API & Frontend Implementation Spec

This document describes the **new sidecar APIs** and a **frontend blueprint** for the Scheduled Resource Plan / Priority List page. It’s designed so a frontend dev can build the page without touching legacy DBML endpoints.

---

## 0) Architecture Overview

* **Runtime**: Same site & port as existing APIs (Web API 2).
* **Reads**: EF Core 3.1 (sidecar) mapped to `asp.vw_ocx_base_Porduction_orders` and `asp.vw_ocx_Import_Logs`.
* **Writes**: Dapper + Stored Procedures (no DBML):

  * `dbo.usp_PriorityList_UpdateTargetDates` (TVP)
  * `dbo.ocx_usp_Reset_DBR`
  * `dbo.ocx_usp_Run_DBR_on_All_Constraints`
* **Connection**: `StandardParametersConnectionString` from Web.config.
* **Versioning**: `api/v1/*` route prefix.

---

## 1) Data Model (DTOs)

### 1.1 Priority Row (read DTO)

```jsonc
{
  "aspKey": "string",            // ASP_KEY
  "productionOrderNr": "string", // Production_Order_Nr
  "materialNumber": "string",    // Material_number
  "name": "string",              // Name
  "quantity": 0.0,                // Quantity (double)
  "workStepNr": "string",        // Work_Step_Nr
  "resource": "string",          // Ressource
  "productionTime": 0,            // Production_Time (minutes)
  "workstepsToGo": 0,             // Worksteps_to_Go
  "targetDate": "YYYY-MM-DD",    // Production_Order_Target_Date (nullable)
  "targetType": "string",        // Target_Type
  "targetBufferSize": 0,          // Target_Buffer_Size
  "remainingTargetBufferSize": 0, // Remaining_Target_Buffer_Size
  "targetRbc": 0.0,               // Target_RBC (double)
  "prio": "string",              // Prio
  "runningSumProductionTime": 0,  // Running_Sum_of_Production_Time
  "startDateStdHours": "date?",  // Start_Date_based_Standardhours (nullable)
  "expectedStartTimeMin": 0,      // Expected_start_time (minutes)
  "setupGroup": "string",        // Setup_Group
  "customizedTargetDate": true,   // Customized_Production_Order_Target_Date
  "isExcluded": false,            // Is_Excluded
  "isScheduledRes": false         // mapped from isScheduledRes (int)
}
```

### 1.2 Priority List Page (read wrapper)

```jsonc
{
  "items": [ /* PriorityRowDto[] */ ],
  "page": 1,
  "pageSize": 50,
  "total": 1234
}
```

### 1.3 Import Status (read DTO)

```jsonc
{
  "file": "string",              // FileName
  "date": "2025-09-16T12:34:56Z",// parsed if possible
  "rawDate": "string",           // original string from view (fallback)
  "status": "string",
  "message": "string"
}
```

### 1.4 Target Date Update (write request)

```jsonc
{
  "updates": [
    { "productionOrderNr": "000187433", "targetDate": "2025-09-22" },
    { "productionOrderNr": "000199999", "targetDate": null }
  ]
}
```

> NOTE: The current API updates **all work-steps for an order** (join on Production\_Order\_Nr). If per-step control is needed, see §7.2.

---

## 2) API Endpoints

### 2.1 GET /api/v1/priority-list

Fetch paged priority rows.

**Query Params**

* `resource` (string, optional): filter by `Ressource`.
* `nonScheduled` (0|1, optional): when `1` and `resource` empty → `isScheduledRes = 0` only.
* `page` (int, default 1): 1-based.
* `pageSize` (int, default 50, max 200).

**Responses**

* `200 OK` → `PriorityListPageDto`.
* `400 Bad Request` → invalid paging.

**Examples**

* `GET /api/v1/priority-list?resource=RES-A&page=1&pageSize=50`
* `GET /api/v1/priority-list?nonScheduled=1&page=2&pageSize=25`

**Server-side ordering**: `Production_Order_Nr` then `Work_Step_Nr`.

---

### 2.2 PATCH (or POST) /api/v1/priority-list/target-dates

Batch set/clear target dates for orders.

**Body**: `TargetDateUpdateRequestDto` (see §1.4).

**Behavior**

* For each `ProductionOrderNr` in `updates`:

  * `Production_Order_Target_Date = <date or NULL>`
  * `Customized_Production_Order_Target_Date = (date != NULL)`
* Joins on `Production_Order_Nr` **only** (all steps updated). Returns count of affected rows.

**Responses**

* `200 OK` → `{ "updated": <int> }`
* `400 Bad Request` → no updates, missing `productionOrderNr`, too many updates (>2000).

**Examples**

* Set date: `{"updates":[{"productionOrderNr":"000187433","targetDate":"2025-09-22"}]}`
* Clear date: `{"updates":[{"productionOrderNr":"000187433","targetDate":null}]}`

---

### 2.3 GET /api/v1/import-status

Fetch most recent import status from `asp.vw_ocx_Import_Logs`.

**Response**

* `200 OK` → `ImportStatusDto`.
* `200 OK` with nulls when no logs exist.

**Example**

* `GET /api/v1/import-status`

---

### 2.4 POST /api/v1/dbr/reset

Triggers stored proc `dbo.ocx_usp_Reset_DBR`.

**Response**

* `200 OK` → `{ "ok": true, "affected": -1 }` (or rowcount if the proc returns it).
* **POST-only**. For browser testing, consider adding a GET wrapper that delegates to POST.

---

### 2.5 POST /api/v1/dbr/run

Triggers stored proc `dbo.ocx_usp_Run_DBR_on_All_Constraints`.

**Response**

* `200 OK` → `{ "ok": true, "affected": -1 }` (or rowcount if the proc returns it).

---

## 3) Frontend Usage Guide

### 3.1 Page layout (desktop-first)

* **Header bar**: Page title ("Priority List"), Import Status pill (status + time), Actions (Run DBR, Reset DBR)
* **Filters row**:

  * Resource (select) — required to scope results OR toggle Non-scheduled
  * Non-scheduled only (checkbox)
  * Search (free text, optional; can filter by PO nr/material client-side)
* **Grid** (virtualized table):

  * Columns: ProductionOrderNr, WorkStepNr, Resource, Name, MaterialNumber, Quantity, ProductionTime, WorkstepsToGo, TargetDate, TargetType, Buffer/Remaining, TargetRbc, Prio, ExpectedStartTimeMin, SetupGroup, CustomizedTargetDate, IsExcluded
  * Sticky header, horizontal scroll, column resize
  * Target Date cell: editable (date picker) → debounced batch PATCH
* **Footer**: Pagination controls (page, pageSize), total count

### 3.2 Data flow

1. On page load:

   * Call `GET /api/v1/import-status` for the pill.
   * Call `GET /api/v1/priority-list?resource=<default>&page=1&pageSize=50`.
2. On filter change:

   * Re-fetch list with new query params.
3. On date edit:

   * Collect edits (queue), debounce 300–500ms, send one `PATCH /target-dates` with multi-updates.
   * Optimistically update UI; on error, revert and toast.
4. On "Reset DBR" or "Run DBR":

   * Disable buttons while awaiting `POST /api/v1/dbr/*`.
   * On success, show toast and (optionally) refresh list.

### 3.3 Call sequencing & UX hints

* **First fetch**: require either Resource *or* Non-scheduled to avoid huge payloads.
* **Optimistic UI** for target date edits; batch PATCH to reduce chatter.
* **Toasts**: success/failure; include row counts (e.g., "Updated 8 rows for 000187433").
* **Loading states**: skeleton rows for the grid; spinner for DBR actions.
* **Error states**: inline banner with retry; show server `message` if present.

### 3.4 Example fetch (TypeScript)

```ts
async function fetchPriorityList(params: { resource?: string; nonScheduled?: boolean; page?: number; pageSize?: number }) {
  const qs = new URLSearchParams();
  if (params.resource) qs.set('resource', params.resource);
  if (params.nonScheduled) qs.set('nonScheduled', '1');
  qs.set('page', String(params.page ?? 1));
  qs.set('pageSize', String(params.pageSize ?? 50));
  const res = await fetch(`/api/v1/priority-list?${qs.toString()}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function patchTargetDates(updates: { productionOrderNr: string; targetDate: string | null }[]) {
  const res = await fetch('/api/v1/priority-list/target-dates', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ updates }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function getImportStatus() {
  const res = await fetch('/api/v1/import-status');
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function runDbr(kind: 'reset' | 'run') {
  const res = await fetch(`/api/v1/dbr/${kind}`, { method: 'POST' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
```

---

## 4) Validation & Error Handling

* **Paging**: `page >= 1`, `1 <= pageSize <= 200` → otherwise `400`.
* **PATCH target-dates**:

  * Require non-empty `updates`.
  * Each item must have `productionOrderNr`.
  * Hard limit of 2000 updates per request.
* **DBR**: POST-only; wrap network errors with user-friendly message.
* **JSON contract**: keep property casing as in examples (camelCase) for frontend consumption.

---

## 5) Performance & Limits

* **Server paging**: mandatory, avoid `pageSize` > 200.
* **Batch writes**: bundle edits (10–200+) to leverage TVP.
* **Indexes**: ensure table/index on `pub.ocx_base_Porduction_orders(Production_Order_Nr, Work_Step_Nr)` for writes.
* **Timeouts**: DBR procs have generous timeouts; keep UI responsive.

---

## 6) Security & Operational Notes

* **Auth**: Reuse existing site auth (headers/tokens) — no changes in this spec.
* **CORS**: Not required when same site/port; configure if calling from a different origin.
* **Idempotency**: PATCH is idempotent per (order → date) pair.
* **Observability**: add request logging and error correlation IDs (optional).

---

## 7) Extensibility (Future Enhancements)

### 7.1 Enrich reads

* Add query params: `material`, `setupGroup`, `fromDate`, `toDate`, `search`.
* Server-side sorting toggles (column + direction).

### 7.2 Per-workstep target date updates

* Extend TVP and sproc to include `Work_Step_Nr` so only one step updates.
* Update request DTO and repo accordingly.

### 7.3 Exclude / Unexclude endpoint

* `POST /api/v1/priority-list/exclude` with `{ productionOrderNr, isExcluded }`.
* Updates `Is_Excluded` for all rows of the order (or per-step variant).

### 7.4 CSV export

* `GET /api/v1/priority-list/export?resource=...&nonScheduled=1` returns streamed CSV with current filters.

### 7.5 More informative DBR responses

* Have sprocs `SELECT` a status/message; return that verbatim to the client.

---

## 8) Test Plan (dev handoff)

* **GET priority-list (resource)** returns rows; paging reflects total.
* **GET priority-list (nonScheduled=1)** shows only `isScheduledRes = false`.
* **GET import-status** shows the latest row; `date` parsed or fallback `rawDate` shown.
* **PATCH target-dates** sets date and flips `customizedTargetDate` to true; clearing sets it to false.
* **PATCH batch** with 2–10 items updates rowcount accordingly.
* **POST dbr/reset** and **POST dbr/run** return `200` during a safe window.

---

## 9) Frontend Acceptance Criteria

* Filters, grid, paging, and date editing behave as specified.
* Debounced batch PATCH works; errors revert UI.
* DBR buttons disabled while in-flight; toast on completion.
* Import status pill updates on load and every N minutes (e.g., 5m) optionally.

---

## 10) Change Log

* v1.0: Initial sidecar read/write APIs, paging, batch target date updates, DBR run/reset, import status.

---

**Contact / Ownership**

* Backend: Modern sidecar (EF Core/Dapper) — same team that owns the new page.
* Frontend: Priority List page — consumer of all endpoints in this doc.
