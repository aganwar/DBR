// src/types/priorityList.ts

export interface PriorityRowDto {
  aspKey: string;            // ASP_KEY
  productionOrderNr: string; // Production_Order_Nr
  materialNumber: string;    // Material_number
  name: string;              // Name
  quantity: number;          // Quantity (double)
  workStepNr: string;        // Work_Step_Nr
  resource: string;          // Ressource
  productionTime: number;    // Production_Time (minutes)
  workstepsToGo: number;     // Worksteps_to_Go
  targetDate: string | null; // Production_Order_Target_Date (nullable)
  targetType: string;        // Target_Type
  targetBufferSize: number;  // Target_Buffer_Size
  remainingTargetBufferSize: number; // Remaining_Target_Buffer_Size
  targetRbc: number;         // Target_RBC (double)
  prio: string;              // Prio
  runningSumProductionTime: number; // Running_Sum_of_Production_Time
  startDateStdHours: string | null; // Start_Date_based_Standardhours (nullable)
  expectedStartTimeMin: number;     // Expected_start_time (minutes)
  setupGroup: string;        // Setup_Group
  customizedTargetDate: boolean;    // Customized_Production_Order_Target_Date
  isExcluded: boolean;       // Is_Excluded
  isScheduledRes: boolean;   // mapped from isScheduledRes (int)
}

export interface PriorityListPageDto {
  items: PriorityRowDto[];
  page: number;
  pageSize: number;
  total: number;
}

export interface ImportStatusDto {
  file: string;              // FileName
  date: string;              // parsed if possible
  rawDate: string;           // original string from view (fallback)
  status: string;
  message: string;
}

export interface TargetDateUpdateRequestDto {
  updates: Array<{
    productionOrderNr: string;
    targetDate: string | null;
  }>;
}

export interface TargetDateUpdateResponseDto {
  updated: number;
}

export interface DbrResponseDto {
  ok: boolean;
  affected: number;
}