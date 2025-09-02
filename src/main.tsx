import React from "react";
import ReactDOM from "react-dom/client";

// Global styles
import "./index.css";

// AG Grid: register modules once and load CSS once
import "./gridSetup";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import App from "./App";

// Toast provider (kept as-is per current app setup)
import Toast from "./components/Toast"; // default export is the Provider component

ReactDOM.createRoot(document.getElementById("root")!).render(
<React.StrictMode>
<Toast>
<App />
</Toast>
</React.StrictMode>
);