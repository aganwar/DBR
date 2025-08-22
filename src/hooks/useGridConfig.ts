import * as React from "react";
import { api } from "../api";
import type { GridConfig } from "../types";

const DEFAULT_CFG: GridConfig = {
  canWrite: true,
  editableColumns: [],
  hiddenColumns: [],
  columnOptions: {},
};

export function useGridConfig(gridKey: string) {
  const [config, setConfig] = React.useState<GridConfig>(DEFAULT_CFG);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<GridConfig>(`/api/grid-config/${gridKey}`);
        if (alive && res?.data) setConfig({ ...DEFAULT_CFG, ...res.data });
      } catch (e: any) {
        if (alive) setError(e?.message || String(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [gridKey]);

  return { config, loading, error };
}
