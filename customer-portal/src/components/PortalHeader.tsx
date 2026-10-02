import { LogOut, UserRound } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function PortalHeader() {
    return (
        <header className="portal-header">
            <NavLink to="/dashboard" className="brand">
                <span className="brand-mark">HT</span>
                <span>HTT FLOORING</span>
            </NavLink>

            <nav className="portal-nav">
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/inventory">Inventory Lookup</NavLink>
                <NavLink to="/invoices">Invoices</NavLink>
                <NavLink to="/account">My Account</NavLink>
            </nav>

            <div className="account-menu">
                <div>
                    <strong>ABC Flooring</strong>
                    <small>Melbourne</small>
                </div>

                <UserRound size={18} />
                <LogOut size={17} />
            </div>
        </header>
    );
}