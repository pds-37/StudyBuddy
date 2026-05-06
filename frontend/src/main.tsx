import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./index.css";

// Handle chunk loading errors (e.g. after a new deployment)
window.addEventListener('vite:preloadError', (event) => {
  console.log('Detected chunk load error, reloading page...');
  window.location.reload();
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
