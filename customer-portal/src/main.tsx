import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./htt-tokens.css";
import "./portal-system.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);