import { Eye, LockKeyhole, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
    const navigate = useNavigate();

    return (
        <main className="auth-layout">
            <section className="auth-image">
                <div className="brand auth-brand">
                    <span className="brand-mark">HT</span>
                    HTT FLOORING
                </div>

                <div className="auth-message">
                    <h2>
                        The right
                        <br />
                        products,
                        <br />
                        closer to <em>you.</em>
                    </h2>

                    <div className="copper-line" />

                    <p>
                        Quality floors.
                        <br />
                        Stronger businesses.
                    </p>
                </div>
            </section>

            <section className="auth-panel">
                <div className="auth-form">
                    <h1>Welcome back</h1>
                    <h2>Customer Portal</h2>

                    <p>Log in to check stock availability across your locations.</p>

                    <label className="input">
                        <Mail size={18} />
                        <input type="email" placeholder="Email address" />
                    </label>

                    <label className="input">
                        <LockKeyhole size={18} />
                        <input type="password" placeholder="Password" />
                        <Eye size={17} />
                    </label>

                    <div className="login-options">
                        <label>
                            <input type="checkbox" defaultChecked /> Remember me
                        </label>

                        <a>Forgot password?</a>
                    </div>

                    <button
                        className="primary-button full"
                        onClick={() => navigate("/dashboard")}
                    >
                        Log In
                    </button>

                    <div className="register-link">
                        <span>New to HTT Flooring?</span>
                        <Link to="/register">Apply for customer access →</Link>
                    </div>
                </div>
            </section>
        </main>
    );
}