import { LockKeyhole, MapPin } from "lucide-react";
import PortalHeader from "../components/PortalHeader";

export default function AccountPage() {
    return (
        <>
            <PortalHeader />

            <main className="account-page">
                <aside className="account-banner">
                    <h1>My Account</h1>
                    <p>
                        View and manage your
                        <br />
                        business information.
                    </p>
                </aside>

                <section className="account-content">
                    <h1>ABC Flooring Pty Ltd</h1>

                    <div className="account-grid">
                        <section>
                            <h3>Business Details</h3>

                            <dl>
                                <dt>Business Name</dt>
                                <dd>ABC Flooring Pty Ltd</dd>

                                <dt>ABN</dt>
                                <dd>12 345 678 901</dd>

                                <dt>Business Type</dt>
                                <dd>Flooring Retailer</dd>

                                <dt>Account Manager</dt>
                                <dd>Daniel</dd>

                                <dt>Region</dt>
                                <dd className="locked-region">Melbourne <LockKeyhole size={13}/></dd>
                            </dl>

                            <h3>Primary Contact</h3>

                            <dl>
                                <dt>Name</dt>
                                <dd>John Smith</dd>

                                <dt>Email</dt>
                                <dd>john@abcflooring.com.au</dd>

                                <dt>Mobile</dt>
                                <dd>04xx xxx xxx</dd>

                                <dt>Phone</dt>
                                <dd>02 xxxx xxxx</dd>
                            </dl>
                        </section>

                        <section>
                            <h3>Stock Location</h3>

                            <div className="account-location">
                                <MapPin />
                                <strong>Melbourne</strong>
                            </div>

                            <p className="location-note">
                                Your region is locked after registration and cannot be changed. Inventory, pricing and promotions are based on this region.
                            </p>

                            <h3>Account</h3>
                            <dl>
                                <dt>Outstanding</dt><dd>$12,752.00</dd>
                                <dt>Overdue</dt><dd className="account-overdue">$2,420.00</dd>
                                <dt>Payment Terms</dt><dd>30 Days</dd>
                            </dl>

                            <h3>Login & Security</h3>

                            <dl>
                                <dt>Email</dt>
                                <dd>john@abcflooring.com.au</dd>

                                <dt>Password</dt>
                                <dd>••••••••</dd>
                            </dl>

                            <button className="outline-copper-button">
                                Change Password
                            </button>
                        </section>
                    </div>
                </section>
            </main>
        </>
    );
}