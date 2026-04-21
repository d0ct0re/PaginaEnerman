import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, Search, ShoppingCart, MessageCircle, ArrowLeft,
  ShieldCheck, Zap, CheckCircle2, Star, FileText, Layers, 
  CircuitBoard, Wrench, Lightbulb, Package 
} from 'lucide-react';
import { Iconos, MARCAS, CATEGORIAS } from '../lib/constants';
import { SeccionBeneficios, SeccionUbicacion } from '../components/sections/LandingSections';
import HeroTower3D from '../components/HeroTower3D';
import FooterEnerman from '../components/FooterEnerman';
import { useAuth } from '../context/AuthContext';
import { activityTracker } from '../lib/activityTracker';

const ElectricPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="circuit" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
        <circle cx="40" cy="40" r="2" fill="#E0B11E"/>
        <line x1="40" y1="0" x2="40" y2="38" stroke="#E0B11E" strokeWidth="1"/>
        <line x1="40" y1="42" x2="40" y2="80" stroke="#E0B11E" strokeWidth="1"/>
        <line x1="0" y1="40" x2="38" y2="40" stroke="#E0B11E" strokeWidth="1"/>
        <line x1="42" y1="40" x2="80" y2="40" stroke="#E0B11E" strokeWidth="1"/>
        <circle cx="0" cy="40" r="2" fill="#E0B11E"/>
        <circle cx="80" cy="40" r="2" fill="#E0B11E"/>
        <circle cx="40" cy="0" r="2" fill="#E0B11E"/>
        <circle cx="40" cy="80" r="2" fill="#E0B11E"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#circuit)"/>
  </svg>
);

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .reveal-left');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
    }, { threshold: 0.12 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

function LandingPage() {
  const navigate = useNavigate();
  useScrollReveal();

  return (
    <div className="min-h-screen bg-[#0F0F10]" style={{ overflowX: 'clip' }}>

      {/* ── NAVBAR ──────────────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-50 bg-[#0F0F10]/92 backdrop-blur-md border-b border-white/5 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center">
          <img
            src="/enerman_logo.png"
            alt="ENERMAN"
            className="h-10 w-auto object-contain"
          />
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-white/60 font-medium">
          <button onClick={() => navigate('/catalogo')} className="hover:text-white transition-colors">Catálogo</button>
          <button onClick={() => document.getElementById('servicios')?.scrollIntoView({ behavior:'smooth' })} className="hover:text-white transition-colors">Servicios</button>
          <button onClick={() => navigate('/cotiza')} className="hover:text-[#E0B11E] transition-colors font-semibold">Cotizar proyecto</button>
        </nav>
        <div className="flex items-center gap-3">
          <a href="https://wa.me/528144994504" target="_blank" rel="noreferrer"
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366]/15 text-[#25D366] text-sm font-bold border border-[#25D366]/20 hover:bg-[#25D366]/25 transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.11 1.522 5.836L.044 23.956l6.285-1.647A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 01-4.99-1.364l-.358-.213-3.71.973.989-3.618-.234-.372A9.798 9.798 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>
            WhatsApp
          </a>
          <button onClick={() => navigate('/cotiza')}
            className="px-5 py-2 rounded-full bg-[#E0B11E] text-[#1A0E00] font-bold text-sm hover:bg-[#F1C030] transition-colors">
            Cotizar gratis
          </button>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex overflow-hidden bg-[#050505]">

        {/* ── Lado izquierdo: contenido ──────────────────────────── */}
        <div className="relative z-10 flex flex-col justify-center w-full md:w-[35%] flex-shrink-0 min-h-screen">
          {/* Barra dorada vertical izquierda */}
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-transparent via-[#E0B11E] to-transparent opacity-60" />

          <div className="pl-12 md:pl-16 lg:pl-20 pr-8 pt-28 pb-16">
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E0B11E] animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#E0B11E] opacity-50" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#E0B11E] opacity-20" />
              </div>
              <span className="text-[#E0B11E]/80 text-xs font-bold uppercase tracking-[0.2em]">Distribuidora · Monterrey N.L.</span>
            </div>

            {/* Headline */}
            <h1 className="text-[clamp(2.8rem,6vw,5.5rem)] font-black text-white leading-[0.88] tracking-tight mb-6">
              Material<br />
              <span style={{ WebkitTextStroke: '2px #E0B11E', color: 'transparent' }}>Eléctrico</span><br />
              <span className="text-[#E0B11E]">Profesional</span>
            </h1>

            {/* Línea divisora */}
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-12 bg-[#E0B11E]/60" />
              <p className="text-sm text-white/40 font-medium uppercase tracking-widest">Material eléctrico</p>
            </div>

            <p className="text-[15px] text-white/55 max-w-[360px] mb-10 leading-relaxed">
              Cables, tubería conduit, iluminación LED, distribución y accesorios para contratistas y proyectos eléctricos en Monterrey y área metropolitana.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-12">
              <button onClick={() => navigate('/catalogo')}
                className="group flex items-center gap-3 px-6 py-3.5 rounded-xl bg-[#E0B11E] text-[#1A0E00] font-black text-sm hover:bg-[#F1C030] transition-all shadow-lg shadow-[#E0B11E]/25">
                Explorar catálogo
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <a href="https://wa.me/528144994504" target="_blank" rel="noreferrer"
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white/[0.06] text-white font-bold text-sm border border-white/10 hover:bg-white/10 transition-all">
                <svg className="w-4 h-4 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.11 1.522 5.836L.044 23.956l6.285-1.647A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 01-4.99-1.364l-.358-.213-3.71.973.989-3.618-.234-.372A9.798 9.798 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>
                Cotizar por WhatsApp
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 divide-x divide-white/8 border border-white/8 rounded-xl overflow-hidden max-w-xs">
              {[
                { val: "508+", label: "Productos" },
                { val: "8",   label: "Marcas" },
                { val: "7",   label: "Categ." },
                { val: "MTY", label: "N.L." },
              ].map(({ val, label }) => (
                <div key={label} className="bg-white/[0.03] px-3 py-3 text-center">
                  <p className="text-base font-black text-[#E0B11E] leading-none mb-0.5">{val}</p>
                  <p className="text-[8px] text-white/35 font-bold uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-5 mt-8">
              {[
                { icon: ShieldCheck, label: "Material certificado" },
                { icon: Zap, label: "Entrega Monterrey" },
                { icon: CheckCircle2, label: "Precios directos" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-white/30">
                  <Icon size={13} className="text-[#E0B11E]/60" />
                  <span className="text-[10px] font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Lado derecho: corredor 3D inmersivo ──────────── */}
        <div className="hidden md:block absolute right-0 top-0 bottom-0 w-[65%] overflow-hidden">
          <div className="absolute inset-0 bg-[#050505]" />
          <HeroTower3D />
          {/* Fade hacia la sección siguiente */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />
          {/* Fade superior (navbar) */}
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#050505]/80 to-transparent pointer-events-none" />
        </div>

      </section>

      {/* ── CATEGORÍAS ──────────────────────────────────────────── */}
      <section className="bg-[#0A0A0D] px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(224,177,30,0.6)' }}>
              Explora por categoría
            </p>
            <h2 className="text-4xl font-black text-white">¿Qué necesitas hoy?</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {CATEGORIAS.filter(c => c.nombre !== 'Todos').map(cat => (
              <button
                key={cat.nombre}
                onClick={() => navigate(`/catalogo?categoria=${cat.nombre}`)}
                className="group relative rounded-2xl overflow-hidden cursor-pointer text-left transition-all duration-300 hover:-translate-y-1"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.border = '1px solid rgba(255,215,0,0.5)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,215,0,0.10)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Image with consistent 4:3 ratio */}
                <div className="relative overflow-hidden bg-[#111114]" style={{ aspectRatio: '4/3' }}>
                  <img
                    src={cat.imagen}
                    alt={cat.nombre}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={e => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                  {/* Icon fallback (hidden while image is present) */}
                  <div
                    className="absolute inset-0 items-center justify-center [&_svg]:!w-12 [&_svg]:!h-12 opacity-60"
                    style={{ display: 'none', background: `linear-gradient(135deg, ${cat.color}22 0%, ${cat.color}0A 100%)` }}
                  >
                    {cat.icono(cat.color)}
                  </div>
                  {/* Dark gradient overlay for text legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  {/* Text anchored at bottom of image */}
                  <div className="absolute bottom-0 inset-x-0 p-4">
                    <h3 className="font-black text-white text-sm mb-1 drop-shadow">{cat.nombre}</h3>
                    <div className="flex items-center gap-1 text-xs font-bold" style={{ color: '#FFD700' }}>
                      Ver productos
                      <ChevronRight size={11} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICIOS ───────────────────────────────────────────── */}
      <section id="servicios" className="bg-white px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-[#6E6E73] mb-2">Lo que hacemos</p>
            <h2 className="text-4xl font-black text-[#1A1C1D]">Más que un catálogo</h2>
            <p className="text-[#6E6E73] mt-3 max-w-xl">Entrega a domicilio, cotización con ingeniero, servicio fin de semana — respaldamos tus proyectos de inicio a fin.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Zap,
                color: "#E0B11E",
                bg: "#FFFBEB",
                titulo: "Entrega a domicilio",
                desc: "Monterrey y área metropolitana. Envío el mismo día o siguiente día hábil para pedidos confirmados antes de las 2 pm.",
                badge: "Mismo día",
              },
              {
                icon: Star,
                color: "#7C3AED",
                bg: "#F5F3FF",
                titulo: "Servicio fin de semana",
                desc: "Sábados y domingos disponibles para obras con urgencia. Coordinamos entrega especial sin costo adicional.",
                badge: "Sáb–Dom",
              },
              {
                icon: FileText,
                color: "#0284C7",
                bg: "#E0F2FE",
                titulo: "Pre-cotización formal",
                desc: "Genera un PDF profesional numerado con tus productos, listo para presentar a tu cliente o jefe de obra.",
                badge: "PDF + WhatsApp",
              },
              {
                icon: CheckCircle2,
                color: "#059669",
                bg: "#ECFDF5",
                titulo: "Cotización con ingeniero",
                desc: "¿Tienes planos o un proyecto completo? Nuestros ingenieros aliados lo cotizan y te recomiendan el material exacto.",
                badge: "Gratis",
              },
              {
                icon: Layers,
                color: "#DC2626",
                bg: "#FEF2F2",
                titulo: "Revisión de planos",
                desc: "Sube tus planos eléctricos y te decimos exactamente qué material necesitas — sin desperdiciar ni una pieza.",
              },
              {
                icon: Zap,
                color: "#E0B11E",
                bg: "#FFF8E1",
                titulo: "Instalaciones eléctricas",
                desc: "Residencial, comercial e industrial. Proyectos desde cero con materiales certificados.",
                imagen: "/servicio_instalaciones.jpg",
              },
              {
                icon: CircuitBoard,
                color: "#7B1FA2",
                bg: "#F3E5F5",
                titulo: "Ingeniería eléctrica",
                desc: "Diseño de sistemas eléctricos, memorias de cálculo, planos y supervisión de obra.",
                imagen: "/servicio_ingenieria.jpg",
              },
              {
                icon: Wrench,
                color: "#F47920",
                bg: "#FFF3E0",
                titulo: "Mantenimiento",
                desc: "Preventivo y correctivo. Termografía, revisión de tableros, sustitución de equipos.",
                imagen: "/servicio_mantenimiento.jpg",
              },
              {
                icon: Lightbulb,
                color: "#7AB800",
                bg: "#F1F8E9",
                titulo: "Proyectos de iluminación",
                desc: "Eficiencia energética con tecnología LED. Cálculo fotométrico y ahorro garantizado.",
                imagen: "/servicio_iluminacion.jpg",
              },
              {
                icon: ShieldCheck,
                color: "#C62828",
                bg: "#FFEBEE",
                titulo: "Seguridad eléctrica (EPP)",
                desc: "Suministro de equipo de protección personal para trabajo en instalaciones eléctricas.",
              },
              {
                icon: Package,
                color: "#00897B",
                bg: "#E0F2F1",
                titulo: "Suministro de material",
                desc: "Venta de material eléctrico al por mayor y menudeo. Entrega en obra o en almacén.",
                imagen: "/servicio_suministro.jpg",
              },
            ].map(({ icon: Icon, color, bg, titulo, desc, badge, imagen }) => (
              <div key={titulo} className="group rounded-2xl overflow-hidden border border-[#E8E8EA] hover:border-transparent hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
                <div className="w-full h-40 relative overflow-hidden" style={{ background: bg }}>
                  {imagen ? (
                    <img
                      src={imagen}
                      alt={titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 opacity-15"
                        style={{ backgroundImage: `radial-gradient(circle, ${color} 1px, transparent 1px)`, backgroundSize: '18px 18px' }} />
                      <Icon size={48} style={{ color }} strokeWidth={1.2}
                        className="absolute inset-0 m-auto opacity-50 group-hover:scale-110 transition-transform duration-300" />
                    </>
                  )}
                  {badge && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                      style={{ background: imagen ? 'rgba(0,0,0,0.55)' : color + '22', color: imagen ? '#fff' : color, backdropFilter: imagen ? 'blur(4px)' : 'none' }}>
                      {badge}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                      <Icon size={14} style={{ color }} />
                    </div>
                    <h3 className="font-black text-[#1A1C1D] text-sm">{titulo}</h3>
                  </div>
                  <p className="text-[#6E6E73] text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          {/* CTA cotización */}
          <div className="mt-12 bg-[#1D1D1F] rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative">
            <div className="absolute inset-0 opacity-5"
              style={{ backgroundImage: 'radial-gradient(circle, #E0B11E 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="relative">
              <p className="text-[#E0B11E] text-xs font-bold uppercase tracking-widest mb-1">Sin compromiso</p>
              <h3 className="font-black text-white text-xl mb-1">¿Tienes un proyecto eléctrico?</h3>
              <p className="text-white/50 text-sm max-w-sm">Cuéntanos qué necesitas — planos, superficie, plazo — y te enviamos cotización con ingeniero en menos de 24 horas.</p>
            </div>
            <div className="relative flex-shrink-0 flex flex-col sm:flex-row gap-3">
              <button onClick={() => navigate('/cotiza')}
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#E0B11E] text-[#1A0E00] font-black hover:bg-[#F1C030] transition-colors shadow-lg shadow-[#E0B11E]/20">
                <FileText size={18} /> Solicitar cotización
              </button>
              <a href="https://wa.me/528144994504?text=Hola%20ENERMAN%2C%20quiero%20cotizar%20un%20proyecto"
                target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 text-white font-bold hover:bg-white/15 transition-colors border border-white/10">
                <svg className="w-4 h-4 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.11 1.522 5.836L.044 23.956l6.285-1.647A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 01-4.99-1.364l-.358-.213-3.71.973.989-3.618-.234-.372A9.798 9.798 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARCAS ──────────────────────────────────────────────── */}
      <section className="bg-white px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-[#6E6E73] mb-2">Trabajamos con</p>
            <h2 className="text-4xl font-black text-[#1A1C1D]">Marcas líderes</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {MARCAS.map(marca => (
              <button
                key={marca.nombre}
                onClick={() => navigate(`/catalogo?marca=${marca.nombre}`)}
                className="group relative bg-[#F9F9FB] rounded-2xl p-5 flex flex-col items-center gap-3 hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 border border-transparent hover:border-gray-100 overflow-hidden reveal"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
                  style={{ background: `radial-gradient(circle at top, ${marca.color}18 0%, transparent 70%)` }} />
                {/* Logo SVG inline con color de marca */}
                <div className="relative w-24 h-10 flex items-center justify-center grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300">
                  {marca.svgLogo}
                </div>
                <div className="relative text-center">
                  <p className="font-black text-[#1A1C1D] text-xs tracking-wide">{marca.nombre}</p>
                  <p className="text-[9px] text-[#6E6E73] mt-0.5 font-medium">{marca.categoria}</p>
                </div>
                <span className="relative text-[9px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1"
                  style={{ color: marca.color }}>
                  Ver productos <ChevronRight size={9} />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO PEDIR ──────────────────────────────────────────── */}
      <section className="relative bg-[#0F0F10] px-6 py-24 overflow-hidden">
        <ElectricPattern />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-[#E0B11E]/8 blur-[80px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-[#E0B11E]/60 mb-3">Proceso simple</p>
            <h2 className="text-4xl font-black text-white">¿Cómo hacer un pedido?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { num: "01", icon: Search, titulo: "Explora el catálogo", desc: "Navega por categorías, filtra por marca y encuentra lo que necesitas.", color: "#E0B11E" },
              { num: "02", icon: ShoppingCart, titulo: "Arma tu pedido", desc: "Agrega productos al carrito. Selecciona medidas y cantidades.", color: "#7AB800" },
              { num: "03", icon: MessageCircle, titulo: "Envía por WhatsApp", desc: "Te generamos un PDF y lo enviamos directo a nuestro equipo de ventas.", color: "#25D366" },
            ].map(paso => (
              <div key={paso.num} className="relative bg-white/[0.03] border border-white/8 rounded-2xl p-6 hover:bg-white/[0.06] transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: paso.color + '20' }}>
                    <paso.icon size={18} style={{ color: paso.color }} />
                  </div>
                  <span className="text-4xl font-black text-white/10 leading-none">{paso.num}</span>
                </div>
                <h3 className="text-white font-bold text-base mb-2">{paso.titulo}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{paso.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button onClick={() => navigate('/catalogo')}
              className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-[#E0B11E] text-[#1A0E00] font-black hover:bg-[#F1C030] transition-all shadow-xl shadow-[#E0B11E]/20">
              Ir al catálogo <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* ── BENEFICIOS ──────────────────────────────────────────── */}
      <SeccionBeneficios />

      {/* ── UBICACIÓN ───────────────────────────────────────────── */}
      <SeccionUbicacion />

      {/* ── BOTÓN FLOTANTE WHATSAPP ───── */}
      <a href="https://wa.me/528144994504?text=Hola%20ENERMAN%2C%20tengo%20una%20consulta"
        target="_blank" rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-xl shadow-[#25D366]/40 hover:scale-110 transition-transform wa-float"
        aria-label="Contactar por WhatsApp">
        <svg className="w-7 h-7" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.11 1.522 5.836L.044 23.956l6.285-1.647A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 01-4.99-1.364l-.358-.213-3.71.973.989-3.618-.234-.372A9.798 9.798 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>
      </a>

      <FooterEnerman />
    </div>
  );
}

export default LandingPage;
