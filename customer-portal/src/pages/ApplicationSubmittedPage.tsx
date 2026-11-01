import { Link, Navigate } from "react-router-dom";

import { getApplication } from "../data/localAccount";
export default function ApplicationSubmittedPage() {
    const application=getApplication();
    if(!application) return <Navigate to="/register" replace/>;
    return (
        <main className="submitted-page">
            <div className="submitted-card">
                <div className="brand dark-brand">
                    <span className="brand-mark">HT</span>
                    HTT FLOORING
                </div>

                <h1>
                    Application
                    <br />
                    received
                </h1>

                <p>
                    Thank you for applying for an
                    <br />
                    HTT Flooring trade account.
                </p>

                <div className="application-number">
                    <small>Application</small>
                    <strong>#{application.id}</strong>
                </div>

                <p>
                    Saved locally for {application.profile.businessName} ({application.profile.region}).<br/>Status: {application.status}.<br/>No application has been sent to HTT Flooring in this local preview.
                </p>

                <Link to="/" className="outline-copper-button">
                    Back to HTT Flooring
                </Link>
            </div>
        </main>
    );
}