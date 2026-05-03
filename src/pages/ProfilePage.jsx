import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { useAuth } from "../contexts/AuthContext";
import { db, auth } from "../firebase";

export default function ProfilePage({ onBack }) {
  const { user, profile, logout } = useAuth();
  const [name, setName] = useState(profile?.displayName || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await updateProfile(auth.currentUser, { displayName: name.trim() });
      await updateDoc(doc(db, "users", user.uid), { displayName: name.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <header className="group-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <h2>My Profile</h2>
        <div />
      </header>

      <div className="profile-wrap">
        <div className="profile-avatar">
          {profile?.photoURL
            ? <img src={profile.photoURL} alt="" />
            : <span>{(profile?.displayName || user?.email || "U")[0].toUpperCase()}</span>}
        </div>
        <p className="profile-email">{user?.email}</p>

        <form onSubmit={save} className="profile-form">
          <div className="field">
            <label>Display Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saved ? "Saved ✓" : saving ? "Saving…" : "Save Changes"}
          </button>
        </form>

        <div className="profile-section">
          <h3>Account</h3>
          <div className="info-row"><span>Email</span><span>{user?.email}</span></div>
          <div className="info-row"><span>Auth Provider</span><span>{user?.providerData?.[0]?.providerId || "email"}</span></div>
        </div>

        <button className="btn-logout" onClick={logout}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
