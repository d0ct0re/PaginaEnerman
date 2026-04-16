import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

const WHATSAPP_VENTAS = "528144994504";

const TIPOS_PROYECTO = [
  "Residencial (casa / departamento)",
  "Comercial (local / oficina)",
  "Industrial ligero (taller / bodega)",
  "Industrial pesado (planta / manufactura)",
  "Obra nueva",
  "Remodelación / adecuación",
  "Alumbrado público / exterior",
  "Otro",
];

const PLAZOS = [
  "Urgente (esta semana)",
  "1–2 semanas",
  "1 mes",
  "1–3 meses",
  "Más de 3 meses",
  "Aún no definido",
];

export default function CotizaPage() {
  const navigate = useNavigate();
  const { user, perfil } = useAuth();

  const [form, setForm] = useState({
    nombre:    perfil?.nombre || "",
    telefono:  perfil?.telefono || user?.phoneNumber || "",
    empresa:   "",
    email:     user?.email || "",
    tipo:      "",
    descripcion: "",
    superficie: "",
    plazo:     "",
    notas:     "",
  });
  const [enviando, setEnviando]   = useState(false);
  const [enviado, setEnviado]     = useState(false);
  const [error, setError]         = useState("");

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.nombre.trim() || !form.telefono.trim() || !form.tipo || !form.descripcion.trim()) {
      setError("Completa los campos obligatorios (*).");
      return;
    }
    setEnviando(true);
    try {
      // Guardar en Firestore
      await addDoc(collection(db, "solicitudes"), {
        ...form,
        uid: user?.uid || null,
        fecha: serverTimestamp(),
        estado: "pendiente",
      });

      // Mensaje WhatsApp para el equipo de ventas
      const msg = [
        `*SOLICITUD DE COTIZACION — ENERMAN*`,
        ``,
        `*Cliente:* ${form.nombre}`,
        `*Teléfono:* ${form.telefono}`,
        form.empresa   ? `*Empresa:* ${form.empresa}`  : null,
        form.email     ? `*Email:* ${form.email}`      : null,
        ``,
        `*Tipo de proyecto:* ${form.tipo}`,
        form.superficie ? `*Superficie aprox:* ${form.superficie} m²` : null,
        `*Plazo requerido:* ${form.plazo || "No especificado"}`,
        ``,
        `*Descripción:*`,
        form.descripcion,
        form.notas ? `\n*Notas adicionales:*\n${form.notas}` : null,
      ].filter(Boolean).join("\n");

      window.open(`https://wa.me/${WHATSAPP_VENTAS}?text=${encodeURIComponent(msg)}`, "_blank");
      setEnviado(true);
    } catch {
      setError("Hubo un error al enviar tu solicitud. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-[#E0B11E]/15 flex items-center justify-center mb-6">
          <svg viewBox="0 0 24 24" fill="none" stroke="#E0B11E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-[#1A1C1D] mb-2">¡Solicitud enviada!</h1>
        <p className="text-[#6E6E73] text-sm max-w-xs mb-8">
          Tu cotización fue registrada. Se abrió WhatsApp para que nuestro equipo la reciba de inmediato.
          Te contactaremos en menos de 24 horas.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => navigate('/catalogo')}
            className="px-6 py-3 rounded-xl bg-[#E0B11E] text-[#1A0E00] font-bold text-sm hover:bg-[#F1C030] transition-colors">
            Explorar catálogo
          </button>
          <button onClick={() => setEnviado(false)}
            className="px-6 py-3 rounded-xl bg-white border border-[#E8E8EA] text-[#1A1C1D] font-bold text-sm hover:border-[#E0B11E] transition-colors">
            Nueva solicitud
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7]">

      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-[#1D1D1F] text-white px-4 py-3 flex items-center gap-3">
        <Link to="/" className="text-[#E0B11E] font-black text-sm uppercase tracking-tight">ENERMAN</Link>
        <span className="text-white/20">/</span>
        <span className="text-white/60 text-sm">Cotizar proyecto</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E0B11E]/15 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E0B11E] animate-pulse" />
            <span className="text-[#E0B11E] text-xs font-bold uppercase tracking-wider">Sin costo · Sin compromiso</span>
          </div>
          <h1 className="text-3xl font-black text-[#1A1C1D] mb-2">Solicitar cotización</h1>
          <p className="text-[#6E6E73] text-sm leading-relaxed">
            Cuéntanos sobre tu proyecto y te enviamos una cotización detallada con el material exacto que necesitas.
            Respuesta en menos de 24 horas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Datos de contacto ───────────────────────────── */}
          <Card titulo="Datos de contacto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nombre completo *">
                <input type="text" required value={form.nombre}
                  onChange={e => set("nombre", e.target.value)}
                  placeholder="Juan Pérez" className={inp} />
              </Field>
              <Field label="Teléfono *">
                <input type="tel" required value={form.telefono}
                  onChange={e => set("telefono", e.target.value)}
                  placeholder="814 000 0000" className={inp} />
              </Field>
              <Field label="Empresa (opcional)">
                <input type="text" value={form.empresa}
                  onChange={e => set("empresa", e.target.value)}
                  placeholder="Constructora XYZ" className={inp} />
              </Field>
              <Field label="Correo electrónico (opcional)">
                <input type="email" value={form.email}
                  onChange={e => set("email", e.target.value)}
                  placeholder="correo@empresa.com" className={inp} />
              </Field>
            </div>
          </Card>

          {/* ── Datos del proyecto ──────────────────────────── */}
          <Card titulo="Datos del proyecto">
            <div className="space-y-4">
              <Field label="Tipo de proyecto *">
                <select required value={form.tipo} onChange={e => set("tipo", e.target.value)} className={inp}>
                  <option value="">Selecciona una opción…</option>
                  {TIPOS_PROYECTO.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>

              <Field label="Descripción del proyecto *">
                <textarea required rows={4} value={form.descripcion}
                  onChange={e => set("descripcion", e.target.value)}
                  placeholder="Ej: Instalación eléctrica completa para bodega de 800 m², incluye tablero general, subcircuitos de fuerza e iluminación LED industrial…"
                  className={`${inp} resize-none`} />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Superficie aprox. (m²)">
                  <input type="number" min="1" value={form.superficie}
                    onChange={e => set("superficie", e.target.value)}
                    placeholder="500" className={inp} />
                </Field>
                <Field label="Plazo requerido">
                  <select value={form.plazo} onChange={e => set("plazo", e.target.value)} className={inp}>
                    <option value="">Selecciona…</option>
                    {PLAZOS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="¿Tienes planos o especificaciones? (opcional)">
                <textarea rows={2} value={form.notas}
                  onChange={e => set("notas", e.target.value)}
                  placeholder="Puedes describir el contenido de tus planos o mencionar normativa específica (NOM, CFE, etc.)"
                  className={`${inp} resize-none`} />
              </Field>
            </div>
          </Card>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>
          )}

          {/* ── Info de respuesta ───────────────────────────── */}
          <div className="bg-[#1D1D1F] rounded-2xl p-5 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-[#E0B11E]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="#E0B11E" strokeWidth="2" strokeLinecap="round" className="w-5 h-5">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm mb-1">Respuesta en menos de 24 horas</p>
              <p className="text-white/45 text-xs leading-relaxed">
                Tu solicitud llega directamente a nuestro equipo vía WhatsApp. Un ingeniero la revisa y te contacta para
                afinar detalles y enviarte la cotización formal en PDF.
              </p>
            </div>
          </div>

          <button type="submit" disabled={enviando}
            className="w-full py-4 rounded-2xl bg-[#E0B11E] text-[#1A0E00] font-black text-base
              flex items-center justify-center gap-3 hover:bg-[#F1C030] active:scale-[0.99] transition-all
              shadow-lg shadow-[#E0B11E]/20 disabled:opacity-50">
            {enviando ? (
              <><div className="w-5 h-5 border-2 border-[#1A0E00]/30 border-t-[#1A0E00] rounded-full animate-spin" /> Registrando solicitud…</>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.11 1.522 5.836L.044 23.956l6.285-1.647A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 01-4.99-1.364l-.358-.213-3.71.973.989-3.618-.234-.372A9.798 9.798 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
                </svg>
                Enviar solicitud por WhatsApp
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Helpers de layout ─────────────────────────────────────────────────────────
function Card({ titulo, children }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E8E8EA] overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#F2F2F7]">
        <p className="text-xs font-black uppercase tracking-widest text-[#6E6E73]">{titulo}</p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[#6E6E73] text-xs font-bold uppercase tracking-wide mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inp = `w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1A1C1D]
  focus:outline-none focus:border-[#E0B11E] focus:ring-2 focus:ring-[#E0B11E]/20
  transition-all bg-white placeholder-[#C7C7CC]`;
