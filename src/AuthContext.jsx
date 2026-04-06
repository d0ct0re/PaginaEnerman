import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "./firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// ─── Emails con acceso de administrador ──────────────────────────────────────
// Agrega aquí cada email admin. La cuenta se crea en Firebase Console.
export const ADMIN_EMAILS = [
  "d0ct0renomah@gmail.com",  // admin principal
  "doctorenomad@gmail.com",  // variante por si acaso
  // "director@enerman.com", // ← descomenta cuando crees la cuenta del director
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [perfil, setPerfil]   = useState(null); // datos del cliente en Firestore
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u && !ADMIN_EMAILS.includes(u.email)) {
        // Cargar perfil del cliente desde Firestore
        try {
          const snap = await getDoc(doc(db, "usuarios", u.uid));
          setPerfil(snap.exists() ? snap.data() : null);
        } catch {
          setPerfil(null);
        }
      } else {
        setPerfil(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // ── Login admin (email + contraseña) ────────────────────────────────────────
  const loginAdmin = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  // ── Logout (cualquier usuario) ───────────────────────────────────────────────
  const logout = async () => {
    setPerfil(null);
    await signOut(auth);
  };

  // ── Iniciar verificación por teléfono (envía SMS) ────────────────────────────
  const iniciarPhoneAuth = (telefono) => {
    // Recaptcha invisible — se crea una sola vez por sesión
    if (!window._recaptchaVerifier) {
      window._recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {},
          "expired-callback": () => {
            window._recaptchaVerifier = null;
          },
        }
      );
    }
    return signInWithPhoneNumber(auth, telefono, window._recaptchaVerifier);
  };

  // ── Guardar/actualizar perfil de cliente en Firestore ───────────────────────
  const guardarPerfil = async (uid, datos) => {
    const ref = doc(db, "usuarios", uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      // Ya existe — solo actualizar ultimaActividad
      await setDoc(ref, { ultimaActividad: serverTimestamp() }, { merge: true });
      setPerfil(snap.data());
    } else {
      // Nuevo cliente
      const nuevo = {
        nombre: datos.nombre ? datos.nombre.trim() : "",
        telefono: datos.telefono || "",
        ...(datos.email ? { email: datos.email } : {}),
        fechaRegistro: serverTimestamp(),
        ultimaActividad: serverTimestamp(),
        activo: true,
      };
      await setDoc(ref, nuevo);
      setPerfil(nuevo);
    }
    return snap.exists(); // true = ya existía (login), false = nuevo registro
  };

  const isAdmin = !!user && ADMIN_EMAILS.includes(user.email);
  const isCliente = !!user && !isAdmin;

  return (
    <AuthContext.Provider value={{
      user, perfil, isAdmin, isCliente, loading,
      loginAdmin, logout, iniciarPhoneAuth, guardarPerfil,
    }}>
      {/* Div oculto donde Firebase ancla el reCAPTCHA invisible */}
      <div id="recaptcha-container" />
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
