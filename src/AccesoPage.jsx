import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

// ─── Página de acceso para clientes ──────────────────────────────────────────
// Modo teléfono (OTP en 3 pasos) o correo electrónico (email + contraseña)

export default function AccesoPage() {
  const { user, isAdmin, isCliente, iniciarPhoneAuth, guardarPerfil } = useAuth();
  const navigate = useNavigate();

  const [modo, setModo]           = useState("telefono"); // "telefono" | "email"

  // — Estado teléfono —
  const [paso, setPaso]               = useState(1);
  const [telefono, setTelefono]       = useState("");
  const [codigo, setCodigo]           = useState("");
  const [nombre, setNombre]           = useState("");
  const [confirmacion, setConfirmacion] = useState(null);

  // — Estado email —
  const [emailVal, setEmailVal]     = useState("");
  const [passVal, setPassVal]       = useState("");
  const [nombreEmail, setNombreEmail] = useState("");
  const [modoEmail, setModoEmail]   = useState("login"); // "login" | "registro"
  const [showPass, setShowPass]     = useState(false);

  // — Compartido —
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  if (isCliente) { navigate("/catalogo", { replace: true }); return null; }
  if (isAdmin)   { navigate("/catalogo", { replace: true }); return null; }

  const resetModo = (m) => {
    setModo(m);
    setError("");
    setPaso(1);
    setTelefono(""); setCodigo(""); setNombre("");
    setEmailVal(""); setPassVal(""); setNombreEmail("");
    setModoEmail("login");
    window._recaptchaVerifier = null;
  };

  // ── Teléfono: Paso 1 ──────────────────────────────────────────────────────
  const enviarSMS = async (e) => {
    e.preventDefault();
    setError("");
    const digitos = telefono.replace(/\D/g, "");
    if (digitos.length !== 10) {
      setError("Ingresa los 10 dígitos de tu celular (sin código de país)."); return;
    }
    setLoading(true);
    try {
      const result = await iniciarPhoneAuth(`+52${digitos}`);
      setConfirmacion(result);
      setPaso(2);
    } catch (err) {
      const msgs = {
        "auth/invalid-phone-number": "Número de teléfono inválido.",
        "auth/too-many-requests":    "Demasiados intentos. Espera unos minutos.",
        "auth/quota-exceeded":       "Servicio de SMS no disponible temporalmente.",
      };
      setError(msgs[err.code] || `Error: ${err.message}`);
      window._recaptchaVerifier = null;
    } finally {
      setLoading(false);
    }
  };

  // ── Teléfono: Paso 2 ──────────────────────────────────────────────────────
  const verificarCodigo = async (e) => {
    e.preventDefault();
    setError("");
    if (codigo.length !== 6) { setError("El código tiene exactamente 6 dígitos."); return; }
    setLoading(true);
    try {
      const result = await confirmacion.confirm(codigo);
      const esExistente = await guardarPerfil(result.user.uid, {
        nombre: "",
        telefono: `+52${telefono.replace(/\D/g, "")}`,
      });
      if (esExistente) {
        navigate("/catalogo", { replace: true });
      } else {
        setPaso(3);
      }
    } catch (err) {
      const msgs = {
        "auth/invalid-verification-code": "Código incorrecto. Revisa el SMS.",
        "auth/code-expired":              "El código expiró. Solicita uno nuevo.",
      };
      setError(msgs[err.code] || "Error al verificar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // ── Teléfono: Paso 3 ──────────────────────────────────────────────────────
  const completarRegistro = async (e) => {
    e.preventDefault();
    setError("");
    if (!nombre.trim()) { setError("Ingresa tu nombre."); return; }
    setLoading(true);
    try {
      await guardarPerfil(user.uid, {
        nombre,
        telefono: `+52${telefono.replace(/\D/g, "")}`,
      });
      navigate("/catalogo", { replace: true });
    } catch {
      setError("Error al guardar tu nombre. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // ── Email: acceder o registrarse ──────────────────────────────────────────
  const manejarEmail = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (modoEmail === "registro") {
        if (!nombreEmail.trim()) { setError("Ingresa tu nombre."); setLoading(false); return; }
        const cred = await createUserWithEmailAndPassword(auth, emailVal.trim(), passVal);
        await guardarPerfil(cred.user.uid, {
          nombre: nombreEmail.trim(),
          telefono: "",
          email: emailVal.trim(),
        });
      } else {
        const cred = await signInWithEmailAndPassword(auth, emailVal.trim(), passVal);
        await guardarPerfil(cred.user.uid, { nombre: "", telefono: "" });
      }
      navigate("/catalogo", { replace: true });
    } catch (err) {
      const msgs = {
        "auth/user-not-found":        "No existe cuenta con ese correo.",
        "auth/wrong-password":        "Contraseña incorrecta.",
        "auth/invalid-credential":    "Email o contraseña incorrectos.",
        "auth/email-already-in-use":  "Ya existe una cuenta con ese correo. Inicia sesión.",
        "auth/weak-password":         "La contraseña debe tener mínimo 6 caracteres.",
        "auth/invalid-email":         "El correo no tiene un formato válido.",
        "auth/too-many-requests":     "Demasiados intentos. Espera unos minutos.",
      };
      setError(msgs[err.code] || "Error al acceder. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const titulosTel = ["Accede a tu cuenta", "Verifica tu número", "Completa tu registro"];
  const subtitulosTel = [
    "Te enviamos un código por SMS",
    `Código enviado a +52 ${telefono}`,
    "¡Ya casi! Solo falta tu nombre",
  ];

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-center px-4">

      {/* Logo */}
      <Link to="/" className="mb-8">
        <span className="text-2xl font-black text-[#E0B11E] tracking-tighter uppercase">ENERMAN</span>
      </Link>

      {/* Tabs modo (solo en paso 1 de teléfono) */}
      {(modo === "email" || paso === 1) && (
        <div className="flex mb-4 bg-white rounded-2xl border border-black/5 p-1 shadow-sm">
          <button
            onClick={() => resetModo("telefono")}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-colors ${
              modo === "telefono" ? "bg-[#E0B11E] text-[#1A0E00]" : "text-[#6E6E73] hover:text-[#1A1C1D]"
            }`}
          >
            Celular
          </button>
          <button
            onClick={() => resetModo("email")}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-colors ${
              modo === "email" ? "bg-[#E0B11E] text-[#1A0E00]" : "text-[#6E6E73] hover:text-[#1A1C1D]"
            }`}
          >
            Correo
          </button>
        </div>
      )}

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">

        {/* Indicador de pasos (solo teléfono) */}
        {modo === "telefono" && (
          <div className="flex">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex-1 h-1 transition-colors duration-300"
                style={{ background: paso >= n ? "#E0B11E" : "#F2F2F7" }} />
            ))}
          </div>
        )}

        <div className="p-8">

          {/* ══ MODO TELÉFONO ══════════════════════════════════════ */}
          {modo === "telefono" && (
            <>
              <h1 className="font-bold text-[#1A1C1D] text-xl mb-1">{titulosTel[paso - 1]}</h1>
              <p className="text-[#6E6E73] text-sm mb-6">{subtitulosTel[paso - 1]}</p>

              {/* Paso 1 */}
              {paso === 1 && (
                <form onSubmit={enviarSMS} className="space-y-4">
                  <div>
                    <label className="block text-[#6E6E73] text-xs font-bold uppercase tracking-wide mb-1.5">
                      Número de celular
                    </label>
                    <div className="flex gap-2">
                      <span className="flex items-center px-3 py-3 bg-[#F2F2F7] rounded-xl text-sm text-[#6E6E73] font-semibold border border-gray-200 whitespace-nowrap">
                        🇲🇽 +52
                      </span>
                      <input
                        type="tel" required autoFocus value={telefono}
                        onChange={(e) => setTelefono(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="8144994504"
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm
                          focus:outline-none focus:border-[#E0B11E] focus:ring-2 focus:ring-[#E0B11E]/20 transition-all"
                      />
                    </div>
                    <p className="text-[#6E6E73] text-xs mt-1.5">10 dígitos · Sin código de país</p>
                  </div>
                  {error && <ErrorBox>{error}</ErrorBox>}
                  <button type="submit" disabled={loading} className={Btn}>
                    {loading ? "Enviando código…" : "Enviar código por SMS →"}
                  </button>
                  <p className="text-center text-[#6E6E73] text-xs pt-2">
                    Al continuar aceptas que usaremos tu número para identificarte
                  </p>
                </form>
              )}

              {/* Paso 2 */}
              {paso === 2 && (
                <form onSubmit={verificarCodigo} className="space-y-4">
                  <div>
                    <label className="block text-[#6E6E73] text-xs font-bold uppercase tracking-wide mb-1.5">
                      Código de 6 dígitos
                    </label>
                    <input
                      type="text" inputMode="numeric" autoFocus maxLength={6}
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="• • • • • •"
                      className="w-full border border-gray-200 rounded-xl px-4 py-4 text-center
                        text-2xl font-bold tracking-[0.5em] text-[#1A1C1D]
                        focus:outline-none focus:border-[#E0B11E] focus:ring-2 focus:ring-[#E0B11E]/20 transition-all"
                    />
                  </div>
                  {error && <ErrorBox>{error}</ErrorBox>}
                  <button type="submit" disabled={loading || codigo.length !== 6} className={Btn}>
                    {loading ? "Verificando…" : "Confirmar código"}
                  </button>
                  <button type="button"
                    onClick={() => { setPaso(1); setCodigo(""); setError(""); window._recaptchaVerifier = null; }}
                    className="w-full py-2 text-sm text-[#6E6E73] hover:text-[#1A1C1D] transition-colors">
                    ← Cambiar número
                  </button>
                </form>
              )}

              {/* Paso 3 */}
              {paso === 3 && (
                <form onSubmit={completarRegistro} className="space-y-4">
                  <div>
                    <label className="block text-[#6E6E73] text-xs font-bold uppercase tracking-wide mb-1.5">
                      Tu nombre completo
                    </label>
                    <input
                      type="text" required autoFocus value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej: Juan Pérez"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                        focus:outline-none focus:border-[#E0B11E] focus:ring-2 focus:ring-[#E0B11E]/20 transition-all"
                    />
                  </div>
                  {error && <ErrorBox>{error}</ErrorBox>}
                  <button type="submit" disabled={loading} className={Btn}>
                    {loading ? "Guardando…" : "Entrar al catálogo →"}
                  </button>
                </form>
              )}
            </>
          )}

          {/* ══ MODO EMAIL ════════════════════════════════════════ */}
          {modo === "email" && (
            <>
              {/* Sub-tabs login/registro */}
              <div className="flex gap-1 mb-6 bg-[#F2F2F7] rounded-xl p-1">
                <button
                  onClick={() => { setModoEmail("login"); setError(""); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
                    modoEmail === "login" ? "bg-white text-[#1A1C1D] shadow-sm" : "text-[#6E6E73]"
                  }`}
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => { setModoEmail("registro"); setError(""); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
                    modoEmail === "registro" ? "bg-white text-[#1A1C1D] shadow-sm" : "text-[#6E6E73]"
                  }`}
                >
                  Registrarse
                </button>
              </div>

              <form onSubmit={manejarEmail} className="space-y-4">
                {modoEmail === "registro" && (
                  <div>
                    <label className="block text-[#6E6E73] text-xs font-bold uppercase tracking-wide mb-1.5">Nombre completo</label>
                    <input
                      type="text" required value={nombreEmail}
                      onChange={(e) => setNombreEmail(e.target.value)}
                      placeholder="Ej: Juan Pérez"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                        focus:outline-none focus:border-[#E0B11E] focus:ring-2 focus:ring-[#E0B11E]/20 transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[#6E6E73] text-xs font-bold uppercase tracking-wide mb-1.5">Correo electrónico</label>
                  <input
                    type="email" required autoFocus value={emailVal}
                    onChange={(e) => setEmailVal(e.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                      focus:outline-none focus:border-[#E0B11E] focus:ring-2 focus:ring-[#E0B11E]/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[#6E6E73] text-xs font-bold uppercase tracking-wide mb-1.5">Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"} required value={passVal}
                      onChange={(e) => setPassVal(e.target.value)}
                      placeholder={modoEmail === "registro" ? "Mínimo 6 caracteres" : "••••••••"}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-16 text-sm
                        focus:outline-none focus:border-[#E0B11E] focus:ring-2 focus:ring-[#E0B11E]/20 transition-all"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6E6E73] hover:text-[#1A1C1D] text-[10px] font-bold transition-colors">
                      {showPass ? "OCULTAR" : "VER"}
                    </button>
                  </div>
                </div>

                {error && <ErrorBox>{error}</ErrorBox>}

                <button type="submit" disabled={loading} className={Btn}>
                  {loading
                    ? (modoEmail === "registro" ? "Creando cuenta…" : "Verificando…")
                    : (modoEmail === "registro" ? "Crear cuenta →" : "Entrar al catálogo →")}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <Link to="/catalogo" className="mt-4 text-sm text-[#6E6E73] hover:text-[#1A1C1D] transition-colors">
        Explorar sin cuenta →
      </Link>
    </div>
  );
}

// ── Helpers de estilo ─────────────────────────────────────────────────────────
const Btn = `w-full py-3 rounded-xl bg-[#E0B11E] text-[#1A0E00] font-bold text-sm
  hover:bg-[#F0C22E] active:scale-[0.98] transition-all
  disabled:opacity-40 disabled:cursor-not-allowed`;

function ErrorBox({ children }) {
  return (
    <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
      {children}
    </div>
  );
}
