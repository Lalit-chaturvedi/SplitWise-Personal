import React, { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import GroupPage from "./pages/GroupPage";
import ProfilePage from "./pages/ProfilePage";

function AppRoutes() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState("dashboard"); // dashboard | group | profile
  const [activeGroupId, setActiveGroupId] = useState(null);

  if (loading) {
    return (
      <div className="splash">
        <div className="splash-inner">
          <span className="splash-logo">
            <svg width="80" height="80" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="splashLg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6c63ff"/>
                  <stop offset="1" stopColor="#ff6584"/>
                </linearGradient>
              </defs>
              <rect width="64" height="64" rx="18" fill="url(#splashLg)"/>
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
          <div className="loader" />
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  if (page === "group" && activeGroupId)
    return (
      <GroupPage
        groupId={activeGroupId}
        onBack={() => { setPage("dashboard"); setActiveGroupId(null); }}
      />
    );

  if (page === "profile")
    return <ProfilePage onBack={() => setPage("dashboard")} />;

  return (
    <Dashboard
      onOpenGroup={(id) => { setActiveGroupId(id); setPage("group"); }}
      onProfile={() => setPage("profile")}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
