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
          <span className="splash-logo">✂</span>
          <h1>SplitByKittu</h1>
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
