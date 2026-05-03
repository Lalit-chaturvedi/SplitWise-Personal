import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useMyGroups, createGroup, joinGroupByToken } from "../hooks/useFirestore";
import { fmt } from "../utils/helpers";

export default function Dashboard({ onOpenGroup, onProfile }) {
  const { user, profile } = useAuth();
  const { groups, loading } = useMyGroups(user?.uid);
  const [modal, setModal] = useState(null); // null | "create" | "join"
  const [joinToken, setJoinToken] = useState("");
  const [form, setForm] = useState({ name: "", description: "", type: "travel", currency: "INR" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const handle = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const doCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setBusy(true);
    setErr("");
    try {
      const { id, token } = await createGroup(
        { uid: user.uid, displayName: profile?.displayName || user.displayName, email: user.email, photoURL: user.photoURL },
        form
      );
      setModal(null);
      setForm({ name: "", description: "", type: "travel", currency: "INR" });
      setTimeout(() => onOpenGroup(id), 200);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const doJoin = async (e) => {
    e.preventDefault();
    if (!joinToken.trim()) return;
    setBusy(true);
    setErr("");
    try {
      const group = await joinGroupByToken(
        { uid: user.uid, displayName: profile?.displayName || user.displayName, email: user.email, photoURL: user.photoURL },
        joinToken
      );
      setModal(null);
      setJoinToken("");
      setTimeout(() => onOpenGroup(group.id), 200);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const travelGroups = groups.filter((g) => g.type === "travel");
  const industryGroups = groups.filter((g) => g.type === "industry");

  return (
    <div className="page">
      {/* Header */}
      <header className="dash-header">
        <div>
          <h2>SplitVerse</h2>
          <p className="dash-sub">Hey {profile?.displayName?.split(" ")[0] || "there"} 👋</p>
        </div>
        <button className="avatar-btn" onClick={onProfile}>
          {profile?.photoURL
            ? <img src={profile.photoURL} alt="" />
            : <span>{(profile?.displayName || user?.email || "U")[0].toUpperCase()}</span>}
        </button>
      </header>

      {/* Actions */}
      <div className="dash-actions">
        <button className="action-card accent" onClick={() => { setModal("create"); setErr(""); }}>
          <span>＋</span>
          <p>New Group</p>
        </button>
        <button className="action-card" onClick={() => { setModal("join"); setErr(""); }}>
          <span>🔗</span>
          <p>Join via Token</p>
        </button>
      </div>

      {/* Groups */}
      {loading ? (
        <div className="loader-wrap"><div className="loader" /></div>
      ) : groups.length === 0 ? (
        <div className="empty-state">
          <span>✈️</span>
          <h3>No groups yet</h3>
          <p>Create a group for your next trip or project</p>
        </div>
      ) : (
        <>
          {travelGroups.length > 0 && (
            <section className="group-section">
              <h3 className="section-title">✈️ Travel Groups</h3>
              {travelGroups.map((g) => (
                <GroupCard key={g.id} group={g} uid={user.uid} onClick={() => onOpenGroup(g.id)} />
              ))}
            </section>
          )}
          {industryGroups.length > 0 && (
            <section className="group-section">
              <h3 className="section-title">💼 Industry / Work Groups</h3>
              {industryGroups.map((g) => (
                <GroupCard key={g.id} group={g} uid={user.uid} onClick={() => onOpenGroup(g.id)} />
              ))}
            </section>
          )}
        </>
      )}

      {/* Create Modal */}
      {modal === "create" && (
        <Modal title="Create a Group" onClose={() => setModal(null)}>
          <form onSubmit={doCreate}>
            <div className="field">
              <label>Group Name</label>
              <input placeholder="Goa Trip 2025" value={form.name} onChange={handle("name")} required />
            </div>
            <div className="field">
              <label>Description (optional)</label>
              <input placeholder="Beach vacation with friends" value={form.description} onChange={handle("description")} />
            </div>
            <div className="field">
              <label>Type</label>
              <select value={form.type} onChange={handle("type")}>
                <option value="travel">✈️ Travel</option>
                <option value="industry">💼 Industry / Work</option>
              </select>
            </div>
            <div className="field">
              <label>Currency</label>
              <select value={form.currency} onChange={handle("currency")}>
                <option value="INR">₹ Indian Rupee (INR)</option>
                <option value="USD">$ US Dollar (USD)</option>
                <option value="EUR">€ Euro (EUR)</option>
                <option value="GBP">£ British Pound (GBP)</option>
                <option value="SGD">S$ Singapore Dollar (SGD)</option>
                <option value="AED">د.إ UAE Dirham (AED)</option>
              </select>
            </div>
            {err && <p className="auth-error">⚠ {err}</p>}
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? "Creating…" : "Create Group"}
            </button>
          </form>
        </Modal>
      )}

      {/* Join Modal */}
      {modal === "join" && (
        <Modal title="Join a Group" onClose={() => setModal(null)}>
          <p className="modal-hint">Ask the group admin for the 6-character invite token.</p>
          <form onSubmit={doJoin}>
            <div className="field">
              <label>Invite Token</label>
              <input
                placeholder="e.g. AB12CD"
                value={joinToken}
                onChange={(e) => setJoinToken(e.target.value.toUpperCase())}
                maxLength={6}
                style={{ fontFamily: "monospace", fontSize: "1.4rem", letterSpacing: "0.3em", textAlign: "center" }}
                required
              />
            </div>
            {err && <p className="auth-error">⚠ {err}</p>}
            <button type="submit" className="btn-primary" disabled={busy || joinToken.length < 6}>
              {busy ? "Joining…" : "Join Group"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function GroupCard({ group, uid, onClick }) {
  const isAdmin = group.createdBy === uid;
  return (
    <button className="group-card" onClick={onClick}>
      <div className="group-card-icon">{group.type === "travel" ? "✈️" : "💼"}</div>
      <div className="group-card-info">
        <div className="group-card-name">{group.name}</div>
        <div className="group-card-meta">
          {group.members?.length || 1} member{(group.members?.length || 1) !== 1 ? "s" : ""} ·{" "}
          {group.currency}
          {group.settledAt && <span className="settled-badge"> · Settled ✓</span>}
        </div>
      </div>
      <div className="group-card-arrow">›</div>
    </button>
  );
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
