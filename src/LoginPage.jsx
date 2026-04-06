import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

// ─── Login exclusivo para administradores ─────────────────────────────────────
// Se muestra dentro de la ruta secreta cuando no hay sesión de admin activa.
// Nunca se accede directamente por URL pública.

export default function LoginPage() {
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginAdmin(email.trim(), password);
      navigate("/enr-admin", { replace: true });
    } catch (err) {
      const msgs = {
        "auth/invalid-credential": "Email o contraseña incorrectos.",
        "auth/user-not-found":     "No existe una cuenta con ese email.",
        "auth/wrong-password":     "Contraseña incorrecta.",
        "auth/too-many-requests":  "Demasiados intentos. Espera unos minutos.",
        "auth/invalid-email":      "El email no tiene un formato válido.",
      };
      setError(msgs[err.code] || "Error al iniciar sesión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-96 h-96 rounded-full bg-[#E0B11E]/5 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-3xl font-black text-[#E0B11E] tracking-tighter uppercase">ENERMAN</span>
          <p className="text-white/30 text-xs mt-1 uppercase tracking-widest">Panel de Administración</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm"
        >
          <h1 className="text-white font-bold text-lg mb-6">Iniciar sesión</h1>

          <div className="mb-4">
            <label className="block text-white/50 text-xs font-bold uppercase tracking-wide mb-1.5">Email</label>
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@enerman.com"
              className="w-full bg-white/8 border border-white/10 rounded-xl px-4 py-3
                text-white text-sm placeholder-white/20
                focus:outline-none focus:border-[#E0B11E]/50 focus:ring-1 focus:ring-[#E0B11E]/30 transition-colors"
            />
          </div>

          <div className="mb-6">
            <label className="block text-white/50 text-xs font-bold uppercase tracking-wide mb-1.5">Contraseña</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"} required value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/8 border border-white/10 rounded-xl px-4 py-3 pr-16
                  text-white text-sm placeholder-white/20
                  focus:outline-none focus:border-[#E0B11E]/50 focus:ring-1 focus:ring-[#E0B11E]/30 transition-colors"
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors text-[10px] font-bold">
                {showPass ? "OCULTAR" : "VER"}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl bg-[#E0B11E] text-[#1A0E00] font-bold text-sm
              hover:bg-[#F0C22E] active:scale-[0.98] transition-all disabled:opacity-50">
            {loading ? "Verificando…" : "Entrar al panel"}
          </button>
        </form>

        <p className="text-center text-white/15 text-xs mt-4">
          Acceso restringido · Solo personal autorizado
        </p>
      </div>
    </div>
  );
}
