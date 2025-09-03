/* ============================================================================
 * Shared Types — Single Source of Truth for API DTOs and UI Models
 * ----------------------------------------------------------------------------
 * Why:
 * - Eliminate duplicate interfaces declared inside components.
 * - Keep server DTOs (snake_case) matching the backend exactly.
 * - Optionally offer camelCase UI models and small helpers for mapping.
 * - Centralize grid-related types used by MasterGrid and CalendarGrid.
 * ========================================================================== */

/** -----------------------------
 * Server DTOs (exact wire format)
 * ------------------------------*/

/** A single scheduled resource row as returned by /api/resources endpoints. */
export interface ResourceDto {
  id?: number | string;
  resource_group: string;
  is_constraint: boolean;
  capacity?: number | null;
}

/** Grid config (e.g., /api/grid-config/scheduled-resources-master) */
export interface GridColumnDto {
  field: string;
  headerName?: string;
  width?: number;
  editable?: boolean;
  hide?: boolean;
  type?: string;
}

export interface GridConfigDto {
  columns: GridColumnDto[];
}

/** Calendar rows as returned by /api/calendar/:resource */
export interface CalendarRowDto {
  /** ISO date (yyyy-mm-dd) */
  dates: string;
  /** resource identifier (id or code) */
  resource: string | number;
  capacity?: number | null;
  /** whether the day is fully off */
  is_off?: boolean;
  /** whether capacity/off has been customized for the day */
  is_customised?: boolean;
}

/** Payload for PATCH /api/calendar/:resource */
export interface CalendarPatchDto {
  /** { [yyyy-mm-dd]: { capacity?: number, is_off?: boolean } } */
  changesByDate: Record<
    string,
    {
      capacity?: number | null;
      is_off?: boolean;
    }
  >;
}

/** -----------------------------
 * UI view models (camelCase)
 * ------------------------------*/

export interface Resource {
  id?: number | string;
  resourceGroup: string;
  isConstraint: boolean;
  capacity?: number | null;
}

export interface CalendarRow {
  date: string; // yyyy-mm-dd
  resource: string | number;
  capacity?: number | null;
  isOff?: boolean;
  isCustomised?: boolean;
}

/** -----------------------------
 * Mapping helpers (tiny, pure)
 * ------------------------------*/

/** Map server ResourceDto -> UI Resource (camelCase) */
export function toResource(r: ResourceDto): Resource {
  return {
    id: r.id,
    resourceGroup: r.resource_group,
    isConstraint: r.is_constraint,
    capacity: r.capacity ?? null,
  };
}

/** Map UI Resource -> server ResourceDto (snake_case) */
export function fromResource(r: Resource): ResourceDto {
  return {
    id: r.id,
    resource_group: r.resourceGroup,
    is_constraint: r.isConstraint,
    capacity: r.capacity ?? null,
  };
}

/** Map server CalendarRowDto -> UI CalendarRow */
export function toCalendarRow(row: CalendarRowDto): CalendarRow {
  return {
    date: row.dates,
    resource: row.resource,
    capacity: row.capacity ?? null,
    isOff: !!row.is_off,
    isCustomised: !!row.is_customised,
  };
}

/** Map UI CalendarRow -> server CalendarRowDto (for completeness) */
export function fromCalendarRow(row: CalendarRow): CalendarRowDto {
  return {
    dates: row.date,
    resource: row.resource,
    capacity: row.capacity ?? null,
    is_off: !!row.isOff,
    is_customised: !!row.isCustomised,
  };
}

/** -----------------------------
 * Grid editing utilities (shared)
 * ------------------------------*/

/** Generic shape for tracking cell-level pending changes in a grid. */
export type DirtyMap<RowKey extends string | number, ColKey extends string> = {
  /** map of rowKey -> set of changed column keys */
  byRow: Map<RowKey, Set<ColKey>>;
  /** count of total changed cells (optional, for quick badges) */
  count?: number;
};

/** For Calendar pending edits keyed by date. */
export type CalendarPending = Record<
  string, // yyyy-mm-dd
  {
    capacity?: number | null;
    is_off?: boolean;
  }
>;

/** A very small helper to toggle a cell as dirty in a DirtyMap. */
export function markDirty<RowKey extends string | number, ColKey extends string>(
  dirty: DirtyMap<RowKey, ColKey>,
  rowKey: RowKey,
  colKey: ColKey,
  isDirty: boolean
) {
  let rowSet = dirty.byRow.get(rowKey);
  if (!rowSet && isDirty) {
    rowSet = new Set<ColKey>();
    dirty.byRow.set(rowKey, rowSet);
  }
  if (!rowSet) return;

  const before = rowSet.size;
  if (isDirty) rowSet.add(colKey);
  else rowSet.delete(colKey);

  if (rowSet.size === 0) dirty.byRow.delete(rowKey);

  if (dirty.count !== undefined) {
    const after = rowSet ? rowSet.size : 0;
    dirty.count += Math.max(0, after - before);
  }
}

/** -----------------------------
 * Narrow endpoint signatures (optional)
 * ------------------------------*/

export interface ResourcesApi {
  list: (groups: string[]) => Promise<ResourceDto[]>;
  save: (rows: ResourceDto[]) => Promise<ResourceDto[]>;
  delete: (ids: Array<number | string>) => Promise<{ ok: true }>;
  gridConfig: () => Promise<GridConfigDto>;
}

export interface CalendarApi {
  list: (resource: string | number, from: string, to: string) => Promise<CalendarRowDto[]>;
  patch: (resource: string | number, body: CalendarPatchDto) => Promise<{ ok: true }>;
}
