import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useSearchParams } from "react-router-dom";
import { collection, getDocs, doc, setDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { AuthProvider, useAuth } from "./AuthContext";
import AdminPage from "./AdminPage";
import LoginPage from "./LoginPage";
import AccesoPage from "./AccesoPage";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  LayoutGrid, Zap, Lightbulb, Layers, CircuitBoard, Wrench, ShieldCheck, Package,
  ShoppingCart, Search, X, Plus, Minus, Trash2, FileText, ChevronRight,
  ArrowLeft, MessageCircle, Download, Phone, MapPin, Clock, Star, CheckCircle2,
  Menu, Filter, Tag
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// ICONOS SVG SIMPLES
// ═══════════════════════════════════════════════════════════════════════════════
const Iconos = {
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

// Marcas destacadas (para landing y filtros)
const MARCAS = [
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

// Categorías con iconos SVG específicos
const CATEGORIAS = [
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
    icono: (c) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        {/* Bobina de cable */}
        <circle cx="12" cy="12" r="8" stroke={c} strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="4.5" stroke={c} strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="1.5" fill={c}/>
        {/* extremos del cable */}
        <path d="M12 3.5 L12 2" stroke={c} strokeWidth="2" strokeLinecap="round"/>
        <path d="M20.5 12 L22 12" stroke={c} strokeWidth="2" strokeLinecap="round"/>
        <path d="M3.5 12 L2 12" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    nombre: "Iluminación", color: "#7AB800", bg: "#F1F8E9",
    icono: (c) => (
      // energia-verde: bombilla con hoja interior
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        {/* Bombilla */}
        <path d="M12 2C8.7 2 6 4.7 6 8c0 2.5 1.4 4.6 3.3 5.7L9.5 15.5h5l.2-1.8C16.6 12.6 18 10.5 18 8c0-3.3-2.7-6-6-6z"
          stroke={c} strokeWidth="1.4" fill={c} fillOpacity="0.10"/>
        {/* Base */}
        <line x1="9.5" y1="17.5" x2="14.5" y2="17.5" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="10.5" y1="19.5" x2="13.5" y2="19.5" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
        {/* Hoja dentro */}
        <path d="M12 14C10.3 12.3 10.3 9.2 12 7.8C13.7 9.2 13.7 12.3 12 14z" stroke={c} strokeWidth="1" fill={c} fillOpacity="0.35"/>
        <line x1="12" y1="7.8" x2="12" y2="14" stroke={c} strokeWidth="0.9" strokeLinecap="round" opacity="0.5"/>
        {/* Destellos laterales */}
        <line x1="3.5" y1="6" x2="2" y2="4.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
        <line x1="20.5" y1="6" x2="22" y2="4.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
        <line x1="4" y1="9.5" x2="2.5" y2="9.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
        <line x1="20" y1="9.5" x2="21.5" y2="9.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
      </svg>
    ),
  },
  {
    nombre: "Tubería", color: "#0288D1", bg: "#E1F5FE",
    icono: (c) => (
      // tubos: sección transversal de dos tubos conduit
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        {/* Tubo grande — sección circular */}
        <circle cx="8" cy="8.5" r="5.5" stroke={c} strokeWidth="1.4"/>
        <circle cx="8" cy="8.5" r="2.8" stroke={c} strokeWidth="1.2" fill={c} fillOpacity="0.13"/>
        {/* Tubo pequeño — sección circular */}
        <circle cx="18" cy="7" r="3.5" stroke={c} strokeWidth="1.4"/>
        <circle cx="18" cy="7" r="1.7" stroke={c} strokeWidth="1.1" fill={c} fillOpacity="0.13"/>
        {/* Cuerpo del tubo grande bajando */}
        <path d="M8 14 L8 20.5 Q8 22.5 10 22.5 L14.5 22.5" stroke={c} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
        {/* Tapa del extremo */}
        <ellipse cx="14.5" cy="22.5" rx="2" ry="1" stroke={c} strokeWidth="1.2" fill={c} fillOpacity="0.15"/>
      </svg>
    ),
  },
  {
    nombre: "Distribución", color: "#7B1FA2", bg: "#F3E5F5",
    icono: (c) => (
      // interruptor-automatico: breaker termomagnético con palanca
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        {/* Carcasa del breaker */}
        <rect x="7" y="2" width="10" height="20" rx="2.5" stroke={c} strokeWidth="1.4" fill={c} fillOpacity="0.07"/>
        {/* Palanca (posición ON — hacia arriba) */}
        <rect x="10" y="5" width="4" height="9" rx="2" stroke={c} strokeWidth="1.3" fill={c} fillOpacity="0.20"/>
        {/* Símbolo "I" en la palanca */}
        <line x1="12" y1="6.5" x2="12" y2="9.5" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
        {/* LED indicador */}
        <circle cx="12" cy="17.5" r="1.6" fill={c}/>
        {/* Tornillos / terminales arriba */}
        <line x1="10.5" y1="2" x2="10.5" y2="0.5" stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
        <line x1="13.5" y1="2" x2="13.5" y2="0.5" stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
        {/* Tornillos / terminales abajo */}
        <line x1="10.5" y1="22" x2="10.5" y2="23.5" stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
        <line x1="13.5" y1="22" x2="13.5" y2="23.5" stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    nombre: "Herramientas", color: "#F47920", bg: "#FFF3E0",
    icono: (c) => (
      // martillo: cabeza + mango en ángulo + garra
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <g transform="rotate(-38 12 12)">
          {/* Mango */}
          <rect x="10.5" y="10" width="3" height="12" rx="1.5" stroke={c} strokeWidth="1.3" fill={c} fillOpacity="0.09"/>
          {/* Cabeza del martillo */}
          <rect x="5" y="4" width="14" height="7" rx="2" stroke={c} strokeWidth="1.4" fill={c} fillOpacity="0.13"/>
          {/* Garra (ranura trasera) */}
          <path d="M5.5 6.5 L2.5 3.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M5.5 9 L2.5 8" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
          {/* Cara de golpe */}
          <line x1="19" y1="4.5" x2="19" y2="10.5" stroke={c} strokeWidth="1.8" strokeLinecap="round" opacity="0.5"/>
        </g>
      </svg>
    ),
  },
  {
    nombre: "EPP", color: "#C62828", bg: "#FFEBEE",
    icono: (c) => (
      // mantenimiento: trabajador con casco y llave
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        {/* Cabeza */}
        <circle cx="12" cy="3.8" r="2" stroke={c} strokeWidth="1.4"/>
        {/* Casco de seguridad */}
        <path d="M8.5 9 Q8.5 6 12 5.5 Q15.5 6 15.5 9" stroke={c} strokeWidth="1.3" fill={c} fillOpacity="0.13"/>
        <line x1="7" y1="9" x2="17" y2="9" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M8.5 9 Q8 10.5 9 11 L15 11 Q16 10.5 15.5 9" stroke={c} strokeWidth="1.2" fill="none"/>
        {/* Cuerpo */}
        <line x1="12" y1="11" x2="12" y2="17" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
        {/* Brazos */}
        <line x1="8.5" y1="14" x2="15.5" y2="14" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
        {/* Piernas */}
        <line x1="12" y1="17" x2="9.5" y2="21.5" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="12" y1="17" x2="14.5" y2="21.5" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
        {/* Llave inglesa en mano derecha */}
        <path d="M15.5 14 C17 13 19.5 13.5 18.8 15.5 C18.1 17 16 16.5 16 15Z"
          stroke={c} strokeWidth="1.2" fill={c} fillOpacity="0.15"/>
        <line x1="17.8" y1="15" x2="21" y2="18.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    nombre: "Accesorios", color: "#00897B", bg: "#E0F2F1",
    icono: (c) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        {/* Conector eléctrico macho-hembra */}
        <rect x="2" y="9"  width="8" height="6" rx="2" stroke={c} strokeWidth="1.5"/>
        <rect x="14" y="9" width="8" height="6" rx="2" stroke={c} strokeWidth="1.5"/>
        {/* clavijas */}
        <line x1="10" y1="11.5" x2="14" y2="11.5" stroke={c} strokeWidth="2" strokeLinecap="round"/>
        <line x1="10" y1="13.5" x2="14" y2="13.5" stroke={c} strokeWidth="2" strokeLinecap="round"/>
        {/* cables */}
        <line x1="2" y1="12" x2="0" y2="12" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="22" y1="12" x2="24" y2="12" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// HOOK: PRODUCTOS DESDE FIREBASE
// ═══════════════════════════════════════════════════════════════════════════════
function useProductos() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function cargar() {
      try {
        setCargando(true);
        const snap = await getDocs(collection(db, "productos"));
        const data = snap.docs.map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            nombre: d.title || "",
            marca: d.marca || d.vendor || "",
            categoria: d.categoria || "Accesorios",
            subcategoria: d.subcategoria || "",
            descripcion: d.description || d.descripcion || "",
            imagen: d.imagen_principal || "",
            imagen_2: d.imagen_2 || "",
            imagen_3: d.imagen_3 || "",
            precio: d.precio_desde || 0,
            activo: d.activo !== false,
            disponible: d.disponible !== false,
            tiene_variantes: d.tiene_variantes || false,
            variantes: d.variantes || [],
            especificaciones: d.especificaciones || {},
          };
        }).filter(p => p.activo);
        setProductos(data);
      } catch (e) {
        console.error(e);
        setError("Error al cargar productos");
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  return { productos, cargando, error };
}

// Obtener imágenes
function getImagenes(producto) {
  const imgs = [];
  if (producto.imagen) imgs.push(producto.imagen);
  if (producto.imagen_2) imgs.push(producto.imagen_2);
  if (producto.imagen_3) imgs.push(producto.imagen_3);
  return imgs;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: TARJETA DE PRODUCTO (con indicador de variantes)
// ═══════════════════════════════════════════════════════════════════════════════
function TarjetaProducto({ producto, onAgregar, onVerDetalle, compacta = false }) {
  const tieneVariantes = producto.tiene_variantes && producto.variantes?.length > 0;
  const precioMinimo = tieneVariantes
    ? Math.min(...producto.variantes.filter(v => v.precio > 0).map(v => v.precio))
    : producto.precio;

  if (compacta) {
    // Versión compacta para sección de relacionados
    return (
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm group transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
        onClick={() => onVerDetalle(producto)}>
        <div className="aspect-square bg-[#F5F5F7] flex items-center justify-center p-4 overflow-hidden relative">
          {producto.imagen ? (
            <img src={producto.imagen} alt={producto.nombre}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              onError={e => { e.target.style.display = 'none'; }} />
          ) : <Iconos.Rayo />}
          {tieneVariantes && (
            <span className="absolute top-2 right-2 bg-[#1D1D1F] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
              {producto.variantes.length} medidas
            </span>
          )}
        </div>
        <div className="p-3">
          <p className="text-[#1A1C1D] font-bold text-sm leading-tight line-clamp-2 mb-1">{producto.nombre}</p>
          <p className="text-[#6E6E73] text-xs mb-2">{producto.marca}</p>
          <p className="text-[#E0B11E] font-black text-base">
            {precioMinimo > 0
              ? <>{tieneVariantes && <span className="text-xs font-normal text-[#6E6E73]">Desde </span>}${precioMinimo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</>
              : <span className="text-xs text-[#6E6E73] font-semibold">Consultar</span>}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgba(26,28,29,0.07)] group transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(26,28,29,0.12)] flex flex-col">
      {/* Imagen */}
      <button
        onClick={() => onVerDetalle(producto)}
        className="w-full aspect-[4/3] bg-[#F5F5F7] flex items-center justify-center p-8 overflow-hidden relative"
      >
        {producto.imagen ? (
          <img
            src={producto.imagen}
            alt={producto.nombre}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="text-[#D2D2D7]"><Iconos.Rayo /></div>
        )}
        {tieneVariantes && (
          <span className="absolute top-3 right-3 bg-[#1D1D1F] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
            {producto.variantes.length} medidas
          </span>
        )}
      </button>

      {/* Info */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block px-2.5 py-1 bg-[#E0B11E]/20 text-[#765B00] font-bold text-[0.6rem] uppercase tracking-widest rounded-full">
            {producto.categoria}
          </span>
          {producto.subcategoria && (
            <span className="inline-block px-2.5 py-1 bg-[#F3F3F5] text-[#6E6E73] font-medium text-[0.6rem] uppercase tracking-widest rounded-full">
              {producto.subcategoria}
            </span>
          )}
        </div>
        <h3 className="text-[#1A1C1D] font-bold text-base leading-snug mb-1 line-clamp-2 flex-1">
          {producto.nombre}
        </h3>
        <p className="text-[#6E6E73] text-xs mb-4 font-medium uppercase tracking-wider">
          {producto.marca || 'ENERMAN'}
        </p>

        {/* Precio */}
        <div className="text-[#E0B11E] font-black text-2xl mb-5">
          {precioMinimo > 0 ? (
            <>
              {tieneVariantes && <span className="text-xs font-normal text-[#6E6E73]">Desde </span>}
              ${precioMinimo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              <span className="text-xs text-[#6E6E73] font-normal ml-1">MXN</span>
            </>
          ) : (
            <span className="text-sm text-[#6E6E73] font-semibold">Consultar precio</span>
          )}
        </div>

        {/* Botones */}
        <div className="grid grid-cols-2 gap-2 mt-auto">
          <button
            onClick={() => onVerDetalle(producto)}
            className="py-3 rounded-xl border border-[#E8E8EA] text-[#1A1C1D] font-bold text-xs uppercase tracking-wider hover:bg-[#F3F3F5] transition-all active:scale-95"
          >
            Ver detalle
          </button>
          <button
            onClick={() => tieneVariantes ? onVerDetalle(producto) : onAgregar(producto)}
            className="py-3 rounded-xl bg-[#E0B11E] text-[#241A00] font-bold text-xs uppercase tracking-wider hover:bg-[#F1C030] transition-all active:scale-95 shadow-sm"
          >
            {tieneVariantes ? 'Escoger' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: PÁGINA DE PRODUCTO (full-screen con relacionados)
// ═══════════════════════════════════════════════════════════════════════════════
function ModalDetalle({ producto, onCerrar, onAgregar, onVerDetalle, todos }) {
  const [imagenActiva, setImagenActiva] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [varianteSeleccionada, setVarianteSeleccionada] = useState(null);

  useEffect(() => {
    if (producto) {
      setImagenActiva(0);
      setCantidad(1);
      if (producto.tiene_variantes && producto.variantes?.length > 0) {
        setVarianteSeleccionada(producto.variantes[0]);
      } else {
        setVarianteSeleccionada(null);
      }
    }
  }, [producto]);

  // Bloquear scroll del body mientras está abierto
  useEffect(() => {
    if (producto) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [producto]);

  // Cerrar con ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCerrar(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCerrar]);

  if (!producto) return null;

  const imagenes = getImagenes(producto);
  const tieneVariantes = producto.tiene_variantes && producto.variantes?.length > 0;
  const precioActual = varianteSeleccionada?.precio || producto.precio;
  const disponibleActual = varianteSeleccionada?.disponible ?? producto.disponible;

  // Productos relacionados: misma categoría, excluye el actual
  const relacionados = (todos || [])
    .filter(p => p.id !== producto.id && p.categoria === producto.categoria)
    .slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 bg-[#F5F5F7] overflow-y-auto">

      {/* ── Header sticky ─────────────────────────────────────── */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-[#E8E8EA] px-4 md:px-8 py-3 flex items-center justify-between">
        <button
          onClick={onCerrar}
          className="flex items-center gap-2 text-sm font-semibold text-[#6E6E73] hover:text-[#1A1C1D] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Volver al catálogo</span>
          <span className="sm:hidden">Atrás</span>
        </button>
        <nav className="hidden lg:flex items-center gap-2 text-xs text-[#6E6E73]">
          <span>Catálogo</span>
          <span>›</span>
          <span>{producto.categoria}</span>
          <span>›</span>
          <span className="text-[#1A1C1D] font-semibold truncate max-w-[280px]">{producto.nombre}</span>
        </nav>
        <button
          onClick={onCerrar}
          className="w-9 h-9 rounded-full bg-[#F3F3F5] flex items-center justify-center hover:bg-[#E8E8EA]"
        >
          <Iconos.Cerrar />
        </button>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">

        {/* ── Sección principal ─────────────────────────────────── */}
        <div className="grid lg:grid-cols-[1fr_460px] gap-8 lg:gap-12 mb-16">

          {/* Galería */}
          <div className="lg:sticky lg:top-20 self-start">
            <div className="bg-white rounded-3xl aspect-square flex items-center justify-center p-8 shadow-sm mb-4 overflow-hidden">
              {imagenes.length > 0 ? (
                <img
                  src={imagenes[imagenActiva] || imagenes[0]}
                  alt={producto.nombre}
                  className="max-w-full max-h-full object-contain transition-opacity duration-200"
                />
              ) : (
                <div className="text-[#D2D2D7] w-20 h-20"><Iconos.Rayo /></div>
              )}
            </div>
            {imagenes.length > 1 && (
              <div className="flex gap-3 justify-center">
                {imagenes.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImagenActiva(i)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                      imagenActiva === i
                        ? 'border-[#E0B11E] shadow-md opacity-100'
                        : 'border-transparent opacity-50 hover:opacity-80'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain bg-[#F9F9FB]" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info del producto */}
          <div className="flex flex-col gap-5">

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-[#E0B11E]/20 text-[#765B00] font-bold text-xs uppercase tracking-wider rounded-full">
                {producto.categoria}
              </span>
              {producto.subcategoria && (
                <span className="px-3 py-1 bg-[#F3F3F5] text-[#6E6E73] font-medium text-xs rounded-full">
                  {producto.subcategoria}
                </span>
              )}
              {disponibleActual ? (
                <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                  <Iconos.Check /> Disponible
                </span>
              ) : (
                <span className="text-red-500 text-xs font-bold">● Agotado</span>
              )}
            </div>

            {/* Título */}
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-[#1A1C1D] leading-tight mb-2">
                {producto.nombre}
              </h1>
              <p className="text-sm text-[#6E6E73] uppercase tracking-widest">
                {producto.marca} · SKU: {producto.id}
              </p>
            </div>

            {/* Selector de variantes */}
            {tieneVariantes && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-[#6E6E73] mb-3">
                  Seleccionar medida
                </p>
                <p className="text-lg font-black text-[#E0B11E] mb-3">
                  {varianteSeleccionada?.nombre}
                  {varianteSeleccionada?.precio > 0 && (
                    <span className="text-sm font-normal text-[#6E6E73] ml-2">
                      — ${varianteSeleccionada.precio.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {producto.variantes.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setVarianteSeleccionada(v)}
                      disabled={!v.disponible}
                      className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${
                        varianteSeleccionada?.id === v.id
                          ? 'bg-[#1D1D1F] text-white border-[#1D1D1F] shadow-sm'
                          : v.disponible
                            ? 'bg-white text-[#1A1C1D] border-[#E8E8EA] hover:border-[#E0B11E]'
                            : 'bg-[#F9F9FB] text-[#C5C5C5] border-[#F3F3F5] cursor-not-allowed line-through'
                      }`}
                    >
                      {v.nombre}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Precio */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-[#6E6E73] mb-2">Precio unitario</p>
              <div className="text-4xl font-black text-[#E0B11E]">
                {precioActual > 0 ? (
                  <>
                    ${precioActual.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    <span className="text-base text-[#6E6E73] font-normal ml-2">MXN</span>
                  </>
                ) : (
                  <span className="text-xl text-[#6E6E73] font-semibold">Precio a consultar</span>
                )}
              </div>
              {precioActual > 0 && cantidad > 1 && (
                <p className="text-sm text-[#6E6E73] mt-2">
                  Total ({cantidad} pzas): <span className="font-black text-[#1A1C1D]">
                    ${(precioActual * cantidad).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </span>
                </p>
              )}
            </div>

            {/* Cantidad + Agregar */}
            <div className="flex gap-3">
              <div className="flex items-center bg-white rounded-2xl shadow-sm border border-[#E8E8EA]">
                <button
                  onClick={() => setCantidad(c => Math.max(1, c - 1))}
                  className="w-12 h-14 flex items-center justify-center hover:bg-[#F3F3F5] rounded-l-2xl"
                >
                  <Iconos.Menos />
                </button>
                <span className="w-10 text-center font-black text-lg">{cantidad}</span>
                <button
                  onClick={() => setCantidad(c => c + 1)}
                  className="w-12 h-14 flex items-center justify-center hover:bg-[#F3F3F5] rounded-r-2xl"
                >
                  <Iconos.Mas />
                </button>
              </div>
              <button
                onClick={() => onAgregar(producto, cantidad, varianteSeleccionada)}
                disabled={!disponibleActual}
                className={`flex-1 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all active:scale-95 ${
                  disponibleActual
                    ? 'bg-[#E0B11E] text-[#241A00] hover:bg-[#F1C030] shadow-md'
                    : 'bg-[#E8E8EA] text-[#6E6E73] cursor-not-allowed'
                }`}
              >
                {disponibleActual ? 'Añadir al pedido' : 'Agotado'}
              </button>
            </div>

            {/* Descripción */}
            {producto.descripcion && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-xs uppercase tracking-widest text-[#6E6E73] mb-3">Descripción</h3>
                <p className="text-sm text-[#1A1C1D] leading-relaxed">{producto.descripcion}</p>
              </div>
            )}

            {/* Especificaciones */}
            {producto.especificaciones && Object.keys(producto.especificaciones).length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-xs uppercase tracking-widest text-[#6E6E73] mb-3">Especificaciones</h3>
                <div className="divide-y divide-[#F3F3F5]">
                  {Object.entries(producto.especificaciones).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2.5 text-sm">
                      <span className="text-[#6E6E73] capitalize">{key}</span>
                      <span className="font-semibold text-[#1A1C1D]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Productos relacionados ────────────────────────────── */}
        {relacionados.length > 0 && (
          <section className="border-t border-[#E8E8EA] pt-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#6E6E73] mb-1">También puede interesarte</p>
                <h2 className="text-2xl font-black text-[#1A1C1D]">
                  Más en <span className="text-[#E0B11E]">{producto.categoria}</span>
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relacionados.map(p => (
                <TarjetaProducto
                  key={p.id}
                  producto={p}
                  onAgregar={onAgregar}
                  onVerDetalle={onVerDetalle}
                  compacta
                />
              ))}
            </div>
          </section>
        )}

        {/* Espacio inferior */}
        <div className="h-16" />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: CARRITO LATERAL (con qty +/-)
// ═══════════════════════════════════════════════════════════════════════════════
function CarritoLateral({ carrito, setCarrito, visible, onCerrar, onEliminar, navigate }) {
  if (!visible) return null;

  const total = carrito.reduce((sum, item) => sum + (item.precioFinal || item.precio || 0) * item.cantidad, 0);
  const aumentar = (id) => setCarrito(prev => prev.map(i => i._carritoId === id ? { ...i, cantidad: i.cantidad + 1 } : i));
  const disminuir = (id) => setCarrito(prev => prev.map(i => i._carritoId === id && i.cantidad > 1 ? { ...i, cantidad: i.cantidad - 1 } : i));

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onCerrar} />
      <aside className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col anim-slide-right">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-5 border-b border-[#E8E8EA]">
          <div>
            <h2 className="text-xl font-bold text-[#1A1C1D]">Tu Carrito</h2>
            {carrito.length > 0 && <p className="text-xs text-[#6E6E73]">{carrito.reduce((a,i)=>a+i.cantidad,0)} artículo(s)</p>}
          </div>
          <button onClick={onCerrar} className="w-10 h-10 rounded-full hover:bg-[#F3F3F5] flex items-center justify-center">
            <Iconos.Cerrar />
          </button>
        </header>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {carrito.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-[#F3F3F5] flex items-center justify-center mx-auto mb-3 text-[#D2D2D7]"><Iconos.Carrito /></div>
              <p className="text-[#6E6E73] text-sm font-medium">Tu carrito está vacío</p>
              <button onClick={() => { onCerrar(); navigate('/catalogo'); }} className="mt-3 text-xs text-[#E0B11E] font-bold hover:underline">Explorar productos →</button>
            </div>
          ) : (
            carrito.map(item => (
              <div key={item._carritoId} className="flex gap-3 p-3 bg-[#F9F9FB] rounded-2xl">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                  {item.imagen ? (
                    <img src={item.imagen} alt="" className="w-full h-full object-contain p-1" />
                  ) : (
                    <Iconos.Rayo />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-xs text-[#1A1C1D] line-clamp-2 leading-snug">{item.nombre}</h3>
                  {item.varianteNombre && <p className="text-[10px] text-[#6E6E73] mt-0.5">• {item.varianteNombre}</p>}
                  <div className="flex items-center justify-between mt-2">
                    {/* Qty */}
                    <div className="flex items-center gap-1 bg-white rounded-lg border border-[#E8E8EA]">
                      <button onClick={() => disminuir(item._carritoId)} className="w-6 h-6 rounded-l-lg flex items-center justify-center hover:bg-[#F3F3F5] text-sm font-bold">−</button>
                      <span className="w-6 text-center text-xs font-bold">{item.cantidad}</span>
                      <button onClick={() => aumentar(item._carritoId)} className="w-6 h-6 rounded-r-lg flex items-center justify-center hover:bg-[#F3F3F5] text-sm font-bold">+</button>
                    </div>
                    <p className="font-black text-[#E0B11E] text-sm">
                      {(item.precioFinal || item.precio) > 0 
                        ? `$${((item.precioFinal || item.precio) * item.cantidad).toFixed(2)}` 
                        : 'Consultar'}
                    </p>
                  </div>
                </div>
                <button onClick={() => onEliminar(item._carritoId)} className="text-[#C7C7CC] hover:text-red-500 transition-colors self-start mt-1">
                  <Iconos.Basura />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {carrito.length > 0 && (
          <footer className="p-5 border-t border-[#E8E8EA] space-y-3">
            <div className="flex justify-between items-end">
              <span className="font-bold text-[#1A1C1D] text-sm">Total estimado</span>
              <span className="text-xl font-black text-[#1A1C1D]">${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
            <button
              onClick={() => { onCerrar(); navigate('/pedido'); }}
              className="w-full py-3.5 rounded-2xl bg-[#E0B11E] text-[#241A00] font-bold text-sm uppercase tracking-wider hover:bg-[#F1C030] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              Ver pedido completo <Iconos.Flecha />
            </button>
            <p className="text-[10px] text-center text-[#6E6E73]">* Precios sujetos a confirmación</p>
          </footer>
        )}
      </aside>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: FOOTER (compartido)
// ═══════════════════════════════════════════════════════════════════════════════
function FooterEnerman() {
  return (
    <footer className="bg-[#1D1D1F] px-6 py-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Marca */}
        <div>
          <p className="text-2xl font-black text-[#E0B11E] tracking-tighter mb-2">ENERMAN</p>
          <p className="text-white/50 text-sm leading-relaxed">
            Distribuidora de material eléctrico en Monterrey, N.L.<br />
            Cables, iluminación, tubería, distribución y más.
          </p>
        </div>
        {/* Contacto */}
        <div>
          <p className="text-white/30 text-xs uppercase tracking-widest font-bold mb-4">Contacto</p>
          <div className="space-y-2 text-sm text-white/70">
            <a href="https://wa.me/528144994504" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 hover:text-[#E0B11E] transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.11 1.522 5.836L.044 23.956l6.285-1.647A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 01-4.99-1.364l-.358-.213-3.71.973.989-3.618-.234-.372A9.798 9.798 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
              </svg>
              814 499 4504
            </a>
            <a href="https://maps.google.com/?q=Calle+3914,+Monterrey,+Nuevo+León" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 hover:text-[#E0B11E] transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Calle 3914, Monterrey N.L.
            </a>
          </div>
        </div>
        {/* Redes */}
        <div>
          <p className="text-white/30 text-xs uppercase tracking-widest font-bold mb-4">Síguenos</p>
          <div className="flex gap-3">
            <a href="https://instagram.com/ENERMAN" target="_blank" rel="noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#E0B11E] hover:text-black transition-all text-white">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
            <a href="https://facebook.com/ENERMAN" target="_blank" rel="noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#E0B11E] hover:text-black transition-all text-white">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 mt-10 pt-6 text-center text-white/30 text-xs">
        ENERMAN © {new Date().getFullYear()} · Material Eléctrico · Monterrey, N.L. · @ENERMAN
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA: LANDING
// ═══════════════════════════════════════════════════════════════════════════════
// SVG pattern eléctrico para el hero
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

// ── Paisaje de torres en perspectiva — vista lateral de carretera ─────────────
const HeroTowers = () => {
  // 4 torres distribuidas en canvas 700×900 — perspectiva carretera
  const towers = [
    { cx: 115, gY: 828, tY: 746, w: 26,  op: 0.55 },  // lejana
    { cx: 268, gY: 840, tY: 710, w: 50,  op: 0.70 },  // media-lejana
    { cx: 462, gY: 854, tY: 664, w: 88,  op: 0.84 },  // media-cercana
    { cx: 630, gY: 868, tY: 560, w: 136, op: 0.97 },  // cercana (brazo derecho sale del canvas — ok)
  ];

  const getHW = (t, y) => {
    const pct = (t.gY - y) / (t.gY - t.tY);
    return (t.w / 2) * (1 - pct) + (t.w / 10) * pct;
  };

  const renderTower = (t, idx) => {
    const { cx, gY, tY, w, op } = t;
    const h = gY - tY;
    const sw = Math.max(op * 1.8, 0.3);
    const c = '#E0B11E';
    // zonas de la torre (proporciones reales de torre celosía)
    const waistY  = tY + h * 0.38;   // cintura (más angosta)
    const arm1Y   = tY + h * 0.08;   // brazo superior
    const arm2Y   = tY + h * 0.20;   // brazo inferior
    const topW    = w * 0.06;         // ancho en punta
    const waistW  = w * 0.10;         // ancho en cintura
    const botW    = w * 0.50;         // ancho en suelo
    const a1W     = w * 1.45;         // alcance brazo superior
    const a2W     = w * 1.08;         // alcance brazo inferior
    // celosía: secciones del cuerpo
    const sections = [
      [tY,      arm1Y,  topW,   topW ],
      [arm1Y,   arm2Y,  topW,   waistW*0.7],
      [arm2Y,   waistY, waistW*0.7, waistW],
      [waistY,  waistY + h*0.20, waistW, waistW*1.6],
      [waistY + h*0.20, waistY + h*0.40, waistW*1.6, botW*0.7],
      [waistY + h*0.40, gY,     botW*0.7, botW],
    ];
    const braces = [];
    sections.forEach(([y1,y2,hw1,hw2], si) => {
      braces.push(
        // contorno
        <line key={`lL${si}`} x1={cx-hw1} y1={y1} x2={cx-hw2} y2={y2} stroke={c} strokeWidth={sw*1.1} strokeOpacity={op*0.82}/>,
        <line key={`lR${si}`} x1={cx+hw1} y1={y1} x2={cx+hw2} y2={y2} stroke={c} strokeWidth={sw*1.1} strokeOpacity={op*0.82}/>,
        // celosía X interior
        <line key={`xA${si}`} x1={cx-hw1} y1={y1} x2={cx+hw2} y2={y2} stroke={c} strokeWidth={sw*0.6} strokeOpacity={op*0.35}/>,
        <line key={`xB${si}`} x1={cx+hw1} y1={y1} x2={cx-hw2} y2={y2} stroke={c} strokeWidth={sw*0.6} strokeOpacity={op*0.35}/>,
        // horizontal intermedio
        <line key={`hz${si}`} x1={cx-hw2} y1={y2} x2={cx+hw2} y2={y2} stroke={c} strokeWidth={sw*0.5} strokeOpacity={op*0.28}/>
      );
    });
    // aisladores colgantes (cortos tramos verticales + nodo)
    const insL = h * 0.07;
    const ld = `${1.3 + idx*0.32}s`;
    return (
      <g key={idx} opacity={op}>
        {/* Cuerpo celosía */}
        {braces}
        {/* BRAZO SUPERIOR */}
        <line x1={cx-a1W} y1={arm1Y} x2={cx+a1W} y2={arm1Y} stroke={c} strokeWidth={sw*1.6} strokeOpacity={0.95}/>
        <line x1={cx-topW} y1={tY+4} x2={cx-a1W} y2={arm1Y} stroke={c} strokeWidth={sw*0.7} strokeOpacity={0.55}/>
        <line x1={cx+topW} y1={tY+4} x2={cx+a1W} y2={arm1Y} stroke={c} strokeWidth={sw*0.7} strokeOpacity={0.55}/>
        {/* Aisladores brazo 1 — colgantes */}
        {[-1,1].map(s=>(
          <g key={s}>
            <line x1={cx+s*a1W} y1={arm1Y} x2={cx+s*a1W} y2={arm1Y+insL} stroke={c} strokeWidth={sw*1.2} strokeOpacity={0.9}/>
            <circle cx={cx+s*a1W} cy={arm1Y+insL} r={sw*2.2} fill="#FFD700" filter="url(#insGlow)"/>
          </g>
        ))}
        {/* BRAZO INFERIOR */}
        <line x1={cx-a2W} y1={arm2Y} x2={cx+a2W} y2={arm2Y} stroke={c} strokeWidth={sw*1.3} strokeOpacity={0.88}/>
        <line x1={cx-waistW*0.5} y1={arm1Y+insL*0.3} x2={cx-a2W} y2={arm2Y} stroke={c} strokeWidth={sw*0.55} strokeOpacity={0.45}/>
        <line x1={cx+waistW*0.5} y1={arm1Y+insL*0.3} x2={cx+a2W} y2={arm2Y} stroke={c} strokeWidth={sw*0.55} strokeOpacity={0.45}/>
        {[-1,1].map(s=>(
          <g key={s}>
            <line x1={cx+s*a2W} y1={arm2Y} x2={cx+s*a2W} y2={arm2Y+insL*0.8} stroke={c} strokeWidth={sw} strokeOpacity={0.85}/>
            <circle cx={cx+s*a2W} cy={arm2Y+insL*0.8} r={sw*1.8} fill="#FFD700" filter="url(#insGlow)"/>
          </g>
        ))}
        {/* Mástil superior */}
        <line x1={cx} y1={tY} x2={cx} y2={arm1Y} stroke={c} strokeWidth={sw*1.2} strokeOpacity={0.9}/>
        {/* Luz roja */}
        <circle cx={cx} cy={tY-4} r={sw*2.5} fill="#FF1A1A">
          <animate attributeName="opacity" values="0.9;0.1;0.9" dur={ld} repeatCount="indefinite"/>
        </circle>
        <circle cx={cx} cy={tY-4} r={sw*6} fill="#FF2020" opacity="0.12">
          <animate attributeName="opacity" values="0.12;0;0.12" dur={ld} repeatCount="indefinite"/>
        </circle>
      </g>
    );
  };

  // 3 fases de transmisión (fase A: izq arm1, fase B: der arm1, fase C: izq arm2)
  const cables = [];
  const particulas = [];
  for (let i = 0; i < towers.length - 1; i++) {
    const t1 = towers[i], t2 = towers[i+1];
    const h1 = t1.gY - t1.tY, h2 = t2.gY - t2.tY;
    const a1y1 = t1.tY + h1*0.08 + h1*0.07, a1y2 = t2.tY + h2*0.08 + h2*0.07;
    const a2y1 = t1.tY + h1*0.20 + h1*0.056, a2y2 = t2.tY + h2*0.20 + h2*0.056;
    const aw1L = t1.w*1.45, aw1R = t2.w*1.45;
    const aw2L = t1.w*1.08, aw2R = t2.w*1.08;
    const span = t2.cx - t1.cx;
    const sag1 = span * 0.038;
    const sag2 = span * 0.032;
    const mx = (t1.cx + t2.cx) / 2;
    const avgOp = (t1.op + t2.op) / 2;
    const lw = Math.max(avgOp * 1.5, 0.5);

    // 3 fases: fase A (izq-arm1), fase B (der-arm1), fase C (izq-arm2)
    const phA = `M${t1.cx-aw1L},${a1y1} Q${mx},${(a1y1+a1y2)/2+sag1} ${t2.cx-aw1R},${a1y2}`;
    const phB = `M${t1.cx+aw1L},${a1y1} Q${mx},${(a1y1+a1y2)/2+sag1} ${t2.cx+aw1R},${a1y2}`;
    const phC = `M${t1.cx-aw2L},${a2y1} Q${mx},${(a2y1+a2y2)/2+sag2} ${t2.cx-aw2R},${a2y2}`;

    cables.push(
      <path key={`phA-${i}`} d={phA} stroke="#E0B11E" strokeWidth={lw} strokeOpacity={avgOp*0.80} fill="none"/>,
      <path key={`phB-${i}`} d={phB} stroke="#E0B11E" strokeWidth={lw} strokeOpacity={avgOp*0.80} fill="none"/>,
      <path key={`phC-${i}`} d={phC} stroke="#E0B11E" strokeWidth={lw*0.85} strokeOpacity={avgOp*0.65} fill="none"/>,
    );

    // 1 partícula por fase
    const dur = `${4.5 - i*0.4}s`;
    particulas.push(
      <circle key={`p1-${i}`} r="2.5" fill="#FFE566" filter="url(#partGlow)">
        <animateMotion dur={dur} repeatCount="indefinite" begin={`${-i*0.8}s`} path={phA}/>
      </circle>,
      <circle key={`p2-${i}`} r="2.5" fill="#FFE566" filter="url(#partGlow)">
        <animateMotion dur={`${parseFloat(dur)+0.65}s`} repeatCount="indefinite" begin={`${-i*0.7-0.9}s`} path={phB}/>
      </circle>,
      <circle key={`p3-${i}`} r="2" fill="#FFD700" filter="url(#partGlow)">
        <animateMotion dur={`${parseFloat(dur)+1.1}s`} repeatCount="indefinite" begin={`${-i*0.5-0.4}s`} path={phC}/>
      </circle>,
    );
  }

  return (
    <svg className="absolute inset-0 w-full h-full"
      viewBox="0 0 700 900"
      preserveAspectRatio="xMidYMax slice"
      xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Neblina atmosférica suave — muestra 4 torres con profundidad */}
        <linearGradient id="fogL" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#0A0A0B" stopOpacity="0.95"/>
          <stop offset="10%"  stopColor="#0A0A0B" stopOpacity="0.52"/>
          <stop offset="22%"  stopColor="#0A0A0B" stopOpacity="0.26"/>
          <stop offset="42%"  stopColor="#0A0A0B" stopOpacity="0.10"/>
          <stop offset="68%"  stopColor="#0A0A0B" stopOpacity="0.03"/>
          <stop offset="100%" stopColor="#0A0A0B" stopOpacity="0"/>
        </linearGradient>
        {/* Resplandor cálido en el suelo */}
        <linearGradient id="horizG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#0A0A0B" stopOpacity="0"/>
          <stop offset="82%"  stopColor="#0A0A0B" stopOpacity="0"/>
          <stop offset="94%"  stopColor="#E0B11E" stopOpacity="0.07"/>
          <stop offset="100%" stopColor="#E0B11E" stopOpacity="0.16"/>
        </linearGradient>
        {/* Grid técnico sutil */}
        <pattern id="grid2" width="55" height="55" patternUnits="userSpaceOnUse">
          <path d="M 55 0 L 0 0 0 55" fill="none" stroke="#E0B11E" strokeWidth="0.3" strokeOpacity="0.045"/>
        </pattern>
        <filter id="insGlow" x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="3" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="partGlow" x="-300%" y="-300%" width="700%" height="700%">
          <feGaussianBlur stdDeviation="5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Fondo: grid técnico + resplandor de suelo */}
      <rect width="700" height="900" fill="url(#grid2)"/>
      <rect width="700" height="900" fill="url(#horizG)"/>
      {/* Línea de horizonte */}
      <line x1="0" y1="875" x2="700" y2="875" stroke="#E0B11E" strokeWidth="0.5" strokeOpacity="0.09"/>

      {/* Cables — 3 fases */}
      {cables}
      {/* Torres */}
      {towers.map(renderTower)}
      {/* Partículas de energía */}
      {particulas}

      {/* Neblina de perspectiva (encima de todo para suavizar torres lejanas) */}
      <rect width="700" height="900" fill="url(#fogL)"/>

      {/* Etiqueta técnica */}
      <g opacity="0.40">
        <rect x="548" y="14" width="140" height="20" rx="3" fill="none" stroke="#E0B11E" strokeWidth="0.6"/>
        <text x="556" y="27.5" fontSize="7.5" fill="#E0B11E" fontFamily="monospace">132 kV · ALTA TENSIÓN</text>
      </g>
    </svg>
  );
};

// Hook para scroll reveal
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
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#E0B11E] flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><path d="M11 2L4 11h6l-1 7 7-9h-6l1-7z" fill="#1A0E00" strokeLinejoin="round"/></svg>
          </div>
          <span className="text-lg font-black text-white tracking-tighter uppercase">ENERMAN</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-white/60 font-medium">
          <button onClick={() => navigate('/catalogo?categoria=Conductores')} className="hover:text-white transition-colors">Conductores</button>
          <button onClick={() => navigate('/catalogo?categoria=Iluminación')} className="hover:text-white transition-colors">Iluminación</button>
          <button onClick={() => navigate('/catalogo?categoria=Tubería')} className="hover:text-white transition-colors">Tubería</button>
          <button onClick={() => navigate('/catalogo')} className="hover:text-[#E0B11E] transition-colors font-bold">Ver todo</button>
        </nav>
        <div className="flex items-center gap-3">
          <a href="https://wa.me/528144994504" target="_blank" rel="noreferrer"
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366]/15 text-[#25D366] text-sm font-bold border border-[#25D366]/20 hover:bg-[#25D366]/25 transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.11 1.522 5.836L.044 23.956l6.285-1.647A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 01-4.99-1.364l-.358-.213-3.71.973.989-3.618-.234-.372A9.798 9.798 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>
            WhatsApp
          </a>
          <button onClick={() => navigate('/catalogo')}
            className="px-5 py-2 rounded-full bg-[#E0B11E] text-[#1A0E00] font-bold text-sm hover:bg-[#F1C030] transition-colors">
            Catálogo
          </button>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex overflow-hidden bg-[#0A0A0B]">

        {/* ── Lado izquierdo: contenido ──────────────────────────── */}
        <div className="relative z-10 flex flex-col justify-center w-full md:w-[54%] flex-shrink-0 min-h-screen">
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

        {/* ── Lado derecho: torres ──────────── */}
        <div className="hidden md:block absolute right-0 top-0 bottom-0 w-[52%] overflow-hidden">
          {/* Base oscura */}
          <div className="absolute inset-0 bg-[#080808]" />
          {/* Torres animadas */}
          <HeroTowers />
          {/* Separador vertical izquierdo */}
          <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-[#E0B11E]/20 to-transparent" />
          {/* Fade de fusión izquierdo */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0A0A0B] to-transparent pointer-events-none" />
          {/* Fade inferior */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0A0A0B]/80 to-transparent pointer-events-none" />
          {/* Fade superior */}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0A0A0B]/60 to-transparent pointer-events-none" />
        </div>

      </section>

      {/* ── CATEGORÍAS ──────────────────────────────────────────── */}
      <section className="bg-[#F2F2F7] px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-[#6E6E73] mb-2">Explora por categoría</p>
            <h2 className="text-4xl font-black text-[#1A1C1D]">¿Qué necesitas hoy?</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {CATEGORIAS.filter(c => c.nombre !== 'Todos').map(cat => (
              <button
                key={cat.nombre}
                onClick={() => navigate(`/catalogo?categoria=${cat.nombre}`)}
                className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left"
              >
                {/* ── Zona de imagen (swap: pon src cuando tengas foto) ── */}
                {cat.imagen ? (
                  <img src={cat.imagen} alt={cat.nombre}
                    className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-36 flex items-center justify-center relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${cat.color}18 0%, ${cat.color}08 100%)` }}>
                    {/* Patrón sutil */}
                    <div className="absolute inset-0 opacity-10"
                      style={{ backgroundImage: `radial-gradient(circle, ${cat.color} 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />
                    <div className="opacity-60 group-hover:scale-110 transition-transform duration-300 [&_svg]:!w-12 [&_svg]:!h-12">
                      {cat.icono(cat.color)}
                    </div>
                  </div>
                )}
                {/* Franja de color */}
                <div className="h-1" style={{ background: cat.color }} />
                {/* Info */}
                <div className="p-4">
                  <h3 className="font-black text-[#1A1C1D] text-sm mb-1">{cat.nombre}</h3>
                  <div className="flex items-center gap-1 text-xs font-bold"
                    style={{ color: cat.color }}>
                    Ver productos <ChevronRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICIOS ───────────────────────────────────────────── */}
      <section className="bg-white px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-[#6E6E73] mb-2">Lo que hacemos</p>
            <h2 className="text-4xl font-black text-[#1A1C1D]">Servicios eléctricos</h2>
            <p className="text-[#6E6E73] mt-3 max-w-xl">Más que una distribuidora — respaldamos tus proyectos con ingeniería, instalación y asesoría técnica especializada.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Zap,
                color: "#E0B11E",
                bg: "#FFF8E1",
                titulo: "Instalaciones eléctricas",
                desc: "Residencial, comercial e industrial. Proyectos desde cero con materiales certificados.",
                // imagen: "/servicios/instalaciones.jpg"  ← descomenta cuando tengas foto
              },
              {
                icon: CircuitBoard,
                color: "#7B1FA2",
                bg: "#F3E5F5",
                titulo: "Ingeniería eléctrica",
                desc: "Diseño de sistemas eléctricos, memorias de cálculo, planos y supervisión de obra.",
              },
              {
                icon: Wrench,
                color: "#F47920",
                bg: "#FFF3E0",
                titulo: "Mantenimiento",
                desc: "Preventivo y correctivo. Termografía, revisión de tableros, sustitución de equipos.",
              },
              {
                icon: Lightbulb,
                color: "#7AB800",
                bg: "#F1F8E9",
                titulo: "Proyectos de iluminación",
                desc: "Eficiencia energética con tecnología LED. Cálculo fotométrico y ahorro garantizado.",
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
              },
            ].map(({ icon: Icon, color, bg, titulo, desc, imagen }) => (
              <div key={titulo} className="group rounded-2xl overflow-hidden border border-[#E8E8EA] hover:border-transparent hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                {/* Zona imagen del servicio */}
                {imagen ? (
                  <img src={imagen} alt={titulo} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-40 flex items-center justify-center relative overflow-hidden" style={{ background: bg }}>
                    <div className="absolute inset-0 opacity-20"
                      style={{ backgroundImage: `radial-gradient(circle, ${color} 1px, transparent 1px)`, backgroundSize: '18px 18px' }} />
                    <Icon size={52} style={{ color }} strokeWidth={1} className="opacity-50 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                )}
                <div className="p-5 bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                      <Icon size={13} style={{ color }} />
                    </div>
                    <h3 className="font-black text-[#1A1C1D] text-sm">{titulo}</h3>
                  </div>
                  <p className="text-[#6E6E73] text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          {/* CTA contacto */}
          <div className="mt-12 bg-[#F9F9FB] rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-[#E8E8EA]">
            <div>
              <h3 className="font-black text-[#1A1C1D] text-xl mb-1">¿Tienes un proyecto?</h3>
              <p className="text-[#6E6E73] text-sm">Cuéntanos qué necesitas y te damos una cotización sin compromiso.</p>
            </div>
            <a href="https://wa.me/528144994504?text=Hola%20ENERMAN%2C%20quiero%20cotizar%20un%20servicio"
              target="_blank" rel="noreferrer"
              className="flex-shrink-0 flex items-center gap-3 px-7 py-3.5 rounded-xl bg-[#25D366] text-white font-bold hover:bg-[#22c55e] transition-colors shadow-lg shadow-[#25D366]/20">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.11 1.522 5.836L.044 23.956l6.285-1.647A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 01-4.99-1.364l-.358-.213-3.71.973.989-3.618-.234-.372A9.798 9.798 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>
              Cotizar por WhatsApp
            </a>
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

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA: CATÁLOGO
// ═══════════════════════════════════════════════════════════════════════════════
function CatalogoPage({ carrito, setCarrito }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { productos, cargando, error } = useProductos();
  const { user, perfil, isAdmin, logout } = useAuth();

  const POR_PAGINA = 12;
  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState(searchParams.get('categoria') || 'Todos');
  const [marcaActiva, setMarcaActiva] = useState(searchParams.get('marca') || '');
  const [subcatActiva, setSubcatActiva] = useState('');
  const [productoDetalle, setProductoDetalle] = useState(null);
  const [carritoVisible, setCarritoVisible] = useState(false);
  const [paginaActual, setPagina] = useState(1);
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  // Opciones dinámicas para sidebar
  const marcasDisponibles = useMemo(() => {
    const base = productos.filter(p => categoriaActiva === 'Todos' || p.categoria === categoriaActiva);
    const conteo = {};
    base.forEach(p => { if (p.marca) conteo[p.marca] = (conteo[p.marca] || 0) + 1; });
    return Object.entries(conteo).sort((a, b) => b[1] - a[1]);
  }, [productos, categoriaActiva]);

  const subcatsDisponibles = useMemo(() => {
    const base = productos.filter(p =>
      (categoriaActiva === 'Todos' || p.categoria === categoriaActiva) &&
      (!marcaActiva || p.marca === marcaActiva)
    );
    const conteo = {};
    base.forEach(p => { if (p.subcategoria) conteo[p.subcategoria] = (conteo[p.subcategoria] || 0) + 1; });
    return Object.entries(conteo).sort((a, b) => b[1] - a[1]);
  }, [productos, categoriaActiva, marcaActiva]);

  // Filtrar
  const productosFiltrados = useMemo(() => {
    return productos.filter(p => {
      const matchCategoria = categoriaActiva === 'Todos' || p.categoria === categoriaActiva;
      const matchMarca = !marcaActiva || p.marca === marcaActiva;
      const matchSubcat = !subcatActiva || p.subcategoria === subcatActiva;
      const matchBusqueda = !busqueda ||
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.marca.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.categoria.toLowerCase().includes(busqueda.toLowerCase()) ||
        (p.subcategoria || '').toLowerCase().includes(busqueda.toLowerCase());
      return matchCategoria && matchMarca && matchSubcat && matchBusqueda;
    });
  }, [productos, categoriaActiva, marcaActiva, subcatActiva, busqueda]);

  // Paginación
  const totalPaginas = Math.max(1, Math.ceil(productosFiltrados.length / POR_PAGINA));
  const productosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * POR_PAGINA;
    return productosFiltrados.slice(inicio, inicio + POR_PAGINA);
  }, [productosFiltrados, paginaActual]);

  // Resetear página al cambiar filtros
  useEffect(() => { setPagina(1); }, [busqueda, categoriaActiva, marcaActiva, subcatActiva]);

  // cambiarCategoria: limpia filtros derivados al cambiar de categoría manualmente
  const cambiarCategoria = useCallback((cat) => {
    setCategoriaActiva(cat);
    setMarcaActiva('');
    setSubcatActiva('');
  }, []);

  // Agregar al carrito (con soporte para variantes)
  const agregarAlCarrito = useCallback((producto, cantidad = 1, variante = null) => {
    if (!user) { navigate('/acceso'); return; }
    const precioFinal = variante?.precio || producto.precio;
    const varianteNombre = variante?.nombre || null;
    const varianteSku = variante?.sku || null;

    setCarrito(prev => [...prev, {
      ...producto,
      _carritoId: `${producto.id}_${variante?.id || 'base'}_${Date.now()}`,
      cantidad,
      precioFinal,
      varianteNombre,
      varianteSku,
      variante,
    }]);
    setProductoDetalle(null);
    setCarritoVisible(true);
  }, [setCarrito, user, navigate]);

  const eliminarDelCarrito = (id) => {
    setCarrito(prev => prev.filter(p => p._carritoId !== id));
  };

  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      {/* Header */}
      <header className="fixed top-0 w-full z-40 bg-[#1D1D1F] px-6 h-20 flex items-center justify-between">
        <Link to="/" className="text-xl font-black text-[#E0B11E] tracking-tighter uppercase">ENERMAN</Link>

        {/* Buscador */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8">
          <div className="relative w-full">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"><Search size={18} /></span>
            <input
              type="text"
              placeholder="Buscar producto, marca..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full text-sm bg-white/10 text-white border border-white/10 focus:outline-none focus:border-[#E0B11E]"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link to="/acceso" className="hidden md:flex text-white/70 hover:text-white text-sm font-medium transition-colors">
                Iniciar sesión
              </Link>
              <Link to="/acceso" className="hidden md:flex px-4 py-2 rounded-full bg-[#E0B11E] text-[#1A0E00] font-bold text-xs hover:bg-[#F0C22E] transition-colors">
                Registrarse
              </Link>
            </>
          ) : isAdmin ? (
            <Link to="/enr-admin" className="hidden md:flex text-white/70 hover:text-white text-sm font-medium transition-colors">Admin</Link>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <span className="text-white/60 text-xs max-w-[130px] truncate">
                {perfil?.nombre || user.phoneNumber || user.email}
              </span>
              <button onClick={logout} className="text-white/40 hover:text-white/70 text-xs transition-colors">Salir</button>
            </div>
          )}
          <button onClick={() => setCarritoVisible(true)} className="relative p-2 text-[#E0B11E]">
            <ShoppingCart size={24} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#E0B11E] text-[#1D1D1F] text-xs font-bold flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
        {/* Categorías */}
        <div className="flex justify-center gap-2 overflow-x-auto no-scrollbar py-2 mb-6 flex-wrap">
          {CATEGORIAS.map(cat => {
            const activa = categoriaActiva === cat.nombre;
            return (
              <button
                key={cat.nombre}
                onClick={() => cambiarCategoria(cat.nombre)}
                className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl transition-all min-w-[80px] border-2 ${
                  activa
                    ? 'shadow-md scale-[1.04]'
                    : 'bg-white border-transparent hover:border-gray-100 hover:shadow-sm'
                }`}
                style={activa ? { background: cat.bg, borderColor: cat.color + '55' } : {}}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                  style={{ background: activa ? cat.color : '#F3F3F5' }}>
                  {cat.icono(activa ? 'white' : '#6E6E73')}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide leading-tight text-center"
                  style={{ color: activa ? cat.color : '#6E6E73' }}>
                  {cat.nombre}
                </span>
              </button>
            );
          })}
        </div>

        {/* Buscador móvil */}
        <div className="md:hidden mb-6">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6E6E73]"><Iconos.Buscar /></span>
            <input
              type="text"
              placeholder="Buscar..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#E0B11E]"
            />
          </div>
        </div>

        {/* Banner de marca activa */}
        {marcaActiva && (() => {
          const marcaInfo = MARCAS.find(m => m.nombre === marcaActiva);
          if (!marcaInfo) return null;
          return (
            <div className="rounded-2xl mb-6 overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${marcaInfo.color}22 0%, ${marcaInfo.color}08 100%)`, border: `2px solid ${marcaInfo.color}33` }}>
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm"
                  style={{ background: marcaInfo.color }}>
                  {marcaActiva.slice(0, 2)}
                </div>
                <div>
                  <p className="font-black text-lg" style={{ color: marcaInfo.color }}>{marcaActiva}</p>
                  <p className="text-xs text-[#6E6E73]">{marcaInfo.categoria} · {productosFiltrados.length} producto(s)</p>
                </div>
                <button onClick={() => setMarcaActiva('')}
                  className="ml-auto text-xs font-bold px-3 py-1.5 rounded-xl transition-all hover:opacity-80"
                  style={{ background: marcaInfo.color, color: 'white' }}>
                  Ver todos
                </button>
              </div>
            </div>
          );
        })()}

        {/* Título + filtros activos */}
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-[#1A1C1D]">
              {marcaActiva || (categoriaActiva === 'Todos' ? 'Todos los productos' : categoriaActiva)}
            </h1>
            {/* Chips de filtros activos */}
            {marcaActiva && (
              <button onClick={() => setMarcaActiva('')}
                className="flex items-center gap-1 px-3 py-1 bg-[#E0B11E] text-[#241A00] rounded-full text-xs font-bold">
                {marcaActiva} ✕
              </button>
            )}
            {subcatActiva && (
              <button onClick={() => setSubcatActiva('')}
                className="flex items-center gap-1 px-3 py-1 bg-[#1D1D1F] text-white rounded-full text-xs font-bold">
                {subcatActiva} ✕
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#6E6E73]">
              {productosFiltrados.length} producto(s){totalPaginas > 1 && ` · p.${paginaActual}/${totalPaginas}`}
            </span>
            {/* Toggle sidebar móvil */}
            <button onClick={() => setSidebarAbierto(s => !s)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-sm font-bold text-[#1A1C1D] shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M3 12h12M3 20h6" />
              </svg>
              Filtros {(marcaActiva || subcatActiva) && '•'}
            </button>
          </div>
        </div>

        {/* Layout: sidebar + grid */}
        <div className="flex gap-6 items-start">

          {/* ── Sidebar de filtros ─────────────────────────────── */}
          <aside className={`
            ${sidebarAbierto ? 'block' : 'hidden'} lg:block
            w-full lg:w-52 flex-shrink-0
            bg-white rounded-2xl p-5 shadow-sm
            lg:sticky lg:top-24 self-start
          `}>
            <div className="flex items-center justify-between mb-4 lg:mb-5">
              <p className="font-black text-sm text-[#1A1C1D] uppercase tracking-wider">Filtros</p>
              {(marcaActiva || subcatActiva) && (
                <button onClick={() => { setMarcaActiva(''); setSubcatActiva(''); }}
                  className="text-xs text-[#E0B11E] font-bold hover:underline">
                  Limpiar
                </button>
              )}
            </div>

            {/* Marcas */}
            {marcasDisponibles.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-[#6E6E73] mb-3">Marca</p>
                <div className="space-y-1">
                  {marcasDisponibles.map(([marca, count]) => (
                    <button
                      key={marca}
                      onClick={() => setMarcaActiva(marcaActiva === marca ? '' : marca)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
                        marcaActiva === marca
                          ? 'bg-[#1D1D1F] text-white font-bold'
                          : 'hover:bg-[#F5F5F7] text-[#1A1C1D]'
                      }`}
                    >
                      <span>{marca}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        marcaActiva === marca ? 'bg-white/20 text-white' : 'bg-[#F3F3F5] text-[#6E6E73]'
                      }`}>{count}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Subcategoría */}
            {subcatsDisponibles.length > 1 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#6E6E73] mb-3">
                  {categoriaActiva === 'Conductores' ? 'Calibre / Tipo' :
                   categoriaActiva === 'Tubería' ? 'Tipo' : 'Subcategoría'}
                </p>
                <div className="space-y-1">
                  {subcatsDisponibles.map(([subcat, count]) => (
                    <button
                      key={subcat}
                      onClick={() => setSubcatActiva(subcatActiva === subcat ? '' : subcat)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
                        subcatActiva === subcat
                          ? 'bg-[#E0B11E] text-[#241A00] font-bold'
                          : 'hover:bg-[#F5F5F7] text-[#1A1C1D]'
                      }`}
                    >
                      <span className="truncate text-left">{subcat}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ml-1 ${
                        subcatActiva === subcat ? 'bg-[#241A00]/20 text-[#241A00]' : 'bg-[#F3F3F5] text-[#6E6E73]'
                      }`}>{count}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* ── Contenido principal ────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Loading */}
            {cargando && (
              <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-[#E8E8EA] border-t-[#E0B11E] rounded-full animate-spin" />
              </div>
            )}
            {/* Error */}
            {error && <div className="text-center py-20 text-red-500">{error}</div>}

            {/* Grid */}
            {!cargando && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {productosPaginados.map(producto => (
                  <TarjetaProducto
                    key={producto.id}
                    producto={producto}
                    onAgregar={agregarAlCarrito}
                    onVerDetalle={setProductoDetalle}
                  />
                ))}
              </div>
            )}

            {/* Sin resultados */}
            {!cargando && !error && productosFiltrados.length === 0 && (
              <div className="text-center py-20">
                <p className="text-[#6E6E73] mb-4">No se encontraron productos con esos filtros</p>
                <button
                  onClick={() => { setCategoriaActiva('Todos'); setBusqueda(''); setMarcaActiva(''); setSubcatActiva(''); }}
                  className="px-6 py-3 rounded-full bg-[#E0B11E] text-[#241A00] font-bold"
                >
                  Limpiar todos los filtros
                </button>
              </div>
            )}

            {/* Paginación */}
            {!cargando && totalPaginas > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => { setPagina(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={paginaActual === 1}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${paginaActual === 1 ? 'bg-[#E8E8EA] text-[#C5C5C5] cursor-not-allowed' : 'bg-white text-[#1A1C1D] hover:bg-[#F3F3F5] shadow-sm'}`}
                >← Anterior</button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                    .filter(n => n === 1 || n === totalPaginas || Math.abs(n - paginaActual) <= 2)
                    .reduce((acc, n, idx, arr) => { if (idx > 0 && n - arr[idx - 1] > 1) acc.push('...'); acc.push(n); return acc; }, [])
                    .map((item, i) => item === '...'
                      ? <span key={`d${i}`} className="w-10 h-10 flex items-center justify-center text-[#6E6E73] text-sm">…</span>
                      : <button key={item} onClick={() => { setPagina(item); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${paginaActual === item ? 'bg-[#E0B11E] text-[#241A00] shadow-md' : 'bg-white text-[#1A1C1D] hover:bg-[#F3F3F5]'}`}>{item}</button>
                    )}
                </div>
                <button
                  onClick={() => { setPagina(p => Math.min(totalPaginas, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={paginaActual === totalPaginas}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${paginaActual === totalPaginas ? 'bg-[#E8E8EA] text-[#C5C5C5] cursor-not-allowed' : 'bg-white text-[#1A1C1D] hover:bg-[#F3F3F5] shadow-sm'}`}
                >Siguiente →</button>
              </div>
            )}
          </div>{/* fin contenido principal */}
        </div>{/* fin flex sidebar+grid */}
      </main>

      {/* Página de producto */}
      <ModalDetalle
        producto={productoDetalle}
        onCerrar={() => setProductoDetalle(null)}
        onAgregar={agregarAlCarrito}
        onVerDetalle={setProductoDetalle}
        todos={productos}
      />

      {/* Carrito */}
      <CarritoLateral
        carrito={carrito}
        setCarrito={setCarrito}
        visible={carritoVisible}
        onCerrar={() => setCarritoVisible(false)}
        onEliminar={eliminarDelCarrito}
        navigate={navigate}
      />

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}.line-clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER: carga imagen como base64 para incrustar en PDF
// ═══════════════════════════════════════════════════════════════════════════════
async function cargarImagenBase64(url) {
  if (!url) return null;
  // Intento 1: fetch directo
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    // Intento 2: Image + canvas (para URLs con CORS permisivo)
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = 120; canvas.height = 120;
          canvas.getContext("2d").drawImage(img, 0, 0, 120, 120);
          resolve(canvas.toDataURL("image/jpeg", 0.75));
        } catch { resolve(null); }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA: PEDIDO
// ═══════════════════════════════════════════════════════════════════════════════
function PedidoPage({ carrito, setCarrito }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [nota, setNota] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState(null); // { texto, color }

  const piezas = carrito.reduce((acc, i) => acc + i.cantidad, 0);
  const total = carrito.reduce((acc, i) => {
    const precio = i.precioFinal || i.precio || 0;
    return acc + (precio > 0 ? precio * i.cantidad : 0);
  }, 0);

  const aumentar = id => setCarrito(prev => prev.map(i => i._carritoId === id ? { ...i, cantidad: i.cantidad + 1 } : i));
  const disminuir = id => setCarrito(prev => prev.map(i => i._carritoId === id && i.cantidad > 1 ? { ...i, cantidad: i.cantidad - 1 } : i));
  const eliminar = id => setCarrito(prev => prev.filter(i => i._carritoId !== id));
  const vaciar = () => { if (confirm("¿Vaciar todo el pedido?")) setCarrito([]); };

  const mostrarAviso = (texto, color = "#25D366") => {
    setAviso({ texto, color });
    setTimeout(() => setAviso(null), 5000);
  };

  // Construye el mensaje de texto para WhatsApp
  const buildMensaje = () => {
    const fecha = new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
    const lineas = carrito.map((item, i) => {
      const precio = item.precioFinal || item.precio || 0;
      const variante = item.varianteNombre ? ` (${item.varianteNombre})` : "";
      const subtotal = precio > 0 ? `$${(precio * item.cantidad).toFixed(2)} MXN` : "Consultar precio";
      return `${i + 1}. ${item.nombre}${variante}\n   Cant: ${item.cantidad}${precio > 0 ? ` | $${precio.toFixed(2)} c/u` : ""} | *${subtotal}*`;
    });
    const totalTexto = total > 0 ? `\n*Total: $${total.toFixed(2)} MXN*` : "";
    const notaTexto = nota.trim() ? `\n📝 Notas: ${nota.trim()}` : "";
    return `*PEDIDO ENERMAN* 📦\n_${fecha}_\n\n${lineas.join("\n\n")}${totalTexto}${notaTexto}`;
  };

  // Genera el documento PDF con imágenes
  const buildPDF = async (imagenesCache) => {
    const doc = new jsPDF();
    const fecha = new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });
    const pageW = doc.internal.pageSize.width;
    const pageH = doc.internal.pageSize.height;

    // ── Encabezado ───────────────────────────────────────────
    doc.setFillColor(29, 29, 31);
    doc.rect(0, 0, pageW, 32, "F");
    doc.setFontSize(20); doc.setFont("helvetica", "bold");
    doc.setTextColor(224, 177, 30);
    doc.text("ENERMAN", 14, 20);
    doc.setFontSize(8); doc.setFont("helvetica", "normal");
    doc.setTextColor(160, 160, 160);
    doc.text("Material Eléctrico · Monterrey, N.L.", 14, 28);
    doc.text(`Pedido: ${fecha}`, pageW - 14, 20, { align: "right" });
    doc.text("Tel: 814 499 4504", pageW - 14, 28, { align: "right" });

    // ── Tabla ────────────────────────────────────────────────
    const filas = carrito.map((item) => {
      const precio = item.precioFinal || item.precio || 0;
      return [
        "",  // columna imagen
        item.nombre,
        item.marca || "—",
        item.varianteNombre || "—",
        item.cantidad,
        precio > 0 ? `$${Number(precio).toFixed(2)}` : "Consultar",
        precio > 0 ? `$${(Number(precio) * item.cantidad).toFixed(2)}` : "Consultar",
      ];
    });

    autoTable(doc, {
      startY: 38,
      head: [["", "Producto", "Marca", "Medida", "Cant", "P.Unit", "Subtotal"]],
      body: filas,
      columnStyles: {
        0: { cellWidth: 16 },
        1: { cellWidth: 60 },
        2: { cellWidth: 28 },
        3: { cellWidth: 22 },
        4: { cellWidth: 12, halign: "center" },
        5: { cellWidth: 24, halign: "right" },
        6: { cellWidth: 24, halign: "right" },
      },
      bodyStyles: { minCellHeight: 18, fontSize: 8, valign: "middle" },
      headStyles: { fillColor: [29, 29, 31], textColor: [224, 177, 30], fontSize: 8 },
      alternateRowStyles: { fillColor: [248, 248, 250] },
      margin: { left: 10, right: 10 },
      didDrawCell: (data) => {
        if (data.column.index === 0 && data.section === "body") {
          const img = imagenesCache[data.row.index];
          if (img) {
            const s = Math.min(data.cell.height - 4, 13);
            doc.addImage(img, "JPEG",
              data.cell.x + (data.cell.width - s) / 2,
              data.cell.y + (data.cell.height - s) / 2,
              s, s);
          }
        }
      },
    });

    const finalY = doc.lastAutoTable.finalY;

    // ── Total ────────────────────────────────────────────────
    if (total > 0) {
      doc.setFillColor(29, 29, 31);
      doc.rect(pageW - 80, finalY + 4, 70, 14, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(10);
      doc.setTextColor(224, 177, 30);
      doc.text(`Total: $${total.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN`, pageW - 14, finalY + 14, { align: "right" });
    }

    // ── Notas ────────────────────────────────────────────────
    if (nota.trim()) {
      doc.setFont("helvetica", "normal"); doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text(`Notas: ${nota}`, 14, finalY + (total > 0 ? 26 : 12));
    }

    // ── Pie de página ────────────────────────────────────────
    doc.setFillColor(29, 29, 31);
    doc.rect(0, pageH - 12, pageW, 12, "F");
    doc.setFontSize(7); doc.setTextColor(120, 120, 120);
    doc.text("ENERMAN · Calle 3914, Monterrey N.L. · 814 499 4504 · @ENERMAN", pageW / 2, pageH - 4, { align: "center" });

    return doc;
  };

  // ── Guardar pedido en Firestore ───────────────────────────
  const guardarPedidoFirestore = async () => {
    if (!user) return;
    try {
      await addDoc(collection(db, "pedidos", user.uid, "historial"), {
        items: carrito.map(i => ({
          id: i.id || null,
          nombre: i.nombre,
          marca: i.marca || "",
          cantidad: i.cantidad,
          precio: i.precioFinal || i.precio || 0,
          varianteNombre: i.varianteNombre || null,
        })),
        total,
        nota: nota.trim() || null,
        fecha: serverTimestamp(),
        estado: "enviado",
        canal: "whatsapp",
      });
    } catch {
      // No bloqueamos el flujo si falla el guardado
    }
  };

  // ── Botón principal: genera PDF + abre WhatsApp ──────────
  const enviarPedido = async () => {
    if (!user) { navigate("/acceso"); return; }
    setEnviando(true);
    try {
      const imagenesCache = await Promise.all(carrito.map(i => cargarImagenBase64(i.imagen)));
      const doc = await buildPDF(imagenesCache);
      const mensaje = buildMensaje();
      const waUrl = `https://wa.me/${WHATSAPP_VENTAS}?text=${encodeURIComponent(mensaje)}`;
      const nombre = `ENERMAN_Pedido_${Date.now()}.pdf`;
      await guardarPedidoFirestore();

      // En móvil: Web Share API → comparte PDF directo a WhatsApp
      if (navigator.canShare) {
        const blob = doc.output("blob");
        const archivo = new File([blob], nombre, { type: "application/pdf" });
        if (navigator.canShare({ files: [archivo] })) {
          try {
            await navigator.share({ files: [archivo], title: "Pedido ENERMAN", text: mensaje });
            return;
          } catch (e) {
            if (e.name === "AbortError") return;
          }
        }
      }

      // En desktop: descarga PDF + abre WhatsApp texto
      doc.save(nombre);
      setTimeout(() => window.open(waUrl, "_blank"), 600);
      mostrarAviso("✅ PDF descargado · Adjúntalo en WhatsApp al enviar el mensaje", "#1D1D1F");
    } finally {
      setEnviando(false);
    }
  };

  // ── Solo descargar PDF ───────────────────────────────────
  const soloDescargarPDF = async () => {
    setEnviando(true);
    try {
      const imagenesCache = await Promise.all(carrito.map(i => cargarImagenBase64(i.imagen)));
      const doc = await buildPDF(imagenesCache);
      doc.save(`ENERMAN_Pedido_${Date.now()}.pdf`);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-[#1D1D1F] text-white px-4 py-3 flex items-center justify-between shadow-lg">
        <button onClick={() => navigate("/catalogo")} className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Seguir comprando
        </button>
        <div className="flex items-center gap-2">
          <ShoppingCart size={18} className="text-[#E0B11E]" />
          <span className="font-bold text-[#E0B11E]">ENERMAN</span>
          <span className="text-white/50 text-xs">· Pedido</span>
        </div>
        {carrito.length > 0 && (
          <button onClick={vaciar} className="text-xs text-red-400 hover:text-red-300 font-medium">
            Vaciar
          </button>
        )}
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">

        {carrito.length === 0 ? (
          <div className="bg-white rounded-3xl p-20 text-center shadow-sm">
            <div className="w-20 h-20 bg-[#F3F3F5] rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart size={36} className="text-[#C7C7CC]" />
            </div>
            <h2 className="text-2xl font-bold text-[#1A1C1D] mb-2">Tu pedido está vacío</h2>
            <p className="text-[#6E6E73] mb-8">Agrega productos desde el catálogo para armar tu pedido.</p>
            <button onClick={() => navigate("/catalogo")} className="px-10 py-3.5 rounded-full bg-[#E0B11E] text-[#241A00] font-bold shadow-md hover:shadow-lg transition-shadow">
              Ir al catálogo
            </button>
          </div>
        ) : (
          <>
            {/* Header resumen rápido */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "Productos", value: carrito.length, icon: Package },
                { label: "Piezas", value: piezas, icon: Tag },
                { label: "Total estimado", value: total > 0 ? `$${total.toLocaleString('es-MX',{minimumFractionDigits:2})}` : "Consultar", icon: CheckCircle2 },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-[#FFF8E1] flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-[#E0B11E]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#6E6E73] uppercase font-bold tracking-wider">{label}</p>
                    <p className="font-black text-[#1A1C1D] text-sm">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_320px] items-start">
              {/* ── Lista de productos ──────────────────────────── */}
              <div className="space-y-3">
                <h2 className="font-black text-[#1A1C1D] text-lg mb-4">Artículos en tu pedido</h2>
                {carrito.map((item, idx) => {
                  const precio = item.precioFinal || item.precio || 0;
                  return (
                    <div key={item._carritoId} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex gap-0">
                        {/* Imagen */}
                        <div className="w-24 h-24 bg-[#F3F3F5] flex items-center justify-center flex-shrink-0">
                          {item.imagen
                            ? <img src={item.imagen} alt="" className="w-full h-full object-contain p-2" />
                            : <Zap size={28} className="text-[#C7C7CC]" />}
                        </div>
                        {/* Info */}
                        <div className="flex-1 px-4 py-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-xs font-bold text-[#E0B11E] uppercase tracking-wider">{item.marca}</p>
                              <h3 className="font-bold text-[#1A1C1D] text-sm leading-snug">{item.nombre}</h3>
                              {item.varianteNombre && (
                                <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-[#F3F3F5] text-[#6E6E73] font-medium">
                                  {item.varianteNombre}
                                </span>
                              )}
                            </div>
                            <button onClick={() => eliminar(item._carritoId)} className="text-[#C7C7CC] hover:text-red-500 transition-colors flex-shrink-0 mt-0.5">
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            {/* Cantidad */}
                            <div className="flex items-center gap-1 bg-[#F3F3F5] rounded-xl px-1 py-1">
                              <button onClick={() => disminuir(item._carritoId)} className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-sm hover:bg-[#E0B11E] hover:text-[#241A00] transition-colors">
                                <Minus size={13} />
                              </button>
                              <span className="w-8 text-center text-sm font-bold">{item.cantidad}</span>
                              <button onClick={() => aumentar(item._carritoId)} className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-sm hover:bg-[#E0B11E] hover:text-[#241A00] transition-colors">
                                <Plus size={13} />
                              </button>
                            </div>
                            {/* Precio */}
                            <div className="text-right">
                              {precio > 0 && <p className="text-[10px] text-[#6E6E73]">${precio.toFixed(2)} c/u</p>}
                              <p className="font-black text-[#E0B11E]">
                                {precio > 0 ? `$${(precio * item.cantidad).toFixed(2)}` : 'Consultar'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Panel derecho ───────────────────────────────── */}
              <div className="space-y-4">
                {/* Resumen de cobro */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <h3 className="font-black text-[#1A1C1D] mb-4">Resumen del pedido</h3>
                  <div className="space-y-2.5 text-sm">
                    {carrito.map(item => {
                      const p = item.precioFinal || item.precio || 0;
                      return (
                        <div key={item._carritoId} className="flex justify-between text-[#6E6E73]">
                          <span className="truncate mr-2">{item.nombre} ×{item.cantidad}</span>
                          <span className="flex-shrink-0 font-medium text-[#1A1C1D]">
                            {p > 0 ? `$${(p * item.cantidad).toFixed(2)}` : '—'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {total > 0 && (
                    <div className="flex justify-between items-center pt-4 mt-4 border-t border-[#E8E8EA]">
                      <span className="font-bold text-[#1A1C1D]">Total estimado</span>
                      <span className="text-xl font-black text-[#E0B11E]">
                        ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  <p className="text-[10px] text-[#6E6E73] mt-2">* Precios sujetos a confirmación. No incluye IVA.</p>
                </div>

                {/* Notas */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <h3 className="font-bold text-[#1A1C1D] mb-3 text-sm">Notas del pedido</h3>
                  <textarea
                    value={nota}
                    onChange={e => setNota(e.target.value)}
                    placeholder="Ej: entrega urgente, color específico, obra en Monterrey..."
                    rows={3}
                    className="w-full rounded-xl bg-[#F9F9FB] px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#E0B11E] border border-[#E8E8EA]"
                  />
                </div>

                {/* Aviso */}
                {aviso && (
                  <div style={{ background: aviso.color }}
                    className="text-white text-xs font-semibold px-4 py-3 rounded-xl text-center leading-snug shadow-md">
                    {aviso.texto}
                  </div>
                )}

                {/* Botón WhatsApp */}
                <button
                  onClick={enviarPedido}
                  disabled={enviando}
                  className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 disabled:opacity-60 shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #25D366 0%, #1DA851 100%)', color: 'white' }}
                >
                  {enviando ? (
                    <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Generando PDF...</>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.11 1.522 5.836L.044 23.956l6.285-1.647A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 01-4.99-1.364l-.358-.213-3.71.973.989-3.618-.234-.372A9.798 9.798 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
                      </svg>
                      <div className="text-left">
                        <p className="text-sm font-black leading-tight">Enviar pedido por WhatsApp</p>
                        <p className="text-[10px] opacity-80 font-normal">Genera PDF + abre conversación</p>
                      </div>
                    </>
                  )}
                </button>

                {/* Solo PDF */}
                <button
                  onClick={soloDescargarPDF}
                  disabled={enviando}
                  className="w-full py-3 rounded-2xl bg-white border border-[#E8E8EA] text-[#1A1C1D] font-bold flex items-center justify-center gap-2 text-sm disabled:opacity-60 hover:border-[#E0B11E] transition-colors shadow-sm"
                >
                  <Download size={16} className="text-[#6E6E73]" /> Solo descargar PDF
                </button>

                {/* Info contacto */}
                <div className="bg-[#1D1D1F] rounded-2xl p-4">
                  <p className="text-xs text-white/50 font-bold uppercase tracking-wider mb-3">Contacto directo</p>
                  <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                    <Phone size={14} className="text-[#E0B11E]" />
                    <span>814 499 4504</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <Clock size={14} className="text-[#E0B11E]" />
                    <span>Lun–Vie 8:00–18:00</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Número de WhatsApp de ventas (con código de país, sin + ni espacios) ──────
const WHATSAPP_VENTAS = "528144994504";

// ═══════════════════════════════════════════════════════════════════════════════
// RUTA PROTEGIDA — muestra LoginPage si no hay sesión de admin
// URL secreta: /enr-admin  (no hay ruta /login pública)
// ═══════════════════════════════════════════════════════════════════════════════
function ProtectedRoute({ children }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#E0B11E] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!isAdmin) return <LoginPage />;
  return children;
}

// ── Hook: carrito persistido en localStorage ─────────────────────────────────
function useCarritoLocal() {
  const [carrito, setCarritoRaw] = useState(() => {
    try {
      const saved = localStorage.getItem('enerman_carrito');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const setCarrito = useCallback((updater) => {
    setCarritoRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try { localStorage.setItem('enerman_carrito', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  return [carrito, setCarrito];
}

// ═══════════════════════════════════════════════════════════════════════════════
// APP ROOT
// ═══════════════════════════════════════════════════════════════════════════════
function AppRoutes() {
  const [carrito, setCarrito] = useCarritoLocal();
  return (
    <Routes>
      <Route path="/"         element={<LandingPage />} />
      <Route path="/catalogo" element={<CatalogoPage carrito={carrito} setCarrito={setCarrito} />} />
      <Route path="/pedido"   element={<PedidoPage   carrito={carrito} setCarrito={setCarrito} />} />
      <Route path="/acceso"   element={<AccesoPage />} />
      {/* URL secreta del admin — no está en ningún menú público */}
      <Route path="/enr-admin" element={
        <ProtectedRoute>
          <AdminPage />
        </ProtectedRoute>
      } />
      {/* /admin y /login ya no existen → redirigen al catálogo */}
      <Route path="/admin" element={<Navigate to="/catalogo" replace />} />
      <Route path="/login" element={<Navigate to="/catalogo" replace />} />
      <Route path="*"      element={<Navigate to="/catalogo" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
