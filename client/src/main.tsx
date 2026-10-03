import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

if ("serviceWorker" in navigator) {
  let reloadingForWorkerUpdate = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloadingForWorkerUpdate) return;
    reloadingForWorkerUpdate = true;
    window.location.reload();
  });
  window.addEventListener("load", () => {
    const baseUrl = import.meta.env.BASE_URL;
    navigator.serviceWorker.register(`${baseUrl}sw.js`, { scope: baseUrl, updateViaCache: "none" })
      .then((registration) => registration.update())
      .catch((error) => console.warn("Monster Fit: não foi possível registrar o modo offline", error));
  });
}

createRoot(document.getElementById("root")!).render(<App />);
