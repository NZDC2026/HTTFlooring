import { Link } from "react-router-dom";

export default function ApplicationSubmittedPage() {
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
                    <strong>#APP-20261002-0182</strong>
                </div>

                <p>
                    Your application is currently under review.
                    <br />
                    We will contact you once your account
                    <br />
                    has been approved.
                </p>

                <Link to="/" className="outline-copper-button">
                    Back to HTT Flooring
                </Link>
            </div>
        </main>
    );
}