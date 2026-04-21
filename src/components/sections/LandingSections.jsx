import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// HOOK: scroll reveal
// ─────────────────────────────────────────────────────────────────────────────
function useFadeIn(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────
// Guadalupe, N.L. — Calle 3914, Col. Industrial
const POS = [25.6752, -100.2577];
const WA  = "528144994504";

const PRODUCTOS_TIENDA = [
  { nombre: "Cable THHW-LS 12 AWG",        precio: "$8.50/m",       disp: "disponible" },
  { nombre: "Tablero 12 circuitos Square D", precio: "$1,250 MXN",   disp: "disponible" },
  { nombre: "Luminaria LED 100W Industrial", precio: "$890 MXN",     disp: "ultimas"    },
  { nombre: "Conduit PVC 1\" × 3m",         precio: "$45 MXN",      disp: "disponible" },
];

// Fix icono default de Leaflet con bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Marcador personalizado ENERMAN — SVG dorado animado
const customIcon = L.divIcon({
  className: "",
  html: `
    <div class="enr-pin-wrap">
      <div class="enr-pin-pulse1"></div>
      <div class="enr-pin-pulse2"></div>
      <div class="enr-pin-body">
        <svg viewBox="0 0 40 56" width="40" height="56" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="pg" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stop-color="#FFD84D"/>
              <stop offset="100%" stop-color="#C98A00"/>
            </radialGradient>
            <filter id="pf">
              <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#E0B11E" flood-opacity="0.65"/>
            </filter>
          </defs>
          <path d="M20 0C8.954 0 0 8.954 0 20c0 13.75 20 36 20 36S40 33.75 40 20C40 8.954 31.046 0 20 0z"
                fill="url(#pg)" filter="url(#pf)"/>
          <circle cx="20" cy="20" r="9" fill="#1A0E00" opacity="0.9"/>
          <circle cx="20" cy="20" r="5.5" fill="#E0B11E"/>
          <circle cx="18.5" cy="18.5" r="2" fill="rgba(255,255,255,0.4)"/>
        </svg>
      </div>
      <div class="enr-pin-shadow"></div>
    </div>
  `,
  iconSize: [40, 56],
  iconAnchor: [20, 56],
  popupAnchor: [0, -62],
});

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponente: abre popup y centra al cargar
// ─────────────────────────────────────────────────────────────────────────────
function MapInit({ markerRef }) {
  const map = useMap();
  useEffect(() => {
    map.setView(POS, 16);
    setTimeout(() => { markerRef.current?.openPopup(); }, 900);
  }, []);
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN BENEFICIOS
// ─────────────────────────────────────────────────────────────────────────────
const BENEFICIOS = [
  {
    titulo: "Más de 500 productos",
    desc: "Catálogo completo de material eléctrico para todo tipo de proyecto.",
    gradA: "#C62828", gradB: "#7f0000", delay: 0,
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
        <line x1="12" y1="12" x2="12" y2="12.01"/>
      </svg>
    ),
  },
  {
    titulo: "Logística eficiente",
    desc: "Entrega el mismo día en Guadalupe y Monterrey. Servicio fin de semana.",
    gradA: "#1565C0", gradB: "#0d2e6b", delay: 100,
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <rect x="1" y="3" width="15" height="13" rx="1"/>
        <path d="M16 8h4l3 3v5h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
  },
  {
    titulo: "Clientes satisfechos",
    desc: "Contratistas, ingenieros y empresas confían en ENERMAN para sus obras.",
    gradA: "#B8860B", gradB: "#7a5500", delay: 200,
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/>
        <path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
  {
    titulo: "Asesoría especializada",
    desc: "Ingenieros disponibles para cotizar proyectos, revisar planos y orientarte.",
    gradA: "#2E7D32", gradB: "#0a3d0e", delay: 300,
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 16v-4"/><path d="M12 8h.01"/>
      </svg>
    ),
  },
];

export function SeccionBeneficios() {
  const [ref, visible] = useFadeIn(0.08);
  return (
    <section ref={ref} className="bg-[#0E0E10] px-6 py-20">
      <div className="max-w-5xl mx-auto">
        <div className={`text-center mb-14 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <p className="text-[#E0B11E] text-xs font-bold uppercase tracking-[0.3em] mb-3">Por qué elegirnos</p>
          <h2 className="text-4xl font-black text-white">
            La diferencia{" "}
            <span style={{ WebkitTextStroke: "1.5px #E0B11E", color: "transparent" }}>ENERMAN</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {BENEFICIOS.map((b, i) => (
            <BeneficioCard key={b.titulo} b={b} visible={visible} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BeneficioCard({ b, visible }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity .6s ease ${b.delay}ms, transform .6s ease ${b.delay}ms`,
      }}
    >
      <div
        className="rounded-2xl p-7 flex flex-col items-center text-center border border-white/5 h-full"
        style={{
          background: hov ? "#1a1a1c" : "#141416",
          transform: hov ? "translateY(-8px)" : "translateY(0)",
          boxShadow: hov ? `0 24px 48px rgba(0,0,0,.5), 0 0 0 1px ${b.gradA}35` : "none",
          transition: "transform .3s ease, background .3s ease, box-shadow .3s ease",
        }}
      >
        {/* Círculo */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6 relative"
          style={{
            background: `radial-gradient(circle at 35% 30%, ${b.gradA}, ${b.gradB})`,
            boxShadow: `0 0 0 6px ${b.gradA}18, 0 8px 28px ${b.gradA}45`,
            transform: hov ? "scale(1.1)" : "scale(1)",
            transition: "transform .3s ease",
          }}
        >
          {hov && <span className="absolute inset-0 rounded-full animate-ping" style={{ background: `${b.gradA}20` }} />}
          {b.icono}
        </div>
        <h3 className="text-white font-black text-sm mb-2 leading-snug">{b.titulo}</h3>
        <p className="text-white/40 text-xs leading-relaxed flex-1">{b.desc}</p>
        {/* Línea coloreada deslizante */}
        <div className="mt-5 h-0.5 rounded-full overflow-hidden w-full">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: hov ? "100%" : "0%",
              background: `linear-gradient(90deg, transparent, ${b.gradA}, transparent)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN UBICACIÓN
// ─────────────────────────────────────────────────────────────────────────────
export function SeccionUbicacion() {
  const [refSec, visible] = useFadeIn(0.05);
  const [mapReady, setMapReady] = useState(false);
  const markerRef = useRef(null);
  const navigate  = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setMapReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  const msgWA  = encodeURIComponent("Hola ENERMAN, quiero visitar la tienda. ¿Cuál es el horario y la dirección exacta?");
  const msgPed = encodeURIComponent("Hola ENERMAN, quiero hacer un pedido para recoger en tienda.");

  return (
    <section ref={refSec} className="bg-[#080809] px-4 sm:px-6 py-20 overflow-hidden">
      <div className="max-w-6xl mx-auto">

        {/* Título */}
        <div
          className="text-center mb-14"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity .8s ease, transform .8s ease",
          }}
        >
          <p className="text-[#E0B11E] text-xs font-bold uppercase tracking-[0.3em] mb-3">Punto de venta</p>
          <h2 className="text-4xl font-black text-white mb-3">Visítanos</h2>
          <p className="text-white/35 text-sm">Encuentra nuestra ubicación fácilmente · Guadalupe, N.L.</p>
        </div>

        {/* Grid izq + der */}
        <div
          className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-7 items-start"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(32px)",
            transition: "opacity .9s ease .15s, transform .9s ease .15s",
          }}
        >
          {/* ────── Columna izquierda ────── */}
          <div className="flex flex-col gap-5">

            {/* Tarjeta principal */}
            <div className="bg-[#111113] border border-white/[0.07] rounded-2xl p-6">
              {/* Nombre + pin */}
              <div className="flex items-start gap-3 mb-6">
                <PinAnimado />
                <div>
                  <p className="text-white font-black text-lg leading-tight">ENERMAN</p>
                  <p className="text-[#E0B11E] text-xs font-bold mt-0.5">Material Eléctrico · Servicios 24/7</p>
                </div>
              </div>

              {/* Datos */}
              <div className="space-y-3.5 mb-6">
                {[
                  { label: "Dirección", val: "Calle 3914, Col. Industrial\nGuadalupe, Nuevo León, México" },
                  { label: "Lun – Vie", val: "8:00 am – 6:00 pm" },
                  { label: "Sábados",   val: "9:00 am – 2:00 pm" },
                  { label: "Servicios", val: "Emergencias eléctricas 24/7" },
                  { label: "Teléfono",  val: "814 499 4504" },
                ].map(({ label, val }) => (
                  <div key={label} className="flex gap-3">
                    <div>
                      <p className="text-white/30 text-[9px] uppercase tracking-widest font-black mb-0.5">{label}</p>
                      <p className="text-white/75 text-sm leading-snug whitespace-pre-line">{val}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botones */}
              <div className="flex flex-col gap-2.5">
                <a
                  href={`https://wa.me/${WA}?text=${msgWA}`}
                  target="_blank" rel="noreferrer"
                  className="group flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg,#25D366,#1DA851)", color: "white", boxShadow: "0 4px 20px rgba(37,211,102,.28)" }}
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.11 1.522 5.836L.044 23.956l6.285-1.647A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 01-4.99-1.364l-.358-.213-3.71.973.989-3.618-.234-.372A9.798 9.798 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
                  </svg>
                  Avisar que voy para allá
                </a>
                <a
                  href="https://maps.google.com/?q=25.6752,-100.2577"
                  target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 text-white/70 font-bold text-sm hover:bg-white/[0.06] hover:text-white hover:border-white/20 transition-all"
                >
                  <svg className="w-4 h-4 text-[#E0B11E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="10" r="3"/>
                    <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 10-16 0c0 3 2.7 7 8 11.7z"/>
                  </svg>
                  Cómo llegar → Google Maps
                </a>
              </div>
            </div>

            {/* Productos disponibles en tienda */}
            <div className="bg-[#111113] border border-white/[0.07] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[#E0B11E] text-xs font-black uppercase tracking-wider">Disponible en tienda</p>
                <span className="flex items-center gap-1.5 text-[9px] text-green-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> En venta hoy
                </span>
              </div>
              <div className="space-y-3">
                {PRODUCTOS_TIENDA.map(p => (
                  <div key={p.nombre} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-white/75 text-xs font-medium truncate">{p.nombre}</p>
                      <p className="text-white/30 text-[10px]">{p.precio}</p>
                    </div>
                    <span className={`flex-shrink-0 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide ${
                      p.disp === "disponible" ? "bg-green-900/40 text-green-400" : "bg-yellow-900/40 text-yellow-400"
                    }`}>
                      {p.disp === "disponible" ? "En stock" : "Últimas"}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate("/catalogo")}
                className="mt-4 w-full py-2.5 rounded-xl bg-[#E0B11E] text-[#1A0E00] font-black text-xs hover:bg-[#F1C030] transition-colors"
              >
                Ver catálogo completo →
              </button>
            </div>
          </div>

          {/* ────── Columna derecha: mapa ────── */}
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.07]"
            style={{
              height: 540,
              boxShadow: "0 32px 80px rgba(0,0,0,.7), 0 0 0 1px rgba(224,177,30,.12)",
            }}
          >
            {/* Badge "Ubicación disponible" */}
            <div
              className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 px-4 py-2 rounded-full pointer-events-none"
              style={{
                background: "rgba(8,8,9,0.88)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(224,177,30,0.35)",
                boxShadow: "0 4px 20px rgba(0,0,0,.4)",
              }}
            >
              <span className="relative flex items-center justify-center w-2.5 h-2.5">
                <span className="absolute w-full h-full rounded-full bg-[#E0B11E] animate-ping opacity-60" />
                <span className="w-2 h-2 rounded-full bg-[#E0B11E]" />
              </span>
              <span className="text-[#E0B11E] text-[11px] font-black uppercase tracking-[0.2em]">
                Ubicación disponible
              </span>
            </div>

            {/* Controles extra (esquina inf. derecha) */}
            <div className="absolute bottom-4 right-4 z-[999] flex flex-col gap-2">
              <a
                href={`https://wa.me/${WA}?text=${msgPed}`}
                target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-white text-xs font-bold transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg,#25D366,#1DA851)", boxShadow: "0 4px 16px rgba(37,211,102,.4)" }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.11 1.522 5.836L.044 23.956l6.285-1.647A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 01-4.99-1.364l-.358-.213-3.71.973.989-3.618-.234-.372A9.798 9.798 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
                </svg>
                Pedir aquí →
              </a>
            </div>

            {/* Mapa */}
            {mapReady ? (
              <MapContainer
                center={POS}
                zoom={16}
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
                scrollWheelZoom={true}
                dragging={true}
                doubleClickZoom={true}
                attributionControl={false}
              >
                {/* Tiles oscuros */}
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

                {/* Controles de zoom (posición superior derecha) */}
                <ZoomControl position="topright" />

                <Marker position={POS} icon={customIcon} ref={markerRef}>
                  <Popup minWidth={270} maxWidth={300} className="enr-popup">
                    <MapPopupContent navigate={navigate} />
                  </Popup>
                </Marker>

                <MapInit markerRef={markerRef} />
              </MapContainer>
            ) : (
              <div className="w-full h-full bg-[#111113] flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-2 border-[#E0B11E]/25 border-t-[#E0B11E] rounded-full animate-spin" />
                <p className="text-white/30 text-xs">Cargando mapa…</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Estilos Leaflet popup ── */}
      <style>{`
        /* Pin flotante */
        .enr-pin-wrap { position:relative; width:40px; height:64px; }
        .enr-pin-body {
          position:absolute; top:0; left:0;
          animation: enrFloat 2.6s ease-in-out infinite;
        }
        .enr-pin-pulse1 {
          position:absolute; top:4px; left:50%; transform:translateX(-50%);
          width:40px; height:40px; border-radius:50%;
          background:rgba(224,177,30,.18);
          animation: enrPulse 2.6s ease-out infinite;
        }
        .enr-pin-pulse2 {
          position:absolute; top:4px; left:50%; transform:translateX(-50%);
          width:40px; height:40px; border-radius:50%;
          background:rgba(224,177,30,.10);
          animation: enrPulse 2.6s ease-out .5s infinite;
        }
        .enr-pin-shadow {
          position:absolute; bottom:2px; left:50%; transform:translateX(-50%);
          width:28px; height:8px; border-radius:50%;
          background:radial-gradient(ellipse,rgba(0,0,0,.5),transparent);
          animation: enrShadow 2.6s ease-in-out infinite;
        }
        @keyframes enrFloat  { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-9px)} }
        @keyframes enrShadow { 0%,100%{opacity:.5;transform:translateX(-50%) scaleX(1)} 50%{opacity:.18;transform:translateX(-50%) scaleX(.65)} }
        @keyframes enrPulse  { 0%{transform:translateX(-50%) scale(1);opacity:.6} 100%{transform:translateX(-50%) scale(2.8);opacity:0} }

        /* Popup */
        .enr-popup .leaflet-popup-content-wrapper {
          background:#111113 !important;
          border:1px solid rgba(224,177,30,.22) !important;
          border-radius:18px !important;
          padding:0 !important;
          box-shadow:0 24px 60px rgba(0,0,0,.75) !important;
        }
        .enr-popup .leaflet-popup-content { margin:0 !important; width:auto !important; }
        .enr-popup .leaflet-popup-tip-container { display:none; }
        .enr-popup .leaflet-popup-close-button {
          color:#555 !important; top:10px !important; right:12px !important; font-size:18px !important; z-index:10;
        }
        .enr-popup .leaflet-popup-close-button:hover { color:#E0B11E !important; }

        /* Controles de zoom */
        .leaflet-control-zoom { border:none !important; }
        .leaflet-control-zoom a {
          background:#111113 !important; border:1px solid rgba(255,255,255,.1) !important;
          color:#E0B11E !important; width:32px !important; height:32px !important;
          line-height:32px !important; border-radius:8px !important; font-size:18px !important;
          margin-bottom:4px !important; display:block !important;
          transition:background .2s !important;
        }
        .leaflet-control-zoom a:hover { background:#1a1a1c !important; }
      `}</style>
    </section>
  );
}

// ─── Contenido del popup ──────────────────────────────────────────────────────
function MapPopupContent({ navigate }) {
  const msgPed = encodeURIComponent("Hola ENERMAN, quiero hacer un pedido para recoger en tienda.");
  return (
    <div style={{ padding: "20px 20px 18px", minWidth: 255 }}>
      {/* Logo + nombre */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: "#E0B11E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg viewBox="0 0 20 20" fill="none" width="22" height="22">
            <path d="M11 2L4 11h6l-1 7 7-9h-6l1-7z" fill="#1A0E00"/>
          </svg>
        </div>
        <div>
          <p style={{ margin: 0, color: "#fff", fontWeight: 900, fontSize: 15, letterSpacing: ".5px" }}>ENERMAN</p>
          <p style={{ margin: 0, color: "#E0B11E", fontSize: 11, fontWeight: 700 }}>Material eléctrico · 24/7</p>
        </div>
      </div>

      {/* Dirección + horario */}
      <div style={{ background: "rgba(255,255,255,.04)", borderRadius: 10, padding: "10px 12px", marginBottom: 12 }}>
        <p style={{ margin: "0 0 5px", color: "rgba(255,255,255,.55)", fontSize: 11.5, lineHeight: 1.55 }}>
            Calle 3914, Col. Industrial<br/>
          Guadalupe, N.L., México
        </p>
        <p style={{ margin: 0, color: "rgba(255,255,255,.35)", fontSize: 10.5 }}>
          Lun–Vie 8–18h · Sáb 9–14h · Emergencias 24/7
        </p>
      </div>

      {/* Productos */}
      <p style={{ color: "#E0B11E", fontSize: 9.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 6px" }}>Disponible en tienda</p>
      <div style={{ marginBottom: 14 }}>
        {PRODUCTOS_TIENDA.slice(0, 3).map(p => (
          <div key={p.nombre} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
            <span style={{ color: "rgba(255,255,255,.65)", fontSize: 11, maxWidth: 165, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {p.nombre}
            </span>
            <span style={{
              fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 20, textTransform: "uppercase",
              background: p.disp === "disponible" ? "rgba(74,222,128,.12)" : "rgba(251,191,36,.12)",
              color: p.disp === "disponible" ? "#4ade80" : "#fbbf24",
            }}>
              {p.disp === "disponible" ? "En stock" : "Últimas"}
            </span>
          </div>
        ))}
      </div>

      {/* Botones */}
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        <a href={`https://wa.me/${WA}?text=${msgPed}`} target="_blank" rel="noreferrer"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 14px", borderRadius: 11, background: "linear-gradient(135deg,#25D366,#1DA851)", color: "white", fontWeight: 800, fontSize: 12.5, textDecoration: "none", boxShadow: "0 4px 14px rgba(37,211,102,.3)" }}>
          <svg width="15" height="15" fill="white" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.11 1.522 5.836L.044 23.956l6.285-1.647A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 01-4.99-1.364l-.358-.213-3.71.973.989-3.618-.234-.372A9.798 9.798 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
          </svg>
          Pedir por WhatsApp
        </a>
        <a href="https://maps.google.com/?q=25.6752,-100.2577" target="_blank" rel="noreferrer"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 14px", borderRadius: 11, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.65)", fontWeight: 700, fontSize: 12, textDecoration: "none" }}>
          Abrir en Google Maps
        </a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PIN ANIMADO reutilizable
// ─────────────────────────────────────────────────────────────────────────────
export function PinAnimado({ size = 32 }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      className="relative flex-shrink-0 cursor-pointer select-none"
      style={{ width: size, height: size + 10 }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Anillos de radar */}
      {[0, 0.45].map(d => (
        <span key={d} className="absolute inset-0 rounded-full"
          style={{
            background: "rgba(224,177,30,.14)",
            animation: `enrPulse2 2.2s ease-out ${d}s infinite`,
          }} />
      ))}
      {/* SVG pin */}
      <div style={{
        animation: "enrFloat2 2.6s ease-in-out infinite",
        transform: hov ? "scale(1.18)" : "scale(1)",
        transition: "transform .25s ease",
      }}>
        <svg viewBox="0 0 32 44" width={size} height={size + 10}
          style={{ filter: "drop-shadow(0 3px 10px rgba(224,177,30,.55))" }}>
          <defs>
            <radialGradient id="pinG2" cx="38%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#FFD84D"/>
              <stop offset="100%" stopColor="#C98A00"/>
            </radialGradient>
          </defs>
          <path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 28 16 28S32 27 32 16C32 7.163 24.837 0 16 0z" fill="url(#pinG2)"/>
          <circle cx="16" cy="16" r="7" fill="#1A0E00" opacity=".9"/>
          <circle cx="16" cy="16" r="4.5" fill="#E0B11E"/>
          <circle cx="14.5" cy="14.5" r="1.8" fill="rgba(255,255,255,.38)"/>
        </svg>
      </div>
      {/* Tooltip */}
      {hov && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded-lg text-[10px] font-bold text-[#1A0E00]"
          style={{ background: "#E0B11E", boxShadow: "0 4px 12px rgba(0,0,0,.35)" }}>
          Ver ubicación
        </div>
      )}
      <style>{`
        @keyframes enrPulse2 { 0%{transform:scale(1);opacity:.55} 100%{transform:scale(2.6);opacity:0} }
        @keyframes enrFloat2  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
      `}</style>
    </div>
  );
}
