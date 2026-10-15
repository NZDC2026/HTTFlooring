import {
  StrictMode, Suspense, lazy,
} from "react";

import {
  createRoot,
} from "react-dom/client";

const App = lazy(() => import("./App"));

import { SecurityGate } from "./features/security/SecurityGate";
import "./styles/globals.css";

createRoot(
  document.getElementById(
    "root",
  )!,
).render(
  <StrictMode>
    <SecurityGate><Suspense fallback={<p className="p-6">Loading workspace…</p>}><App /></Suspense></SecurityGate>
  </StrictMode>,
);