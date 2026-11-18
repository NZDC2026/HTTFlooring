import { useBoardRequests } from "../data/boardRequests";
import { LogOut, UserRound } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import { logout, useLocalAccount } from "../services/account";
export default function PortalHeader() {
    const pendingBoards=useBoardRequests().filter(request=>request.status==="Requested").length;
    const {profile} = useLocalAccount(); const navigate = useNavigate(); const {pathname}=useLocation();
    return (
        <header className="portal-header">
            <NavLink to="/dashboard" className="brand">
                <span className="reference-brand-mark" aria-hidden="true"><i/><i/></span>
                <span>HTT FLOORING</span>
            </NavLink>

            <nav className="portal-nav">
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/inventory" className={({isActive})=>isActive || (pathname.startsWith("/series/") || pathname.startsWith("/collections/")) || pathname.startsWith("/products/") || pathname.startsWith("/ranges/") ? "active" : ""}>Inventory</NavLink>
                <NavLink to="/display-boards">Display Boards <span className="nav-count">{pendingBoards}</span></NavLink>
                <NavLink to="/quotes">Quotes</NavLink>
                <NavLink to="/orders">Orders</NavLink>
                <NavLink to="/invoices">Invoices</NavLink>
                <NavLink to="/sales">Sales</NavLink>
                <NavLink to="/rebates">Rebate</NavLink>
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