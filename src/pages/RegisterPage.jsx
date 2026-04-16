import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const [step, setStep] = useState("form"); // 'form' | 'otp'
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { iniciarPhoneAuth, verifyPhoneOTP } = useAuth();

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setError("");
    if (!name || !phone || !password || !confirmPassword) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      await iniciarPhoneAuth(phone);
      setStep("otp");
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al enviar el SMS.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!otp) {
      setError("Ingrese el código OTP.");
      return;
    }
    setLoading(true);
    try {
      await verifyPhoneOTP(otp, password, name);
      navigate("/catalogo");
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al verificar el OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f4ff] to-[#e0e7ff] p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl max-w-md w-full p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-[#1A1C1D]">Crear cuenta</h2>
        {error && <div className="bg-red-100 text-red-800 rounded p-2 mb-4 text-sm">{error}</div>}
        {step === "form" && (
          <form onSubmit={handleSubmitForm} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1C1D] mb-1">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-[#E8E8EA] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E0B11E]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1C1D] mb-1">Celular (ej: +521234567890)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-[#E8E8EA] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E0B11E]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1C1D] mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#E8E8EA] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E0B11E]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1C1D] mb-1">Confirmar contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-[#E8E8EA] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E0B11E]"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#E0B11E] text-[#241A00] rounded-xl font-bold hover:bg-[#F1C030] transition-colors disabled:opacity-50"
            >
              {loading ? "Enviando OTP..." : "Enviar código de verificación"}
            </button>
          </form>
        )}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1C1D] mb-1">Código OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full rounded-xl border border-[#E8E8EA] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E0B11E]"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#E0B11E] text-[#241A00] rounded-xl font-bold hover:bg-[#F1C030] transition-colors disabled:opacity-50"
            >
              {loading ? "Verificando..." : "Verificar y crear cuenta"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
