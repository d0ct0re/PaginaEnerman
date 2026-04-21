import {
  LayoutGrid, Zap, Lightbulb, Layers, CircuitBoard, Wrench, ShieldCheck, Package
} from "lucide-react";

export const Iconos = {
  Menu: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Buscar: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Carrito: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Cerrar: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Mas: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Menos: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  Rayo: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
    </svg>
  ),
  Foco: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
    </svg>
  ),
  Tubo: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  Grid: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  Herramienta: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
  ),
  Escudo: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  Caja: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
      <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
  ),
  Flecha: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  Basura: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  PDF: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
    </svg>
  ),
};

export const MARCAS = [
  { nombre: "VIAKON",    categoria: "Conductores",  color: "#E31837",
    svgLogo: <svg viewBox="0 0 60 24" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="0" y="19" fontFamily="Arial Black,Arial" fontWeight="900" fontSize="17" fill="#E31837" letterSpacing="1">VIAKON</text></svg> },
  { nombre: "ARGOS",     categoria: "Conductores",  color: "#0057A8",
    svgLogo: <svg viewBox="0 0 52 24" fill="none"><text x="0" y="19" fontFamily="Arial Black,Arial" fontWeight="900" fontSize="18" fill="#0057A8">ARGOS</text></svg> },
  { nombre: "RYMCO",     categoria: "Tubería",      color: "#F47920",
    svgLogo: <svg viewBox="0 0 56 24" fill="none"><text x="0" y="19" fontFamily="Arial Black,Arial" fontWeight="900" fontSize="18" fill="#F47920">RYMCO</text></svg> },
  { nombre: "SIEMENS",   categoria: "Distribución", color: "#009999",
    svgLogo: <svg viewBox="0 0 76 24" fill="none"><text x="0" y="19" fontFamily="Arial Black,Arial" fontWeight="900" fontSize="17" fill="#009999" letterSpacing="0.5">SIEMENS</text></svg> },
  { nombre: "BTICINO",   categoria: "Distribución", color: "#CC0000",
    svgLogo: <svg viewBox="0 0 72 24" fill="none"><text x="0" y="19" fontFamily="Arial Black,Arial" fontWeight="900" fontSize="16" fill="#CC0000">BTICINO</text></svg> },
  { nombre: "3M",        categoria: "Accesorios",   color: "#FF0000",
    svgLogo: <svg viewBox="0 0 28 24" fill="none"><text x="0" y="20" fontFamily="Arial Black,Arial" fontWeight="900" fontSize="22" fill="#FF0000">3M</text></svg> },
  { nombre: "OSRAM",     categoria: "Iluminación",  color: "#7AB800",
    svgLogo: <svg viewBox="0 0 62 24" fill="none"><text x="0" y="19" fontFamily="Arial Black,Arial" fontWeight="900" fontSize="17" fill="#7AB800" letterSpacing="0.5">OSRAM</text></svg> },
  { nombre: "SUPRALUX",  categoria: "Iluminación",  color: "#E8A000",
    svgLogo: <svg viewBox="0 0 84 24" fill="none"><text x="0" y="19" fontFamily="Arial Black,Arial" fontWeight="900" fontSize="15" fill="#E8A000" letterSpacing="0.3">SUPRALUX</text></svg> },
];

