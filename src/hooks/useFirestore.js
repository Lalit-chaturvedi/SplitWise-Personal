import { useState, useEffect } from "react";
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  arrayUnion,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import { generateToken } from "../utils/helpers";

// ── Groups ────────────────────────────────────────────────────

export function useMyGroups(uid) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, "groups"), where("memberIds", "array-contains", uid));
    const unsub = onSnapshot(q, (snap) => {
      setGroups(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  return { groups, loading };
}

export async function createGroup(user, { name, description, type, currency }) {
  const token = generateToken();
  const ref = await addDoc(collection(db, "groups"), {
    name,
    description: description || "",
    type, // "travel" | "industry"
    currency: currency || "INR",
    token,
    createdBy: user.uid,
    memberIds: [user.uid],
    members: [
      {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL || null,
        role: "admin",
        joinedAt: new Date().toISOString(),
      },
    ],
    createdAt: serverTimestamp(),
    settledAt: null,
  });
  return { id: ref.id, token };
}

export async function joinGroupByToken(user, token) {
  const q = query(collection(db, "groups"), where("token", "==", token.trim().toUpperCase()));
  const snap = await getDocs(q);
  if (snap.empty) throw new Error("Invalid token. No group found.");
  const groupDoc = snap.docs[0];
  const group = groupDoc.data();
  if (group.memberIds.includes(user.uid)) throw new Error("You are already in this group.");
  await updateDoc(doc(db, "groups", groupDoc.id), {
    memberIds: arrayUnion(user.uid),
    members: arrayUnion({
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL || null,
      role: "member",
      joinedAt: new Date().toISOString(),
    }),
  });
  return { id: groupDoc.id, ...group };
}

export function useGroup(groupId) {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) return;
    const unsub = onSnapshot(doc(db, "groups", groupId), (snap) => {
      setGroup(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setLoading(false);
    });
    return unsub;
  }, [groupId]);

  return { group, loading };
}

// ── Expenses ──────────────────────────────────────────────────

export function useExpenses(groupId) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) return;
    const q = query(
      collection(db, "groups", groupId, "expenses"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setExpenses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [groupId]);

  return { expenses, loading };
}

export async function addExpense(groupId, expense) {
  await addDoc(collection(db, "groups", groupId, "expenses"), {
    ...expense,
    createdAt: serverTimestamp(),
  });
}

export async function deleteExpense(groupId, expenseId) {
  await deleteDoc(doc(db, "groups", groupId, "expenses", expenseId));
}

export async function settleGroup(groupId) {
  await updateDoc(doc(db, "groups", groupId), { settledAt: serverTimestamp() });
}
