import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const upsertProfile = async (firebaseUser, extra = {}) => {
    const ref = doc(db, "users", firebaseUser.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const data = {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || extra.displayName || "User",
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL || null,
        createdAt: serverTimestamp(),
        currency: "INR",
        ...extra,
      };
      await setDoc(ref, data);
      setProfile(data);
    } else {
      setProfile(snap.data());
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) await upsertProfile(u);
      else setProfile(null);
      setLoading(false);
    });
    return unsub;
  }, []);

  const loginGoogle = () => signInWithPopup(auth, googleProvider);

  const loginEmail = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const registerEmail = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    await upsertProfile(cred.user, { displayName });
    return cred;
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, loginGoogle, loginEmail, registerEmail, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
