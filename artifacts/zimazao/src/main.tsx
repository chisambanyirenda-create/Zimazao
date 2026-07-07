import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// The whole app is dark-themed. Force the `dark` class onto <html> at runtime so
// the design tokens (--card, --foreground, etc.) resolve to their dark values on
// EVERY page — not just the ones that wrap themselves in a `dark` div.
document.documentElement.classList.add("dark");

createRoot(document.getElementById("root")!).render(<App />);

// Register the service worker so the app is installable ("Add to Home Screen").
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* SW registration is best-effort; app works without it */
    });
  });
}
