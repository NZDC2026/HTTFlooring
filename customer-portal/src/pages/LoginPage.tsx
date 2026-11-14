import { useRef, useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  defaultProfile,
  DEMO_PASSWORD,
  DEMO_RECOVERY,
  login,
  resetPassword,
  useLocalAccount,
} from "../services/account";

export default function LoginPage() {
  const submitting = useRef(false);
  const navigate = useNavigate(),
    location = useLocation();
  const { authenticated } = useLocalAccount();
  const [show, setShow] = useState(false),
    [reset, setReset] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const from = location.state?.from;
  const destination = typeof from === "string" && from.startsWith("/") && !from.startsWith("//") ? from : "/dashboard";
  // Store notifications and the submit handler must agree on the original return route.
  if (authenticated) return <Navigate to={destination} replace />;
  return (
    <main className="auth-layout">
      <section className="auth-image">
        <Link to="/" className="brand auth-brand">
          <span className="brand-mark">HT</span>HTT FLOORING
        </Link>
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
        <form
          className="auth-form"
          onSubmit={async (event) => {
            event.preventDefault();
            if (submitting.current) return;
            submitting.current = true;
            setBusy(true);
            setError("");
            setMessage("");
            const values = new FormData(event.currentTarget);
            try {
              if (reset) {
                if (values.get("password") !== values.get("confirm"))
                  throw new Error("Passwords do not match.");
                await resetPassword(
                  String(values.get("email")),
                  String(values.get("recovery")),
                  String(values.get("password")),
                );
                setReset(false);
                setMessage("Password updated. Log in with your new password.");
              } else {
                await login(
                  String(values.get("email")),
                  String(values.get("password")),
                  values.get("remember") === "on",
                );
                navigate(destination, { replace: true });
              }
            } catch (error) {
              setError(
                error instanceof Error
                  ? error.message
                  : "Unable to save locally. Check browser storage settings.",
              );
            } finally {
              submitting.current = false;
              setBusy(false);
            }
          }}
        >
          <h1>{reset ? "Reset password" : "Welcome back"}</h1>
          <h2>Customer Portal</h2>
          <p>
            {reset
              ? "Use your local recovery code to set a new password."
              : "Log in to check stock availability and invoices."}
          </p>
          <div className="local-notice">
            Local demo account: <strong>{defaultProfile.email}</strong>
            <br />
            Initial password: <strong>{DEMO_PASSWORD}</strong>
            {reset && (
              <>
                <br />
                Demo recovery code: <strong>{DEMO_RECOVERY}</strong>
              </>
            )}
            <br />
            Credentials and changes stay in this browser.
          </div>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          {message && (
            <p role="status" className="form-success">
              {message}
            </p>
          )}
          <label className="input">
            <Mail size={18} />
            <input
              aria-label="Email address"
              name="email"
              type="email"
              placeholder="Email address"
              autoComplete="username"
              required
            />
          </label>
          {reset && (
            <label className="input">
              <input
                aria-label="Recovery code"
                name="recovery"
                placeholder="Recovery code"
                required
              />
            </label>
          )}
          <label className="input">
            <LockKeyhole size={18} />
            <input
              aria-label={reset ? "New password" : "Password"}
              name="password"
              type={show ? "text" : "password"}
              placeholder={reset ? "New password (10+ characters)" : "Password"}
              autoComplete={reset ? "new-password" : "current-password"}
              minLength={reset ? 10 : 1}
              required
            />
            <button
              className="icon-button"
              type="button"
              aria-label={show ? "Hide password" : "Show password"}
              onClick={() => setShow(!show)}
            >
              {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </label>
          {reset && (
            <label className="input">
              <input
                aria-label="Confirm password"
                name="confirm"
                type="password"
                placeholder="Confirm new password"
                autoComplete="new-password"
                required
              />
            </label>
          )}
          <div className="login-options">
            {!reset && (
              <label>
                <input name="remember" type="checkbox" defaultChecked />{" "}
                Remember me
              </label>
            )}
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setReset(!reset);
                setError("");
                setMessage("");
              }}
            >
              {reset ? "Back to login" : "Forgot password?"}
            </button>
          </div>
          <button className="primary-button full" disabled={busy}>
            {busy ? "Please wait…" : reset ? "Reset password" : "Log In"}
          </button>
          <div className="register-link">
            <span>New to HTT Flooring?</span>
            <Link to="/register">Apply for customer access →</Link>
          </div>
        </form>
      </section>
    </main>
  );
}
