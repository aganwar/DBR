import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

// ✅ Toast provider
import Toast from "./components/Toast"; // default export is the Provider component

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Toast>
      <App />
    </Toast>
  </React.StrictMode>
);
