import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AccesoPage() {
  const { isAdmin, isCliente, login, registro, reenviarVerificacion } = useAuth();
  const navigate = useNavigate();

  const [modo, setModo]           = useState("login");
  const [nombre, setNombre]       = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail]         = useState("");
  const [pass, setPass]           = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState("");
  const [info, setInfo]           = useState("");
  const [loading, setLoading]     = useState(false);

  if (isCliente) { navigate("/catalogo", { replace: true }); return null; }
  if (isAdmin)   { navigate("/catalogo", { replace: true }); return null; }

  const cambiarModo = (m) => {
    setModo(m); setError(""); setInfo("");
    setNombre(""); setApellidos(""); setEmail(""); setPass("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setInfo("");
    setLoading(true);
    try {
      if (modo === "registro") {
        if (!nombre.trim()) { setError("Ingresa tu nombre."); setLoading(false); return; }
        if (pass.length < 8) { setError("La contraseña debe tener mínimo 8 caracteres."); setLoading(false); return; }
        await registro({ nombre, apellidos, email, password: pass });
        setInfo("Cuenta creada. Revisa tu correo y confirma tu email para poder iniciar sesión.");
        cambiarModo("login");
      } else {
        await login(email, pass);
        navigate("/catalogo", { replace: true });
      }
    } catch (err) {
      const msgs = {
        "auth/user-not-found":       "No existe cuenta con ese correo.",
        "auth/wrong-password":       "Contraseña incorrecta.",
        "auth/invalid-credential":   "Email o contraseña incorrectos.",
        "auth/email-already-in-use": "Ya existe una cuenta con ese correo. Inicia sesión.",
        "auth/weak-password":        "La contraseña debe tener mínimo 8 caracteres.",
        "auth/invalid-email":        "El correo no tiene un formato válido.",
        "auth/too-many-requests":    "Demasiados intentos. Espera unos minutos.",
        "auth/email-not-verified":   "Debes verificar tu correo antes de iniciar sesión.",
      };
      setError(msgs[err.code] || "Error al acceder. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleReenviar = async () => {
    try {
      await reenviarVerificacion();
      setInfo("Correo de verificación reenviado.");
    } catch {
      setError("No se pudo reenviar el correo. Intenta iniciar sesión primero.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-center px-4">

      <Link to="/" className="mb-8">
        <span className="text-2xl font-black text-[#E0B11E] tracking-tighter uppercase">ENERMAN</span>
      </Link>

      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        <div className="p-8">

          <h1 className="font-bold text-[#1A1C1D] text-xl mb-1 text-center">
            {modo === "login" ? "Conectarme a mi cuenta" : "Crear mi cuenta"}
          </h1>
          <p className="text-[#6E6E73] text-sm text-center mb-6">
            {modo === "login"
              ? "Ingresa tu e-mail y contraseña"
              : "Por favor completa la información a continuación"}
          </p>

          {info && (
            <div className="px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm mb-4">
              {info}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {modo === "registro" && (
              <>
                <input type="text" required value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Nombre" className={inp} />
                <input type="text" value={apellidos}
                  onChange={e => setApellidos(e.target.value)}
                  placeholder="Apellidos" className={inp} />
              </>
            )}

            <input type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email" className={inp} />

            <div className="relative">
              <input
                type={showPass ? "text" : "password"} required value={pass}
                onChange={e => setPass(e.target.value)}
                placeholder={modo === "registro" ? "Contraseña (mínimo 8 caracteres)" : "Contraseña"}
                className={`${inp} pr-16`}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6E6E73] hover:text-[#1A1C1D] text-[10px] font-bold transition-colors">
                {showPass ? "OCULTAR" : "VER"}
              </button>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                {error}
                {error.includes("verificar") && (
                  <button type="button" onClick={handleReenviar}
                    className="block mt-1 text-xs font-bold underline text-red-500">
                    Reenviar correo de verificación
                  </button>
                )}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 mt-1 rounded-xl bg-[#E0B11E] text-[#1A0E00] font-bold text-sm
                hover:bg-[#F0C22E] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              {loading
                ? (modo === "registro" ? "Creando cuenta..." : "Verificando...")
                : (modo === "registro" ? "Crear mi cuenta" : "Entrar")}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-[#6E6E73] space-y-1">
            {modo === "login" ? (
              <>
                <p>¿Nuevo cliente? <button onClick={() => cambiarModo("registro")}
                  className="text-[#E0B11E] font-semibold hover:underline">Crear aquí</button></p>
                <p>¿Contraseña olvidada? <Link to="/recuperar"
                  className="text-[#E0B11E] font-semibold hover:underline">Recuperar contraseña</Link></p>
              </>
            ) : (
              <p>¿Ya tienes una cuenta? <button onClick={() => cambiarModo("login")}
                className="text-[#E0B11E] font-semibold hover:underline">Entrar aquí</button></p>
            )}
          </div>
        </div>
      </div>

      <Link to="/catalogo" className="mt-4 text-sm text-[#6E6E73] hover:text-[#1A1C1D] transition-colors">
        Explorar sin cuenta
      </Link>
    </div>
  );
}

const inp = `w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1A1C1D]
  placeholder-[#B0B0B5] focus:outline-none focus:border-[#E0B11E]
  focus:ring-2 focus:ring-[#E0B11E]/20 transition-all`;
