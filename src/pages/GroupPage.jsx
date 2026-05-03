import React, { useState } from "react";
import { useGroup, useExpenses, addExpense, deleteExpense, settleGroup } from "../hooks/useFirestore";
import { useAuth } from "../contexts/AuthContext";
import { computeBalances, fmt, getCategoryLabel, TRAVEL_CATEGORIES, INDUSTRY_CATEGORIES, relativeTime } from "../utils/helpers";
import { Modal } from "./Dashboard";

export default function GroupPage({ groupId, onBack }) {
  const { user } = useAuth();
  const { group, loading: gLoading } = useGroup(groupId);
  const { expenses, loading: eLoading } = useExpenses(groupId);
  const [tab, setTab] = useState("expenses"); // expenses | balances | info
  const [showAdd, setShowAdd] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [showSettle, setShowSettle] = useState(false);
  const [busy, setBusy] = useState(false);

  if (gLoading) return <div className="loader-wrap"><div className="loader" /></div>;
  if (!group) return <div className="page"><p>Group not found.</p></div>;

  const categories = group.type === "travel" ? TRAVEL_CATEGORIES : INDUSTRY_CATEGORIES;
  const members = group.members || [];
  const { balances, transactions } = computeBalances(expenses, members);

  const myBalance = balances[user.uid] || 0;
  const isAdmin = group.createdBy === user.uid;

  const doSettle = async () => {
    setBusy(true);
    await settleGroup(groupId);
    setBusy(false);
    setShowSettle(false);
  };

  const totalSpent = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  return (
    <div className="page">
      {/* Header */}
      <header className="group-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <div className="group-header-info">
          <h2>{group.name}</h2>
          <p>{group.type === "travel" ? "✈️ Travel" : "💼 Industry"} · {group.currency}</p>
        </div>
        <div className="group-header-actions">
          <button className="icon-btn" title="Invite token" onClick={() => setShowToken(true)}>🔗</button>
        </div>
      </header>

      {/* Summary bar */}
      <div className="summary-bar">
        <div className="sum-item">
          <span className="sum-label">Total Spent</span>
          <span className="sum-value">{fmt(totalSpent, group.currency)}</span>
        </div>
        <div className="sum-item">
          <span className="sum-label">My Balance</span>
          <span className={`sum-value ${myBalance > 0.01 ? "pos" : myBalance < -0.01 ? "neg" : ""}`}>
            {myBalance > 0.01 ? "+" : ""}{fmt(myBalance, group.currency)}
          </span>
        </div>
        <div className="sum-item">
          <span className="sum-label">Members</span>
          <span className="sum-value">{members.length}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {["expenses", "balances", "info"].map((t) => (
          <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t === "expenses" ? "💳 Expenses" : t === "balances" ? "⚖️ Balances" : "ℹ️ Info"}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "expenses" && (
        <ExpensesTab
          expenses={expenses}
          members={members}
          currency={group.currency}
          uid={user.uid}
          groupId={groupId}
          isAdmin={isAdmin}
          loading={eLoading}
        />
      )}
      {tab === "balances" && (
        <BalancesTab
          balances={balances}
          transactions={transactions}
          members={members}
          currency={group.currency}
          uid={user.uid}
          isAdmin={isAdmin}
          settled={!!group.settledAt}
          onSettle={() => setShowSettle(true)}
        />
      )}
      {tab === "info" && (
        <InfoTab group={group} members={members} isAdmin={isAdmin} />
      )}

      {/* FAB */}
      {!group.settledAt && tab === "expenses" && (
        <button className="fab" onClick={() => setShowAdd(true)}>＋</button>
      )}

      {/* Add Expense Modal */}
      {showAdd && (
        <AddExpenseModal
          group={group}
          members={members}
          uid={user.uid}
          categories={categories}
          onClose={() => setShowAdd(false)}
        />
      )}

      {/* Token Modal */}
      {showToken && (
        <Modal title="Invite Token" onClose={() => setShowToken(false)}>
          <p className="modal-hint">Share this token with people to join your group.</p>
          <div className="token-display">{group.token}</div>
          <button
            className="btn-primary"
            onClick={() => navigator.clipboard?.writeText(group.token)}
          >
            Copy Token
          </button>
        </Modal>
      )}

      {/* Settle Modal */}
      {showSettle && (
        <Modal title="Mark as Settled?" onClose={() => setShowSettle(false)}>
          <p className="modal-hint">This will mark all debts as settled. You can still view the history.</p>
          <button className="btn-primary" onClick={doSettle} disabled={busy}>
            {busy ? "Settling…" : "Confirm & Settle"}
          </button>
        </Modal>
      )}
    </div>
  );
}

// ── Expenses Tab ──────────────────────────────────────────────
function ExpensesTab({ expenses, members, currency, uid, groupId, isAdmin, loading }) {
  const [delConfirm, setDelConfirm] = useState(null);

  const memberMap = Object.fromEntries(members.map((m) => [m.uid, m]));

  if (loading) return <div className="loader-wrap"><div className="loader" /></div>;
  if (expenses.length === 0)
    return (
      <div className="empty-state">
        <span>💳</span>
        <h3>No expenses yet</h3>
        <p>Tap ＋ to add the first expense</p>
      </div>
    );

  const doDelete = async (id) => {
    await deleteExpense(groupId, id);
    setDelConfirm(null);
  };

  return (
    <div className="expense-list">
      {expenses.map((exp) => {
        const payer = memberMap[exp.paidBy];
        const cat = getCategoryLabel(exp.category);
        const isMyExpense = exp.paidBy === uid;
        return (
          <div key={exp.id} className="expense-item">
            <div className="expense-icon">{cat.icon || "💰"}</div>
            <div className="expense-info">
              <div className="expense-title">{exp.description}</div>
              <div className="expense-meta">
                {cat.label} · Paid by {isMyExpense ? "you" : payer?.displayName || "?"}
                <span className="expense-time"> · {relativeTime(exp.createdAt)}</span>
              </div>
              <div className="expense-split-among">
                Split among: {(exp.splitAmong || []).map((id) => memberMap[id]?.displayName?.split(" ")[0] || "?").join(", ")}
              </div>
            </div>
            <div className="expense-right">
              <div className="expense-amount">{fmt(exp.amount, currency)}</div>
              {(isMyExpense || isAdmin) && (
                <button
                  className="del-btn"
                  onClick={() => setDelConfirm(exp.id)}
                  title="Delete"
                >
                  🗑
                </button>
              )}
            </div>
            {delConfirm === exp.id && (
              <div className="del-confirm">
                <span>Delete this expense?</span>
                <button onClick={() => doDelete(exp.id)}>Yes</button>
                <button onClick={() => setDelConfirm(null)}>No</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Balances Tab ──────────────────────────────────────────────
function BalancesTab({ balances, transactions, members, currency, uid, isAdmin, settled, onSettle }) {
  const memberMap = Object.fromEntries(members.map((m) => [m.uid, m]));

  return (
    <div className="balances-tab">
      <h3 className="section-title">Individual Balances</h3>
      {members.map((m) => {
        const bal = balances[m.uid] || 0;
        return (
          <div key={m.uid} className="balance-row">
            <div className="bal-avatar">
              {m.photoURL
                ? <img src={m.photoURL} alt="" />
                : <span>{(m.displayName || "?")[0].toUpperCase()}</span>}
            </div>
            <div className="bal-name">
              {m.displayName}{m.uid === uid ? " (you)" : ""}
            </div>
            <div className={`bal-amount ${bal > 0.01 ? "pos" : bal < -0.01 ? "neg" : "zero"}`}>
              {bal > 0.01 ? `gets back ${fmt(bal, currency)}` :
               bal < -0.01 ? `owes ${fmt(-bal, currency)}` :
               "settled ✓"}
            </div>
          </div>
        );
      })}

      {transactions.length > 0 && (
        <>
          <h3 className="section-title" style={{ marginTop: "1.5rem" }}>Suggested Payments</h3>
          {transactions.map((t, i) => (
            <div key={i} className="transaction-row">
              <span className="tx-from">{memberMap[t.from]?.displayName || t.from}</span>
              <span className="tx-arrow"> → </span>
              <span className="tx-to">{memberMap[t.to]?.displayName || t.to}</span>
              <span className="tx-amount">{fmt(t.amount, currency)}</span>
            </div>
          ))}
        </>
      )}

      {isAdmin && !settled && (
        <button className="btn-settle" onClick={onSettle}>
          ✓ Mark Group as Settled
        </button>
      )}
      {settled && <div className="settled-notice">✓ This group has been marked as settled.</div>}
    </div>
  );
}

// ── Info Tab ──────────────────────────────────────────────────
function InfoTab({ group, members, isAdmin }) {
  return (
    <div className="info-tab">
      <div className="info-section">
        <h3>Group Details</h3>
        {group.description && <p>{group.description}</p>}
        <div className="info-row"><span>Type</span><span>{group.type === "travel" ? "✈️ Travel" : "💼 Industry"}</span></div>
        <div className="info-row"><span>Currency</span><span>{group.currency}</span></div>
        <div className="info-row"><span>Invite Token</span><code>{group.token}</code></div>
      </div>
      <div className="info-section">
        <h3>Members ({members.length})</h3>
        {members.map((m) => (
          <div key={m.uid} className="member-row">
            <div className="bal-avatar">
              {m.photoURL
                ? <img src={m.photoURL} alt="" />
                : <span>{(m.displayName || "?")[0].toUpperCase()}</span>}
            </div>
            <div>
              <div className="member-name">{m.displayName}</div>
              <div className="member-email">{m.email}</div>
            </div>
            {m.role === "admin" && <span className="role-badge">Admin</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Add Expense Modal ─────────────────────────────────────────
function AddExpenseModal({ group, members, uid, categories, onClose }) {
  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: categories[0]?.id || "misc",
    paidBy: uid,
    splitAmong: members.map((m) => m.uid),
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const handle = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const toggleSplit = (memberId) => {
    setForm((f) => ({
      ...f,
      splitAmong: f.splitAmong.includes(memberId)
        ? f.splitAmong.filter((id) => id !== memberId)
        : [...f.splitAmong, memberId],
    }));
  };

  const perPerson =
    form.splitAmong.length > 0 && form.amount
      ? parseFloat(form.amount) / form.splitAmong.length
      : 0;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) return setErr("Description required");
    if (!form.amount || isNaN(form.amount) || parseFloat(form.amount) <= 0) return setErr("Valid amount required");
    if (form.splitAmong.length === 0) return setErr("Select at least one person");
    setBusy(true);
    try {
      await addExpense(group.id, {
        description: form.description.trim(),
        amount: parseFloat(form.amount),
        category: form.category,
        paidBy: form.paidBy,
        splitAmong: form.splitAmong,
        currency: group.currency,
      });
      onClose();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="Add Expense" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="field">
          <label>Description</label>
          <input placeholder="Hotel booking" value={form.description} onChange={handle("description")} required />
        </div>
        <div className="field">
          <label>Amount ({group.currency})</label>
          <input type="number" min="0.01" step="0.01" placeholder="0.00" value={form.amount} onChange={handle("amount")} required />
        </div>
        <div className="field">
          <label>Category</label>
          <select value={form.category} onChange={handle("category")}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Paid by</label>
          <select value={form.paidBy} onChange={handle("paidBy")}>
            {members.map((m) => (
              <option key={m.uid} value={m.uid}>{m.displayName}{m.uid === uid ? " (you)" : ""}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Split among</label>
          <div className="split-members">
            {members.map((m) => (
              <label key={m.uid} className={`split-chip ${form.splitAmong.includes(m.uid) ? "selected" : ""}`}>
                <input
                  type="checkbox"
                  checked={form.splitAmong.includes(m.uid)}
                  onChange={() => toggleSplit(m.uid)}
                  style={{ display: "none" }}
                />
                {m.displayName.split(" ")[0]}
              </label>
            ))}
          </div>
          {perPerson > 0 && (
            <p className="per-person">
              {fmt(perPerson, group.currency)} per person
            </p>
          )}
        </div>
        {err && <p className="auth-error">⚠ {err}</p>}
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "Adding…" : "Add Expense"}
        </button>
      </form>
    </Modal>
  );
}
