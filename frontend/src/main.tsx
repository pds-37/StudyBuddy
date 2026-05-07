import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./index.css";

// Handle chunk loading errors (e.g. after a new deployment)
window.addEventListener("vite:preloadError", (event) => {
  console.warn("Detected chunk load error, clearing cache and reloading...", event);
  
  // Clear service worker to break potential reload loops with cached index.html
  if ("serviceWorker" in navigator) {
    void navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        void registration.unregister();
      }
      window.location.reload();
    });
  } else {
    window.location.reload();
  }
});


ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
