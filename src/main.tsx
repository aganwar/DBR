import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./gridSetup";

// AG Grid CSS themes (v32-style file themes)
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
