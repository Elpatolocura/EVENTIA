import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";

const root = document.getElementById("root")!;
if (root.hasChildNodes()) {
  createRoot(root).render(<App />);
} else {
  createRoot(root).render(<App />);
}
