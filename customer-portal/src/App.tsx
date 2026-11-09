import SalesDocumentsPage from "./pages/SalesDocumentsPage";
import DispatchFollowupPage from "./pages/DispatchFollowupPage";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import AccountPage from "./pages/AccountPage";
import ApplicationSubmittedPage from "./pages/ApplicationSubmittedPage";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import InventoryPage from "./pages/InventoryPage";
import LoginPage from "./pages/LoginPage";
import ProductPage from "./pages/ProductPage";
import SeriesPage from "./pages/SeriesPage";
import RegisterPage from "./pages/RegisterPage";
import InvoicesPage from "./pages/InvoicesPage";
import CreditDetailPage from "./pages/CreditDetailPage";
import ReturnDetailPage from "./pages/ReturnDetailPage";
import InvoiceDetailPage from "./pages/InvoiceDetailPage";

import { useEffect } from "react";
import { useLocalAccount } from "./data/localAccount";
function RequireAccount() {
 const { authenticated } = useLocalAccount(); const location = useLocation();
 return authenticated ? <Outlet/> : <Navigate to="/login" replace state={{from: location.pathname + location.search}}/>;
}
function ScrollToTop() { const {pathname} = useLocation(); useEffect(()=>{window.scrollTo(0,0);},[pathname]); return null; }
export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop/><Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/follow-up" element={<DispatchFollowupPage/>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/application-submitted"
          element={<ApplicationSubmittedPage />}
        />

        <Route element={<RequireAccount/>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/series/:id" element={<SeriesPage />} />
        <Route path="/collections/:id" element={<SeriesPage />} />
        <Route path="/products/:id" element={<ProductPage />} />
        <Route path="/quotes" element={<SalesDocumentsPage kind="quotes" />} />
        <Route path="/quotes/:id" element={<SalesDocumentsPage kind="quotes" />} />
        <Route path="/orders" element={<SalesDocumentsPage kind="orders" />} />
        <Route path="/orders/:id" element={<SalesDocumentsPage kind="orders" />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/invoices/credits/:id" element={<CreditDetailPage />} />
        <Route path="/invoices/returns/:id" element={<ReturnDetailPage />} />
        <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
        <Route path="/account" element={<AccountPage />} />
        </Route>
        <Route path="*" element={<main className="submitted-page"><div className="submitted-card"><h1>Page not found</h1><p>The page may have moved.</p><a href="/">Back to HTT Flooring</a></div></main>}/>
      </Routes>
    </BrowserRouter>
  );
}