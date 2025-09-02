//src/gridSetup.ts
// src/gridSetup.ts
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

/**

Idempotent AG Grid module registration.
Prevents duplicate registration across HMR/re-mounts.
Centralize module setup for the whole app.
*/
const FLAG = "AG_GRID_REGISTERED";
export function ensureAgGridRegistered(): void {
const g = globalThis as any;
if (g[FLAG]) return;
ModuleRegistry.registerModules([AllCommunityModule]);
g[FLAG] = true;
}

// Keep previous behavior: register on first import.
ensureAgGridRegistered();