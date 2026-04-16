import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { activityTracker } from "../lib/activityTracker";

// ─── Emails con acceso de administrador (respaldo si Firestore falla) ─────────
export const ADMIN_EMAILS = ["d0ct0renomah@gmail.com"];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setPerfil_user]  = useState(null);
  const [perfil, setPerfil]     = useState(null);
  const [rol, setRol]           = useState(null); // "admin" | "cliente" | null
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setPerfil_user(u);
      if (u) {
        try {
          const snap = await getDoc(doc(db, "usuarios", u.uid));
          if (snap.exists()) {
            const data = snap.data();
            setPerfil(data);
            setRol(data.rol || (ADMIN_EMAILS.includes(u.email) ? "admin" : "cliente"));
          } else {
            setPerfil(null);
            setRol(ADMIN_EMAILS.includes(u.email) ? "admin" : "cliente");
          }
        } catch {
          setPerfil(null);
          setRol(ADMIN_EMAILS.includes(u.email) ? "admin" : "cliente");
        }
      } else {
        setPerfil(null);
        setRol(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // ── Registro de cliente con verificación de email ──────────────────────────
  const registro = async ({ nombre, apellidos, email, telefono, password }) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await sendEmailVerification(cred.user);
    await setDoc(doc(db, "usuarios", cred.user.uid), {
      uid:           cred.user.uid,
      nombre:        `${nombre.trim()} ${(apellidos || "").trim()}`.trim(),
      email:         email.trim(),
      telefono:      telefono || "",
      rol:           "cliente",
      emailVerified: false,
      activo:        true,
      fechaRegistro: serverTimestamp(),
      ultimaActividad: serverTimestamp(),
    });
    return cred.user;
  };

  // ── Login con verificación de email ───────────────────────────────────────
  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    if (!cred.user.emailVerified && !ADMIN_EMAILS.includes(email.trim())) {
      await signOut(auth);
      throw { code: "auth/email-not-verified" };
    }
    activityTracker.login(cred.user.uid);
    // Actualizar ultimaActividad
    try {
      await setDoc(doc(db, "usuarios", cred.user.uid), { ultimaActividad: serverTimestamp() }, { merge: true });
    } catch { /* silencioso */ }
    return cred.user;
  };

  // ── Login admin (sin requerir verificación de email) ─────────────────────
  const loginAdmin = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    if (user) activityTracker.logout(user.uid);
    setPerfil(null);
    setRol(null);
    await signOut(auth);
  };

  // ── Reenviar email de verificación ────────────────────────────────────────
  const reenviarVerificacion = () => {
    if (auth.currentUser) return sendEmailVerification(auth.currentUser);
    throw new Error("No hay sesión activa");
  };

  // ── Recuperar contraseña ──────────────────────────────────────────────────
  const recuperarPassword = (email) => sendPasswordResetEmail(auth, email);

  // ── Guardar perfil (compatibilidad con código existente) ──────────────────
  const guardarPerfil = async (uid, datos) => {
    const ref  = doc(db, "usuarios", uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await setDoc(ref, { ultimaActividad: serverTimestamp() }, { merge: true });
      setPerfil(snap.data());
    } else {
      const nuevo = {
        uid,
        nombre:   datos.nombre  ? datos.nombre.trim() : "",
        telefono: datos.telefono || "",
        email:    datos.email   || "",
        rol:      "cliente",
        activo:   true,
        fechaRegistro:    serverTimestamp(),
        ultimaActividad:  serverTimestamp(),
      };
      await setDoc(ref, nuevo);
      setPerfil(nuevo);
    }
    return snap.exists();
  };

  const isAdmin   = rol === "admin"   || ADMIN_EMAILS.includes(user?.email);
  const isCliente = rol === "cliente" && !isAdmin;

  return (
    <AuthContext.Provider value={{
      user, perfil, rol, isAdmin, isCliente, loading,
      registro, login, loginAdmin, logout,
      reenviarVerificacion, recuperarPassword, guardarPerfil,
    }}>
      <div id="recaptcha-container" />
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
