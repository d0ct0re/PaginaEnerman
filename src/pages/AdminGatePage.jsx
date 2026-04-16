import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

// ─── Código de acceso — en producción usar variable de entorno ────────────────
const GATE_CODE = import.meta.env.VITE_ADMIN_GATE_CODE || "ENR-GATE-2026";
const MAX_INTENTOS = 3;
const BLOQUEO_MS   = 15 * 60 * 1000; // 15 minutos

function registrarIntento(exito, email = "") {
  try {
    addDoc(collection(db, "admin_access_log"), {
      exito,
      email,
      paso: "gate",
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent,
    });
  } catch { /* silencioso */ }
}

export default function AdminGatePage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [codigo, setCodigo]   = useState("");
  const [error, setError]     = useState("");
  const [bloqueado, setBloqueado] = useState(false);
  const [minutos, setMinutos]  = useState(0);

  useEffect(() => {
    if (isAdmin) { navigate("/enr-admin", { replace: true }); return; }

    const bloqueoHasta = parseInt(localStorage.getItem("enr_gate_bloqueo") || "0");
    if (Date.now() < bloqueoHasta) {
      setBloqueado(true);
      const restante = Math.ceil((bloqueoHasta - Date.now()) / 60000);
      setMinutos(restante);
      const timer = setInterval(() => {
        const rest = Math.ceil((bloqueoHasta - Date.now()) / 60000);
        if (rest <= 0) { setBloqueado(false); clearInterval(timer); localStorage.removeItem("enr_gate_bloqueo"); }
        else setMinutos(rest);
      }, 30000);
      return () => clearInterval(timer);
    }
  }, [isAdmin, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (bloqueado) return;

    if (codigo.trim() === GATE_CODE) {
      registrarIntento(true);
      localStorage.removeItem("enr_gate_intentos");
      localStorage.removeItem("enr_gate_bloqueo");
      sessionStorage.setItem("enr_gate_ok", "1");
      navigate("/enr-admin-auth");
    } else {
      registrarIntento(false);
      const intentos = parseInt(localStorage.getItem("enr_gate_intentos") || "0") + 1;
      localStorage.setItem("enr_gate_intentos", intentos);
      if (intentos >= MAX_INTENTOS) {
        const hasta = Date.now() + BLOQUEO_MS;
        localStorage.setItem("enr_gate_bloqueo", hasta);
        setBloqueado(true);
        setMinutos(15);
        setError("Acceso bloqueado por 15 minutos.");
      } else {
        setError(`Código incorrecto. ${MAX_INTENTOS - intentos} intento(s) restante(s).`);
      }
      setCodigo("");
    }
  };

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        <p style={styles.label}>ENERMAN</p>
        <h1 style={styles.title}>Acceso restringido</h1>
        <p style={styles.sub}>Ingresa el código de establecimiento para continuar.</p>

        {bloqueado ? (
          <div style={styles.bloqueado}>
            Acceso bloqueado. Intenta en {minutos} minuto(s).
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              value={codigo}
              onChange={e => setCodigo(e.target.value)}
              placeholder="Código de establecimiento"
              autoFocus
              style={styles.input}
            />
            {error && <p style={styles.error}>{error}</p>}
            <button type="submit" style={styles.btn}>Continuar</button>
          </form>
        )}
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
    outline: "none", boxSizing: "border-box", marginBottom: 12,
  },
  btn: {
    width: "100%", background: "#E0B11E", color: "#000", border: "none",
    borderRadius: 8, padding: "12px", fontSize: 14, fontWeight: 700,
    cursor: "pointer", marginTop: 4,
  },
  error: { color: "#f87171", fontSize: 12, margin: "0 0 8px" },
  bloqueado: {
    background: "#1a0a0a", border: "1px solid #3a1a1a", borderRadius: 8,
    padding: "14px 16px", color: "#f87171", fontSize: 13, textAlign: "center",
  },
};
