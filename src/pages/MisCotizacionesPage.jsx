import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs, deleteDoc, doc, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

// ─── Historial de cotizaciones guardadas del usuario ─────────────────────────

export default function MisCotizacionesPage({ setCarrito }) {
  const navigate = useNavigate();
  const { user, perfil } = useAuth();
  const [cotizaciones, setCotizaciones] = useState([]);
  const [cargando, setCargando]         = useState(true);
  const [eliminando, setEliminando]     = useState(null);

  useEffect(() => {
    if (!user) { navigate("/acceso"); return; }
    cargar();
  }, [user]);

  const cargar = async () => {
    setCargando(true);
    try {
      const q = query(collection(db, "pedidos", user.uid, "historial"), orderBy("fecha", "desc"));
      const snap = await getDocs(q);
      setCotizaciones(snap.docs.map(d => ({ _id: d.id, ...d.data() })));
    } catch {
      // orderBy puede fallar si no hay índice — fallback sin orden
      try {
        const snap = await getDocs(collection(db, "pedidos", user.uid, "historial"));
        const data = snap.docs.map(d => ({ _id: d.id, ...d.data() }));
        data.sort((a, b) => (b.fecha?.toMillis?.() || 0) - (a.fecha?.toMillis?.() || 0));
        setCotizaciones(data);
      } catch { setCotizaciones([]); }
    } finally {
      setCargando(false);
    }
  };

  const eliminar = async (id) => {
    if (!confirm("¿Eliminar esta cotización?")) return;
    setEliminando(id);
    try {
      await deleteDoc(doc(db, "pedidos", user.uid, "historial", id));
      setCotizaciones(prev => prev.filter(c => c._id !== id));
    } finally {
      setEliminando(null);
    }
  };

  const cargarEnCarrito = (cotizacion) => {
    if (!confirm("Esto reemplazará tu carrito actual. ¿Continuar?")) return;
    const items = (cotizacion.items || []).map(i => ({
      ...i,
      _carritoId: `${i.id || i.nombre}_${Date.now()}_${Math.random()}`,
      cantidad: i.cantidad || 1,
      precioFinal: i.precio || 0,
    }));
    setCarrito(items);
    navigate("/pedido");
  };

  const fmtFecha = (ts) => ts?.toDate
    ? ts.toDate().toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

  const fmtMXN = (n) => n > 0
    ? `$${Number(n).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN`
    : "Consultar";

  const estadoColor = {
    enviado:   { bg: "#ECFDF5", color: "#059669", label: "Enviada" },
    guardado:  { bg: "#EFF6FF", color: "#2563EB", label: "Guardada" },
    pendiente: { bg: "#FFFBEB", color: "#D97706", label: "Pendiente" },
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-[#1D1D1F] text-white px-4 py-3 flex items-center gap-3">
        <Link to="/catalogo" className="text-[#E0B11E] font-black text-sm uppercase tracking-tight">ENERMAN</Link>
        <span className="text-white/20">/</span>
        <span className="text-white/60 text-sm">Mis cotizaciones</span>
        <div className="ml-auto">
          <button onClick={() => navigate("/catalogo")}
            className="px-4 py-1.5 rounded-lg bg-[#E0B11E] text-[#1A0E00] font-bold text-xs hover:bg-[#F1C030] transition-colors">
            + Nuevo pedido
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-[#1A1C1D]">
            Mis cotizaciones
          </h1>
          <p className="text-[#6E6E73] text-sm mt-1">
            {perfil?.nombre ? `Hola ${perfil.nombre} · ` : ""}
            {cotizaciones.length} cotización{cotizaciones.length !== 1 ? "es" : ""} guardada{cotizaciones.length !== 1 ? "s" : ""}
          </p>
        </div>

        {cargando ? (
          <div className="text-center py-20 text-[#6E6E73] text-sm">Cargando historial…</div>
        ) : cotizaciones.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-[#E8E8EA]">
            <div className="w-16 h-16 rounded-full bg-[#F2F2F7] flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="#C7C7CC" strokeWidth="1.5" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 002.25 2.25h.75"/>
              </svg>
            </div>
            <p className="font-bold text-[#1A1C1D] mb-1">Sin cotizaciones todavía</p>
            <p className="text-[#6E6E73] text-sm mb-6">Agrega productos al carrito y envía tu primera pre-cotización.</p>
            <button onClick={() => navigate("/catalogo")}
              className="px-6 py-3 rounded-xl bg-[#E0B11E] text-[#1A0E00] font-bold text-sm hover:bg-[#F1C030] transition-colors">
              Explorar catálogo
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {cotizaciones.map(c => {
              const est = estadoColor[c.estado] || estadoColor.guardado;
              return (
                <div key={c._id} className="bg-white rounded-2xl border border-[#E8E8EA] overflow-hidden hover:shadow-md transition-shadow">
                  {/* Header card */}
                  <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {c.folio && (
                          <span className="text-[#E0B11E] font-black text-sm">{c.folio}</span>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: est.bg, color: est.color }}>
                          {est.label}
                        </span>
                        {c.entrega?.tipo === "domicilio" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669]">
                            Domicilio
                          </span>
                        )}
                      </div>
                      <p className="text-[#6E6E73] text-xs">
                        {fmtFecha(c.fecha)} · {c.items?.length || 0} producto{c.items?.length !== 1 ? "s" : ""}
                        {c.cliente?.nombre ? ` · ${c.cliente.nombre}` : ""}
                      </p>
                    </div>
                    <p className="font-black text-[#E0B11E] text-lg flex-shrink-0">{fmtMXN(c.total)}</p>
                  </div>

                  {/* Items preview */}
                  <div className="px-5 pb-3">
                    <div className="flex flex-col gap-1">
                      {(c.items || []).slice(0, 3).map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-xs text-[#6E6E73]">
                          <span className="truncate max-w-[220px]">
                            {item.nombre}{item.varianteNombre ? ` (${item.varianteNombre})` : ""}
                          </span>
                          <span className="ml-2 flex-shrink-0 font-semibold">×{item.cantidad}</span>
                        </div>
                      ))}
                      {(c.items?.length || 0) > 3 && (
                        <p className="text-[10px] text-[#C7C7CC]">+ {c.items.length - 3} más…</p>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="px-5 py-3 border-t border-[#F2F2F7] flex items-center gap-2">
                    <button onClick={() => cargarEnCarrito(c)}
                      className="flex-1 py-2 rounded-xl bg-[#E0B11E] text-[#1A0E00] font-bold text-xs hover:bg-[#F1C030] transition-colors">
                      Reanudar pedido
                    </button>
                    <button onClick={() => navigate("/cotiza")}
                      className="px-4 py-2 rounded-xl border border-[#E8E8EA] text-[#6E6E73] font-bold text-xs hover:border-[#E0B11E] hover:text-[#1A1C1D] transition-colors">
                      Cotizar instalación
                    </button>
                    <button onClick={() => eliminar(c._id)} disabled={eliminando === c._id}
                      className="w-8 h-8 rounded-xl border border-[#E8E8EA] flex items-center justify-center text-[#C7C7CC] hover:text-red-500 hover:border-red-200 transition-colors disabled:opacity-40">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA servicios */}
        {cotizaciones.length > 0 && (
          <div className="mt-8 bg-[#1D1D1F] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-[#E0B11E] text-xs font-bold uppercase tracking-wider mb-1">Servicios 24/7</p>
              <p className="text-white font-bold">¿Necesitas que ENERMAN instale el material?</p>
              <p className="text-white/50 text-xs mt-1">Solicita cotización con ingeniero — sin costo, sin compromiso.</p>
            </div>
            <button onClick={() => navigate("/cotiza")}
              className="flex-shrink-0 px-6 py-3 rounded-xl bg-[#E0B11E] text-[#1A0E00] font-bold text-sm hover:bg-[#F1C030] transition-colors">
              Solicitar cotización
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
