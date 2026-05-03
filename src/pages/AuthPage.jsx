import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function AuthPage() {
  const { loginGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogle = async () => {
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
          <span className="auth-logo">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="authLg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6c63ff"/>
                  <stop offset="1" stopColor="#ff6584"/>
                </linearGradient>
              </defs>
              <rect width="64" height="64" rx="18" fill="url(#authLg)"/>
              <rect x="1" y="1" width="62" height="32" rx="18" fill="white" fillOpacity="0.08"/>
              <circle cx="32" cy="15" r="5" fill="white"/>
              <path d="M32 20 L32 33" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
              <path d="M32 33 L19 51" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
              <path d="M32 33 L45 51" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
              <circle cx="19" cy="51" r="4.5" fill="white"/>
              <circle cx="45" cy="51" r="4.5" fill="white"/>
              <circle cx="52" cy="11" r="2" fill="white" fillOpacity="0.55"/>
              <circle cx="11" cy="13" r="1.5" fill="white" fillOpacity="0.35"/>
            </svg>
          </span>
          <h1>SplitVerse</h1>
          <p>Split smart. Travel together.</p>
        </div>

        {error && <p className="auth-error">⚠ {error}</p>}

        <button className="btn-google" onClick={handleGoogle} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.6 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.6-8 19.6-20 0-1.3-.1-2.7-.4-4z"/>
            <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 15.1 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.3C29.3 35.3 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.6 39.6 16.3 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6.2 5.3c-.4.3 6.8-5 6.8-14.8 0-1.3-.1-2.7-.4-4z"/>
          </svg>
          {loading ? "Signing in…" : "Continue with Google"}
        </button>

        <p className="auth-footer">
          By continuing you agree to our Terms & Privacy Policy.
        </p>
      </div>
    </div>
  );
}
