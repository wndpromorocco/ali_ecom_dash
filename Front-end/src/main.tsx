import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { installMock } from "./mocks/installMock";

// Demo mode: when VITE_USE_MOCK=true, serve a static catalog snapshot instead of
// calling a back-end (see src/mocks/installMock.ts). No effect on normal builds.
if (import.meta.env.VITE_USE_MOCK === "true") {
  installMock();
}

createRoot(document.getElementById("root")!).render(<App />);
