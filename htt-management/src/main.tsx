import {
  StrictMode,
} from "react";

import {
  createRoot,
} from "react-dom/client";

import App from "./App";

import {
  initializeSalesAccounting,
} from "./features/accounting/data/salesAccountingBootstrap";

import {
  initializePurchasesAccounting,
} from "./features/accounting/data/purchasesAccountingBootstrap";

import "./styles/globals.css";

initializeSalesAccounting();
initializePurchasesAccounting();

createRoot(
  document.getElementById(
    "root",
  )!,
).render(
  <StrictMode>
    <App />
  </StrictMode>,
);