import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

function registrarIntento(exito, email) {
  try {
    addDoc(collection(db, "admin_access_log"), {
      exito, email, paso: "login",
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent,
    });
  } catch { /* silencioso */ }
}

export default function AdminAuthPage() {
  const navigate = useNavigate();
  const { loginAdmin, isAdmin, logout } = useAuth();

  const [email, setEmail]   = useState("");
  const [pass, setPass]     = useState("");
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verificar que viene del gate
    if (!sessionStorage.getItem("enr_gate_ok")) {
      navigate("/enr-gate", { replace: true });
      return;
    }
    if (isAdmin) navigate("/enr-admin", { replace: true });
  }, [isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginAdmin(email.trim(), pass);
      // isAdmin se actualiza vía onAuthStateChanged → useEffect redirige
      registrarIntento(true, email.trim());
    } catch (err) {
      registrarIntento(false, email.trim());
      const msgs = {
        "auth/invalid-credential": "Credenciales incorrectas.",
        "auth/too-many-requests":  "Demasiados intentos. Espera unos minutos.",
        "auth/user-not-found":     "No existe cuenta con ese correo.",
        "auth/wrong-password":     "Contraseña incorrecta.",
      };
      setError(msgs[err.code] || "Error de autenticación.");
      // Si no es admin, forzar logout
      try { await logout(); } catch { /* silencioso */ }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        <p style={styles.label}>ENERMAN — Panel Administrativo</p>
        <h1 style={styles.title}>Identificación</h1>
        <p style={styles.sub}>Ingresa tus credenciales de administrador.</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email" required autoFocus value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            style={styles.input}
          />
          <input
            type="password" required value={pass}
            onChange={e => setPass(e.target.value)}
            placeholder="Contraseña"
            style={{ ...styles.input, marginBottom: 0 }}
          />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? "Verificando..." : "Acceder"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh", background: "#0a0a0a",
    display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
  },
  card: {
    background: "#111", border: "1px solid #1e1e1e", borderRadius: 12,
    padding: "40px 36px", width: "100%", maxWidth: 380,
  },
  label: { color: "#E0B11E", fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", margin: "0 0 16px" },
  title: { color: "#fff", fontSize: 20, fontWeight: 700, margin: "0 0 8px" },
  sub:   { color: "#555", fontSize: 13, margin: "0 0 28px", lineHeight: 1.5 },
  input: {
    width: "100%", background: "#0a0a0a", border: "1px solid #2a2a2a",
    borderRadius: 8, padding: "12px 14px", color: "#fff", fontSize: 14,
    outline: "none", boxSizing: "border-box", marginBottom: 12, display: "block",
  },
  btn: {
    width: "100%", background: "#E0B11E", color: "#000", border: "none",
    borderRadius: 8, padding: "12px", fontSize: 14, fontWeight: 700,
    cursor: "pointer", marginTop: 16, opacity: 1,
  },
  error: { color: "#f87171", fontSize: 12, margin: "8px 0 0" },
};
