import React from "react";
import ReactDOM from "react-dom/client";

// AG Grid CSS themes (v32-style file themes) - import before our custom styles
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

// Our custom styles (including AG Grid overrides) - import after AG Grid styles
import "./index.css";
import "./gridSetup";

import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
