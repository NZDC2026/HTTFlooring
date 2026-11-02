import { LogOut, UserRound } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import { logout, useLocalAccount } from "../data/localAccount";
export default function PortalHeader() {
    const {profile} = useLocalAccount(); const navigate = useNavigate(); const {pathname}=useLocation();
    return (
        <header className="portal-header">
            <NavLink to="/dashboard" className="brand">
                <span className="brand-mark">HT</span>
                <span>HTT FLOORING</span>
            </NavLink>

            <nav className="portal-nav">
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/inventory" className={({isActive})=>isActive || (pathname.startsWith("/series/") || pathname.startsWith("/collections/")) || pathname.startsWith("/products/") ? "active" : ""}>Inventory Lookup</NavLink>
                <NavLink to="/invoices">Invoices</NavLink>
                <NavLink to="/account">My Account</NavLink>
            </nav>

            <div className="account-menu">
                <div>
                    <strong>{profile.businessName}</strong>
                    <small>{profile.region}</small>
                </div>

                <NavLink to="/account" aria-label="My account"><UserRound size={18}/></NavLink>
                <button className="icon-button" aria-label="Log out" onClick={()=>{logout();navigate("/login",{replace:true});}}><LogOut size={17}/></button>
            </div>
        </header>
    );
}