import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  createUserWithEmailAndPassword,
  updatePassword,
  sendPasswordResetEmail,
  PhoneAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// ─── Emails con acceso de administrador ──────────────────────────────────────
// Agrega aquí cada email admin. La cuenta se crea en Firebase Console.
export const ADMIN_EMAILS = [
  "d0ct0renomah@gmail.com",  // admin principal
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
  const iniciarPhoneAuth = async (telefono) => {
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
    const confirmationResult = await signInWithPhoneNumber(auth, telefono, window._recaptchaVerifier);
    // Guardar verificationId para usarlo después en verifyPhoneOTP
    window._verificationId = confirmationResult.verificationId;
    return confirmationResult;
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

    // ── Nuevas funciones de registro y login ───────────────────────────────────────
  const registerWithEmail = (email, password, datosPerfil) => {
    return createUserWithEmailAndPassword(auth, email, password)
      .then((cred) => {
        const uid = cred.user.uid;
        return guardarPerfil(uid, { ...datosPerfil, email });
      });
  };

  const registerWithPhoneAndPassword = async (telefono, verificationId, code, password, datosPerfil) => {
    // Verificar OTP
    const credential = PhoneAuthProvider.credential(verificationId, code);
    const userCred = await signInWithCredential(auth, credential);
    // Asignar contraseña
    await updatePassword(userCred.user, password);
    const uid = userCred.user.uid;
    await guardarPerfil(uid, { ...datosPerfil, telefono });
    return uid;
  };

  const loginWithEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);

  const loginWithPhone = async (telefono, verificationId, code) => {
    const credential = PhoneAuthProvider.credential(verificationId, code);
    return signInWithCredential(auth, credential);
  };

  // Verificar OTP y crear cuenta con nombre, teléfono y contraseña
  const verifyPhoneOTP = async (code, password, nombre) => {
    if (!window._verificationId) {
      throw new Error('Verification ID no está disponible. Inicie la verificación primero.');
    }
    // Crear credencial a partir del código OTP
    const credential = PhoneAuthProvider.credential(window._verificationId, code);
    // Autenticar al usuario
    const userCred = await signInWithCredential(auth, credential);
    // Asignar contraseña
    await updatePassword(userCred.user, password);
    // Guardar perfil en Firestore
    const uid = userCred.user.uid;
    await guardarPerfil(uid, { nombre, telefono: userCred.user.phoneNumber });
    return uid;
  };

  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  const isAdmin = !!user && ADMIN_EMAILS.includes(user.email);
  const isCliente = !!user && !isAdmin;

  return (
    <AuthContext.Provider value={{
      user, perfil, isAdmin, isCliente, loading,
      loginAdmin, logout, iniciarPhoneAuth, guardarPerfil,
      registerWithEmail,
      registerWithPhoneAndPassword,
      loginWithEmail,
      loginWithPhone,
      verifyPhoneOTP,
      resetPassword,
    }}>      {/* Div oculto donde Firebase ancla el reCAPTCHA invisible */}
      <div id="recaptcha-container" />
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