export const CATEGORIAS = [
  {
    nombre: "Todos", color: "#E0B11E", bg: "#FFF8E1",
    icono: (c) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="9" height="9" rx="2" stroke={c} strokeWidth="1.6"/>
        <rect x="13" y="2" width="9" height="9" rx="2" stroke={c} strokeWidth="1.6"/>
        <rect x="2" y="13" width="9" height="9" rx="2" stroke={c} strokeWidth="1.6"/>
        <rect x="13" y="13" width="9" height="9" rx="2" stroke={c} strokeWidth="1.6"/>
      </svg>
    ),
  },
  {
    nombre: "Conductores", color: "#E0B11E", bg: "#FFF8E1",
    imagen: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=85&auto=format&fit=crop",
    icono: (c) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8" stroke={c} strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="4.5" stroke={c} strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="1.5" fill={c}/>
        <path d="M12 3.5 L12 2" stroke={c} strokeWidth="2" strokeLinecap="round"/>
        <path d="M20.5 12 L22 12" stroke={c} strokeWidth="2" strokeLinecap="round"/>
        <path d="M3.5 12 L2 12" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    nombre: "Iluminación", color: "#7AB800", bg: "#F1F8E9",
    // Corregimos la imagen que estaba rota
    imagen: "https://images.unsplash.com/photo-1510074377623-e1d1eb96c997?w=800&q=85&auto=format&fit=crop",
    icono: (c) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C8.7 2 6 4.7 6 8c0 2.5 1.4 4.6 3.3 5.7L9.5 15.5h5l.2-1.8C16.6 12.6 18 10.5 18 8c0-3.3-2.7-6-6-6z"
          stroke={c} strokeWidth="1.4" fill={c} fillOpacity="0.10"/>
        <line x1="9.5" y1="17.5" x2="14.5" y2="17.5" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="10.5" y1="19.5" x2="13.5" y2="19.5" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12 14C10.3 12.3 10.3 9.2 12 7.8C13.7 9.2 13.7 12.3 12 14z" stroke={c} strokeWidth="1" fill={c} fillOpacity="0.35"/>
        <line x1="12" y1="7.8" x2="12" y2="14" stroke={c} strokeWidth="0.9" strokeLinecap="round" opacity="0.5"/>
        <line x1="3.5" y1="6" x2="2" y2="4.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
        <line x1="20.5" y1="6" x2="22" y2="4.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
        <line x1="4" y1="9.5" x2="2.5" y2="9.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
        <line x1="20" y1="9.5" x2="21.5" y2="9.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
      </svg>
    ),
  },
  {
    nombre: "Tubería", color: "#0288D1", bg: "#E1F5FE",
    imagen: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=85&auto=format&fit=crop",
    icono: (c) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="8" cy="8.5" r="5.5" stroke={c} strokeWidth="1.4"/>
        <circle cx="8" cy="8.5" r="2.8" stroke={c} strokeWidth="1.2" fill={c} fillOpacity="0.13"/>
        <circle cx="18" cy="7" r="3.5" stroke={c} strokeWidth="1.4"/>
        <circle cx="18" cy="7" r="1.7" stroke={c} strokeWidth="1.1" fill={c} fillOpacity="0.13"/>
        <path d="M8 14 L8 20.5 Q8 22.5 10 22.5 L14.5 22.5" stroke={c} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
        <ellipse cx="14.5" cy="22.5" rx="2" ry="1" stroke={c} strokeWidth="1.2" fill={c} fillOpacity="0.15"/>
      </svg>
    ),
  },
  {
    nombre: "Distribución", color: "#7B1FA2", bg: "#F3E5F5",
    imagen: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=85&auto=format&fit=crop",
    icono: (c) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="7" y="2" width="10" height="20" rx="2.5" stroke={c} strokeWidth="1.4" fill={c} fillOpacity="0.07"/>
        <rect x="10" y="5" width="4" height="9" rx="2" stroke={c} strokeWidth="1.3" fill={c} fillOpacity="0.20"/>
        <line x1="12" y1="6.5" x2="12" y2="9.5" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="12" cy="17.5" r="1.6" fill={c}/>
        <line x1="10.5" y1="2" x2="10.5" y2="0.5" stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
        <line x1="13.5" y1="2" x2="13.5" y2="0.5" stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
        <line x1="10.5" y1="22" x2="10.5" y2="23.5" stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
        <line x1="13.5" y1="22" x2="13.5" y2="23.5" stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    nombre: "Herramientas", color: "#F47920", bg: "#FFF3E0",
    imagen: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=85&auto=format&fit=crop",
    icono: (c) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <g transform="rotate(-38 12 12)">
          <rect x="10.5" y="10" width="3" height="12" rx="1.5" stroke={c} strokeWidth="1.3" fill={c} fillOpacity="0.09"/>
          <rect x="5" y="4" width="14" height="7" rx="2" stroke={c} strokeWidth="1.4" fill={c} fillOpacity="0.13"/>
          <path d="M5.5 6.5 L2.5 3.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M5.5 9 L2.5 8" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
          <line x1="19" y1="4.5" x2="19" y2="10.5" stroke={c} strokeWidth="1.8" strokeLinecap="round" opacity="0.5"/>
        </g>
      </svg>
    ),
  },
  {
    nombre: "EPP", color: "#C62828", bg: "#FFEBEE",
    // Corregimos la imagen que estaba rota
    imagen: "https://images.unsplash.com/photo-1621644788102-132d4310dcb8?w=800&q=85&auto=format&fit=crop",
    icono: (c) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="3.8" r="2" stroke={c} strokeWidth="1.4"/>
        <path d="M8.5 9 Q8.5 6 12 5.5 Q15.5 6 15.5 9" stroke={c} strokeWidth="1.3" fill={c} fillOpacity="0.13"/>
        <line x1="7" y1="9" x2="17" y2="9" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M8.5 9 Q8 10.5 9 11 L15 11 Q16 10.5 15.5 9" stroke={c} strokeWidth="1.2" fill="none"/>
        <line x1="12" y1="11" x2="12" y2="17" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="8.5" y1="14" x2="15.5" y2="14" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="12" y1="17" x2="9.5" y2="21.5" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="12" y1="17" x2="14.5" y2="21.5" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M15.5 14 C17 13 19.5 13.5 18.8 15.5 C18.1 17 16 16.5 16 15Z"
          stroke={c} strokeWidth="1.2" fill={c} fillOpacity="0.15"/>
        <line x1="17.8" y1="15" x2="21" y2="18.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    nombre: "Accesorios", color: "#00897B", bg: "#E0F2F1",
    imagen: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&q=85&auto=format&fit=crop",
    icono: (c) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="9"  width="8" height="6" rx="2" stroke={c} strokeWidth="1.5"/>
        <rect x="14" y="9" width="8" height="6" rx="2" stroke={c} strokeWidth="1.5"/>
        <line x1="10" y1="11.5" x2="14" y2="11.5" stroke={c} strokeWidth="2" strokeLinecap="round"/>
        <line x1="10" y1="13.5" x2="14" y2="13.5" stroke={c} strokeWidth="2" strokeLinecap="round"/>
        <line x1="2" y1="12" x2="0" y2="12" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="22" y1="12" x2="24" y2="12" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export const CAT_ICONS = {
  'Todos':        LayoutGrid,
  'Conductores':  Zap,
  'Iluminación':  Lightbulb,
  'Tubería':      Layers,
  'Distribución': CircuitBoard,
  'Herramientas': Wrench,
  'EPP':          ShieldCheck,
  'Accesorios':   Package,
};
