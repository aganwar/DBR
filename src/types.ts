export type ResourceDto = {
  resource_group: string;
  is_constraint: boolean | null;
  capacity: number | null; // int? in DB
};

export type CalendarRowDto = {
  dates: string;               // yyyy-MM-dd
  resource: string;
  capacity: number | null;     // maps to working_hours (int?) in DB
  is_off: boolean | null;
  is_customised: boolean | null;
};

export type GridConfig = {
  canWrite: boolean;
  editableColumns: string[];
  hiddenColumns: string[];
  columnOptions?: Record<string, any>;
};
