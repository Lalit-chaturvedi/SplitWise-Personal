// ── Currency helpers ─────────────────────────────────────────
export const fmt = (amount, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);

// ── Token helpers ─────────────────────────────────────────────
export const generateToken = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

// ── Split calculation ─────────────────────────────────────────
/**
 * Given expenses array and members array, returns a balance map
 * and a minimal set of "who pays whom" transactions.
 *
 * expenses: [{ paidBy: uid, amount: number, splitAmong: [uid] }]
 * members:  [{ uid, displayName }]
 */
export function computeBalances(expenses, members) {
  const balances = {};
  members.forEach((m) => (balances[m.uid] = 0));

  expenses.forEach(({ paidBy, amount, splitAmong }) => {
    if (!splitAmong || splitAmong.length === 0) return;
    const share = amount / splitAmong.length;
    balances[paidBy] = (balances[paidBy] || 0) + amount;
    splitAmong.forEach((uid) => {
      balances[uid] = (balances[uid] || 0) - share;
    });
  });

  // Minimise transactions (greedy)
  const debtors = Object.entries(balances)
    .filter(([, v]) => v < -0.01)
    .map(([uid, v]) => ({ uid, amount: -v }))
    .sort((a, b) => b.amount - a.amount);

  const creditors = Object.entries(balances)
    .filter(([, v]) => v > 0.01)
    .map(([uid, v]) => ({ uid, amount: v }))
    .sort((a, b) => b.amount - a.amount);

  const transactions = [];
  let i = 0,
    j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amount, creditors[j].amount);
    transactions.push({ from: debtors[i].uid, to: creditors[j].uid, amount: pay });
    debtors[i].amount -= pay;
    creditors[j].amount -= pay;
    if (debtors[i].amount < 0.01) i++;
    if (creditors[j].amount < 0.01) j++;
  }

  return { balances, transactions };
}

// ── Category helpers ──────────────────────────────────────────
export const TRAVEL_CATEGORIES = [
  { id: "transport", label: "Transport", icon: "✈️" },
  { id: "accommodation", label: "Stay", icon: "🏨" },
  { id: "food", label: "Food & Drinks", icon: "🍽️" },
  { id: "activities", label: "Activities", icon: "🎭" },
  { id: "shopping", label: "Shopping", icon: "🛍️" },
  { id: "visa", label: "Visa & Docs", icon: "📄" },
  { id: "insurance", label: "Insurance", icon: "🛡️" },
  { id: "misc", label: "Misc", icon: "💰" },
];

export const INDUSTRY_CATEGORIES = [
  { id: "supplies", label: "Supplies", icon: "📦" },
  { id: "meals", label: "Team Meals", icon: "🍕" },
  { id: "travel", label: "Business Travel", icon: "🚆" },
  { id: "equipment", label: "Equipment", icon: "🖥️" },
  { id: "software", label: "Software", icon: "💻" },
  { id: "marketing", label: "Marketing", icon: "📣" },
  { id: "client", label: "Client Entertainment", icon: "🤝" },
  { id: "misc", label: "Misc", icon: "💰" },
];

export const ALL_CATEGORIES = [
  ...TRAVEL_CATEGORIES,
  ...INDUSTRY_CATEGORIES.filter((c) => !TRAVEL_CATEGORIES.find((t) => t.id === c.id)),
];

export function getCategoryLabel(id, type = "travel") {
  const list = type === "travel" ? TRAVEL_CATEGORIES : INDUSTRY_CATEGORIES;
  return list.find((c) => c.id === id) || { label: id, icon: "💰" };
}

// ── Date helpers ──────────────────────────────────────────────
export const relativeTime = (ts) => {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};
