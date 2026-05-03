import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function AuthPage() {
  const { loginGoogle, loginEmail, registerEmail } = useAuth();
  const [mode, setMode] = useState("login"); // login | register
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await loginEmail(form.email, form.password);
      } else {
        if (!form.name.trim()) throw new Error("Name is required");
        await registerEmail(form.email, form.password, form.name.trim());
      }
    } catch (err) {
      setError(err.message.replace("Firebase: ", "").replace(/\(auth.*\)\.?/, ""));
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await loginGoogle();
    } catch (err) {
      setError(err.message.replace("Firebase: ", "").replace(/\(auth.*\)\.?/, ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-logo">✂</span>
          <h1>SplitByKittu</h1>
          <p>Split smart. Travel together.</p>
        </div>

        <div className="auth-tabs">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => { setMode("login"); setError(""); }}
          >
            Sign In
          </button>
          <button
            className={mode === "register" ? "active" : ""}
            onClick={() => { setMode("register"); setError(""); }}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={submit} className="auth-form">
          {mode === "register" && (
            <div className="field">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Kittu Sharma"
                value={form.name}
                onChange={handle("name")}
                required
              />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={handle("email")}
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handle("password")}
              required
              minLength={6}
            />
          </div>

          {error && <p className="auth-error">⚠ {error}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <button className="btn-google" onClick={googleLogin} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.6 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.6-8 19.6-20 0-1.3-.1-2.7-.4-4z"/>
            <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 15.1 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.3C29.3 35.3 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.6 39.6 16.3 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6.2 5.3c-.4.3 6.8-5 6.8-14.8 0-1.3-.1-2.7-.4-4z"/>
          </svg>
          Continue with Google
        </button>

        <p className="auth-footer">
          By continuing you agree to our Terms & Privacy Policy.
        </p>
      </div>
    </div>
  );
}
