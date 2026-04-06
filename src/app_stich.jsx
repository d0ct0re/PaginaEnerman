import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, Route, Routes, useNavigate, useSearchParams } from "react-router-dom";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "./firebase"
import AdminPage from "./AdminPage";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

// Categorías con iconos
const CATEGORIAS = [
  { nombre: "Todos", Icono: Iconos.Grid },
  { nombre: "Conductores", Icono: Iconos.Rayo },
  { nombre: "Iluminación", Icono: Iconos.Foco },
  { nombre: "Tubería", Icono: Iconos.Tubo },
  { nombre: "Distribución", Icono: Iconos.Grid },
  { nombre: "Herramientas", Icono: Iconos.Herramienta },
  { nombre: "EPP", Icono: Iconos.Escudo },
  { nombre: "Accesorios", Icono: Iconos.Caja },
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
            disponible: d.disponible !== false,
            // ⭐ NUEVO: Soporte para variantes
            tiene_variantes: d.tiene_variantes || false,
            variantes: d.variantes || [],
            especificaciones: d.especificaciones || {},
          };
        });
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
function TarjetaProducto({ producto, onAgregar, onVerDetalle }) {
  const tieneVariantes = producto.tiene_variantes && producto.variantes?.length > 0;
  const precioMinimo = tieneVariantes 
    ? Math.min(...producto.variantes.map(v => v.precio))
    : producto.precio;

  return (
    <div className="bg-white rounded-[20px] overflow-hidden shadow-[0_12px_32px_rgba(26,28,29,0.06)] group transition-transform duration-300 hover:-translate-y-1">
      {/* Imagen */}
      <button
        onClick={() => onVerDetalle(producto)}
        className="w-full aspect-square bg-[#E2E2E4] flex items-center justify-center p-8 overflow-hidden relative"
      >
        {producto.imagen ? (
          <img
            src={producto.imagen}
            alt={producto.nombre}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <Iconos.Rayo />
        )}
        
        {/* Badge de variantes */}
        {tieneVariantes && (
          <span className="absolute top-3 right-3 bg-[#1D1D1F] text-white text-[10px] font-bold px-2 py-1 rounded-full">
            {producto.variantes.length} tamaños
          </span>
        )}
      </button>

      {/* Info */}
      <div className="p-6">
        <span className="inline-block px-3 py-1 bg-[#E0B11E]/20 text-[#765B00] font-bold text-[0.65rem] uppercase tracking-widest rounded-full mb-3">
          {producto.categoria}
        </span>
        <h3 className="text-[#1A1C1D] font-bold text-lg leading-tight mb-1 line-clamp-2">
          {producto.nombre}
        </h3>
        <p className="text-[#6E6E73] text-sm mb-4 font-medium uppercase tracking-tight">
          {producto.marca || 'ENERMAN'}
        </p>
        
        {/* Precio */}
        <div className="text-[#E0B11E] font-black text-2xl mb-6">
          {precioMinimo > 0 ? (
            <>
              {tieneVariantes && <span className="text-sm font-normal text-[#6E6E73]">Desde </span>}
              ${precioMinimo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              <span className="text-xs text-[#6E6E73] font-normal ml-1">MXN</span>
            </>
          ) : (
            <span className="text-base text-[#6E6E73] font-semibold">Consultar precio</span>
          )}
        </div>
        
        {/* Botones */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onVerDetalle(producto)}
            className="py-3 px-4 rounded-full border border-[#D2C5AD]/30 text-[#1A1C1D] font-bold text-xs uppercase tracking-widest hover:bg-[#F3F3F5] transition-all active:scale-95"
          >
            Ver detalle
          </button>
          <button
            onClick={() => tieneVariantes ? onVerDetalle(producto) : onAgregar(producto)}
            className="py-3 px-4 rounded-full bg-[#E0B11E] text-[#241A00] font-bold text-xs uppercase tracking-widest hover:bg-[#F1C030] transition-all active:scale-95 shadow-md"
          >
            {tieneVariantes ? 'Escoger' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: MODAL DETALLE (con selector de variantes)
// ═══════════════════════════════════════════════════════════════════════════════
function ModalDetalle({ producto, onCerrar, onAgregar }) {
  const [imagenActiva, setImagenActiva] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [varianteSeleccionada, setVarianteSeleccionada] = useState(null);

  // Resetear cuando cambia el producto
  useEffect(() => {
    if (producto) {
      setImagenActiva(0);
      setCantidad(1);
      // Seleccionar primera variante por defecto si tiene
      if (producto.tiene_variantes && producto.variantes?.length > 0) {
        setVarianteSeleccionada(producto.variantes[0]);
      } else {
        setVarianteSeleccionada(null);
      }
    }
  }, [producto]);

  if (!producto) return null;

  const imagenes = getImagenes(producto);
  const tieneVariantes = producto.tiene_variantes && producto.variantes?.length > 0;
  
  // Precio actual según variante seleccionada
  const precioActual = varianteSeleccionada?.precio || producto.precio;
  const skuActual = varianteSeleccionada?.sku || producto.id;
  const stockActual = varianteSeleccionada?.stock;
  const disponibleActual = varianteSeleccionada?.disponible ?? producto.disponible;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onCerrar}>
      <div
        className="relative bg-white rounded-[24px] w-full max-w-4xl max-h-[90vh] overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Cerrar */}
        <button
          onClick={onCerrar}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-[#F3F3F5] flex items-center justify-center hover:bg-[#E8E8EA] transition-colors"
        >
          <Iconos.Cerrar />
        </button>

        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Galería */}
          <div>
            <div className="aspect-square bg-[#F5F5F5] rounded-2xl flex items-center justify-center p-6 mb-4">
              {imagenes.length > 0 ? (
                <img
                  src={imagenes[imagenActiva] || imagenes[0]}
                  alt={producto.nombre}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <Iconos.Rayo />
              )}
            </div>
            {imagenes.length > 1 && (
              <div className="flex gap-2 justify-center">
                {imagenes.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImagenActiva(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 ${imagenActiva === i ? 'border-[#E0B11E]' : 'border-transparent'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain bg-[#F3F3F5]" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            {/* Categoría y disponibilidad */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="px-3 py-1 bg-[#E0B11E]/20 text-[#765B00] font-bold text-xs uppercase rounded-full">
                {producto.categoria}
              </span>
              {disponibleActual ? (
                <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                  <Iconos.Check /> Disponible
                  {stockActual && <span className="text-[#6E6E73] font-normal">({stockActual} unidades)</span>}
                </span>
              ) : (
                <span className="text-red-500 text-xs font-bold">● Agotado</span>
              )}
            </div>

            {/* Título */}
            <h2 className="text-2xl font-bold text-[#1A1C1D] mb-2">{producto.nombre}</h2>
            <p className="text-sm text-[#6E6E73] uppercase tracking-wide mb-4">
              {producto.marca} • SKU: {skuActual}
            </p>

            {/* ⭐ SELECTOR DE VARIANTES (Tamaño) */}
            {tieneVariantes && (
              <div className="mb-6">
                <label className="block text-sm font-bold text-[#1A1C1D] mb-3">
                  Tamaño:
                  <span className="ml-2 text-[#E0B11E]">{varianteSeleccionada?.nombre}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {producto.variantes.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setVarianteSeleccionada(v)}
                      disabled={!v.disponible}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        varianteSeleccionada?.id === v.id
                          ? 'bg-[#1D1D1F] text-white'
                          : v.disponible
                            ? 'bg-[#F3F3F5] text-[#1A1C1D] hover:bg-[#E8E8EA]'
                            : 'bg-[#F3F3F5] text-[#C5C5C5] cursor-not-allowed line-through'
                      }`}
                    >
                      {v.nombre}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Precio */}
            <div className="bg-[#F9F9FB] rounded-2xl p-4 mb-6">
              <div className="text-3xl font-black text-[#E0B11E]">
                {precioActual > 0 ? (
                  <>
                    ${precioActual.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    <span className="text-sm text-[#6E6E73] font-normal ml-2">MXN</span>
                  </>
                ) : (
                  <span className="text-lg text-[#6E6E73]">Precio a consultar</span>
                )}
              </div>
            </div>

            {/* Cantidad */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-bold text-[#1A1C1D]">Cantidad:</span>
              <div className="flex items-center bg-[#F3F3F5] rounded-full">
                <button 
                  onClick={() => setCantidad(c => Math.max(1, c - 1))} 
                  className="w-10 h-10 flex items-center justify-center hover:bg-[#E8E8EA] rounded-full"
                >
                  <Iconos.Menos />
                </button>
                <span className="w-12 text-center font-bold text-lg">{cantidad}</span>
                <button 
                  onClick={() => setCantidad(c => c + 1)} 
                  className="w-10 h-10 flex items-center justify-center hover:bg-[#E8E8EA] rounded-full"
                >
                  <Iconos.Mas />
                </button>
              </div>
            </div>

            {/* Botón Agregar */}
            <button
              onClick={() => onAgregar(producto, cantidad, varianteSeleccionada)}
              disabled={!disponibleActual}
              className={`w-full py-4 rounded-full font-bold uppercase tracking-wider transition-all active:scale-95 ${
                disponibleActual
                  ? 'bg-[#E0B11E] text-[#241A00] hover:bg-[#F1C030]'
                  : 'bg-[#E8E8EA] text-[#6E6E73] cursor-not-allowed'
              }`}
            >
              {disponibleActual ? 'Añadir al pedido' : 'Agotado'}
            </button>

            {/* Descripción */}
            {producto.descripcion && (
              <div className="mt-6 pt-6 border-t border-[#E8E8EA]">
                <h3 className="font-bold text-sm uppercase tracking-wider text-[#1A1C1D] mb-2">Descripción</h3>
                <p className="text-sm text-[#6E6E73] leading-relaxed">{producto.descripcion}</p>
              </div>
            )}

            {/* Especificaciones */}
            {producto.especificaciones && Object.keys(producto.especificaciones).length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#E8E8EA]">
                <h3 className="font-bold text-sm uppercase tracking-wider text-[#1A1C1D] mb-2">Especificaciones</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(producto.especificaciones).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="text-[#6E6E73] capitalize">{key}:</span>
                      <span className="ml-1 font-medium text-[#1A1C1D]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: CARRITO LATERAL
// ═══════════════════════════════════════════════════════════════════════════════
function CarritoLateral({ carrito, visible, onCerrar, onEliminar, navigate }) {
  if (!visible) return null;

  const total = carrito.reduce((sum, item) => sum + (item.precioFinal || item.precio || 0) * item.cantidad, 0);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onCerrar} />
      <aside className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-5 border-b border-[#E8E8EA]">
          <h2 className="text-xl font-bold text-[#1A1C1D]">Tu Carrito</h2>
          <button onClick={onCerrar} className="w-10 h-10 rounded-full hover:bg-[#F3F3F5] flex items-center justify-center">
            <Iconos.Cerrar />
          </button>
        </header>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {carrito.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-[#E8E8EA] mb-4"><Iconos.Carrito /></div>
              <p className="text-[#6E6E73]">Tu carrito está vacío</p>
            </div>
          ) : (
            carrito.map(item => (
              <div key={item._carritoId} className="flex gap-4 p-3 bg-[#F9F9FB] rounded-xl">
                <div className="w-16 h-16 bg-[#E8E8EA] rounded-lg flex items-center justify-center flex-shrink-0">
                  {item.imagen ? (
                    <img src={item.imagen} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <Iconos.Rayo />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-[#1A1C1D] truncate">{item.nombre}</h3>
                  <p className="text-xs text-[#6E6E73]">
                    {item.marca}
                    {item.varianteNombre && <span className="ml-1">• {item.varianteNombre}</span>}
                    <span className="ml-1">× {item.cantidad}</span>
                  </p>
                  <p className="font-bold text-[#E0B11E] mt-1">
                    {(item.precioFinal || item.precio) > 0 
                      ? `$${((item.precioFinal || item.precio) * item.cantidad).toFixed(2)}` 
                      : 'Consultar'}
                  </p>
                </div>
                <button onClick={() => onEliminar(item._carritoId)} className="text-[#6E6E73] hover:text-red-500">
                  <Iconos.Basura />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {carrito.length > 0 && (
          <footer className="p-6 border-t border-[#E8E8EA] space-y-4">
            <div className="flex justify-between items-end">
              <span className="font-bold text-[#1A1C1D]">Total</span>
              <span className="text-2xl font-black text-[#1A1C1D]">${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
            <button
              onClick={() => { onCerrar(); navigate('/pedido'); }}
              className="w-full py-4 rounded-full bg-[#E0B11E] text-[#241A00] font-bold uppercase tracking-wider hover:bg-[#F1C030] flex items-center justify-center gap-2"
            >
              Ver pedido completo <Iconos.Flecha />
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA: LANDING
// ═══════════════════════════════════════════════════════════════════════════════
function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      {/* Header */}
      <header className="bg-[#1D1D1F] px-6 py-5 flex items-center justify-between">
        <span className="text-xl font-black text-[#E0B11E] tracking-tighter uppercase">ENERMAN</span>
        <Link to="/catalogo" className="px-5 py-2.5 rounded-full bg-[#E0B11E] text-[#241A00] font-bold text-sm uppercase">
          Ver catálogo
        </Link>
      </header>

      {/* Hero */}
      <main className="flex flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="text-5xl md:text-6xl font-black text-[#1A1C1D] mb-4">
          Material Eléctrico<br /><span className="text-[#E0B11E]">Profesional</span>
        </h1>
        <p className="text-lg text-[#6E6E73] max-w-xl mb-10">
          Distribuidora de material eléctrico en Monterrey. Cables, iluminación, tubería, distribución y más para tus proyectos.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/catalogo')}
            className="px-10 py-5 rounded-full bg-[#E0B11E] text-[#241A00] font-bold uppercase hover:bg-[#F1C030] transition-all"
          >
            Explorar catálogo
          </button>
          <Link
            to="/admin"
            className="px-10 py-5 rounded-full border-2 border-[#D2C5AD] text-[#1A1C1D] font-bold uppercase hover:bg-[#F3F3F5] transition-all"
          >
            Panel Admin
          </Link>
        </div>
      </main>

      {/* Categorías */}
      <section className="bg-[#F3F3F5] px-6 py-16">
        <h2 className="text-2xl font-bold text-center text-[#1A1C1D] mb-10">Categorías</h2>
        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {CATEGORIAS.filter(c => c.nombre !== 'Todos').map(cat => (
            <button
              key={cat.nombre}
              onClick={() => navigate(`/catalogo?categoria=${cat.nombre}`)}
              className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white hover:shadow-md transition-all"
            >
              <span className="text-[#E0B11E]"><cat.Icono /></span>
              <span className="font-semibold text-[#1A1C1D]">{cat.nombre}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1D1D1F] px-6 py-8 text-center">
        <p className="text-sm text-white/50">ENERMAN © 2024 · Material Eléctrico · Monterrey, N.L.</p>
      </footer>
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

  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState(searchParams.get('categoria') || 'Todos');
  const [productoDetalle, setProductoDetalle] = useState(null);
  const [carritoVisible, setCarritoVisible] = useState(false);

  // Filtrar
  const productosFiltrados = useMemo(() => {
    return productos.filter(p => {
      const matchCategoria = categoriaActiva === 'Todos' || p.categoria === categoriaActiva;
      const matchBusqueda = !busqueda || 
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
        p.marca.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.categoria.toLowerCase().includes(busqueda.toLowerCase());
      return matchCategoria && matchBusqueda;
    });
  }, [productos, categoriaActiva, busqueda]);

  // Agregar al carrito (con soporte para variantes)
  const agregarAlCarrito = useCallback((producto, cantidad = 1, variante = null) => {
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
  }, [setCarrito]);

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
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"><Iconos.Buscar /></span>
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
          <Link to="/admin" className="hidden md:flex text-white/70 hover:text-white text-sm font-medium">Admin</Link>
          <button onClick={() => setCarritoVisible(true)} className="relative p-2 text-[#E0B11E]">
            <Iconos.Carrito />
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
        <div className="flex gap-3 overflow-x-auto no-scrollbar py-4 mb-6">
          {CATEGORIAS.map(cat => (
            <button
              key={cat.nombre}
              onClick={() => setCategoriaActiva(cat.nombre)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                categoriaActiva === cat.nombre
                  ? 'bg-[#E0B11E] text-[#241A00] shadow-md'
                  : 'bg-[#E2E2E4] text-[#6E6E73] hover:bg-[#E8E8EA]'
              }`}
            >
              <cat.Icono />
              {cat.nombre}
            </button>
          ))}
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

        {/* Título */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#1A1C1D]">
            {categoriaActiva === 'Todos' ? 'Todos los productos' : categoriaActiva}
          </h1>
          <span className="text-sm text-[#6E6E73]">{productosFiltrados.length} producto(s)</span>
        </div>

        {/* Loading */}
        {cargando && (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#E8E8EA] border-t-[#E0B11E] rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-20 text-red-500">{error}</div>
        )}

        {/* Grid */}
        {!cargando && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {productosFiltrados.map(producto => (
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
            <p className="text-[#6E6E73]">No se encontraron productos</p>
            <button
              onClick={() => { setCategoriaActiva('Todos'); setBusqueda(''); }}
              className="mt-4 px-6 py-3 rounded-full bg-[#E0B11E] text-[#241A00] font-bold"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </main>

      {/* Modal */}
      <ModalDetalle
        producto={productoDetalle}
        onCerrar={() => setProductoDetalle(null)}
        onAgregar={agregarAlCarrito}
      />

      {/* Carrito */}
      <CarritoLateral
        carrito={carrito}
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
// PÁGINA: PEDIDO
// ═══════════════════════════════════════════════════════════════════════════════
function PedidoPage({ carrito, setCarrito }) {
  const navigate = useNavigate();
  const [nota, setNota] = useState("");

  const piezas = carrito.reduce((acc, i) => acc + i.cantidad, 0);
  const total = carrito.reduce((acc, i) => {
    const precio = i.precioFinal || i.precio || 0;
    return acc + (precio > 0 ? precio * i.cantidad : 0);
  }, 0);

  const aumentar = id => setCarrito(prev => prev.map(i => i._carritoId === id ? { ...i, cantidad: i.cantidad + 1 } : i));
  const disminuir = id => setCarrito(prev => prev.map(i => i._carritoId === id && i.cantidad > 1 ? { ...i, cantidad: i.cantidad - 1 } : i));
  const eliminar = id => setCarrito(prev => prev.filter(i => i._carritoId !== id));
  const vaciar = () => { if (confirm("¿Vaciar todo el pedido?")) setCarrito([]); };

  const generarPDF = () => {
    const doc = new jsPDF();
    const fecha = new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(224, 177, 30);
    doc.text("ENERMAN", 15, 22);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("Material Eléctrico · Monterrey, N.L.", 15, 30);
    doc.text(`Fecha: ${fecha}`, 150, 22);

    const filas = carrito.map((item, i) => {
      const precio = item.precioFinal || item.precio || 0;
      return [
        i + 1,
        item.nombre,
        item.marca || "—",
        item.varianteNombre || "—",
        item.cantidad,
        precio > 0 ? `$${Number(precio).toFixed(2)}` : "Consultar",
        precio > 0 ? `$${(Number(precio) * item.cantidad).toFixed(2)}` : "Consultar",
      ];
    });

    autoTable(doc, {
      startY: 40,
      head: [["#", "Producto", "Marca", "Tamaño", "Qty", "P.Unit", "Subtotal"]],
      body: filas,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 30, 30], textColor: [224, 177, 30] },
    });

    if (total > 0) {
      doc.setFont("helvetica", "bold");
      doc.text(`Total: $${total.toFixed(2)} MXN`, 140, doc.lastAutoTable.finalY + 10);
    }

    if (nota.trim()) {
      doc.setFont("helvetica", "normal");
      doc.text(`Notas: ${nota}`, 15, doc.lastAutoTable.finalY + 20);
    }

    doc.save(`ENERMAN_Pedido_${Date.now()}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#F9F9FB] px-4 py-10">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#E0B11E]">Mi pedido</h1>
            <p className="text-sm text-[#6E6E73]">{piezas} pieza(s) · {carrito.length} producto(s)</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate("/catalogo")} className="px-5 py-2.5 rounded-full bg-white text-[#1A1C1D] text-sm font-medium">
              ← Seguir comprando
            </button>
            {carrito.length > 0 && (
              <button onClick={vaciar} className="px-5 py-2.5 rounded-full bg-red-100 text-red-600 text-sm font-medium">
                Vaciar
              </button>
            )}
          </div>
        </div>

        {carrito.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center">
            <p className="text-[#6E6E73]">Tu pedido está vacío.</p>
            <button onClick={() => navigate("/catalogo")} className="mt-6 px-8 py-3 rounded-full bg-[#E0B11E] text-[#241A00] font-bold">
              Ir al catálogo
            </button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            {/* Lista */}
            <div className="space-y-4">
              {carrito.map(item => {
                const precio = item.precioFinal || item.precio || 0;
                return (
                  <div key={item._carritoId} className="bg-white rounded-2xl p-4 flex gap-4">
                    <div className="w-20 h-20 bg-[#F3F3F5] rounded-xl flex items-center justify-center flex-shrink-0">
                      {item.imagen ? <img src={item.imagen} alt="" className="w-full h-full object-contain" /> : <Iconos.Rayo />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-[#1A1C1D]">{item.nombre}</h3>
                      <p className="text-sm text-[#6E6E73]">
                        {item.marca}
                        {item.varianteNombre && <span className="ml-1 font-medium">• {item.varianteNombre}</span>}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button onClick={() => disminuir(item._carritoId)} className="w-8 h-8 rounded-full bg-[#F3F3F5] flex items-center justify-center">
                            <Iconos.Menos />
                          </button>
                          <span className="w-8 text-center font-bold">{item.cantidad}</span>
                          <button onClick={() => aumentar(item._carritoId)} className="w-8 h-8 rounded-full bg-[#F3F3F5] flex items-center justify-center">
                            <Iconos.Mas />
                          </button>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-[#E0B11E]">
                            {precio > 0 ? `$${(precio * item.cantidad).toFixed(2)}` : 'Consultar'}
                          </span>
                          <button onClick={() => eliminar(item._carritoId)} className="text-red-500">
                            <Iconos.Basura />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Resumen */}
            <div className="bg-white rounded-2xl p-6 h-fit">
              <h3 className="font-bold text-[#1A1C1D] mb-4">Resumen</h3>
              <div className="space-y-2 text-sm text-[#6E6E73] mb-4">
                <div className="flex justify-between"><span>Productos</span><span>{carrito.length}</span></div>
                <div className="flex justify-between"><span>Piezas</span><span>{piezas}</span></div>
              </div>
              {total > 0 && (
                <div className="flex justify-between items-center py-4 border-t border-[#E8E8EA]">
                  <span className="font-bold text-[#1A1C1D]">Total</span>
                  <span className="text-2xl font-black text-[#E0B11E]">${total.toFixed(2)}</span>
                </div>
              )}
              <textarea
                value={nota}
                onChange={e => setNota(e.target.value)}
                placeholder="Notas del pedido..."
                rows={3}
                className="w-full rounded-xl bg-[#F9F9FB] px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#E0B11E] mb-4"
              />
              <button
                onClick={generarPDF}
                className="w-full py-4 rounded-full bg-[#E0B11E] text-[#241A00] font-bold flex items-center justify-center gap-2"
              >
                <Iconos.PDF /> Descargar PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// APP ROOT
// ═══════════════════════════════════════════════════════════════════════════════
function App() {
  const [carrito, setCarrito] = useState([]);
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/catalogo" element={<CatalogoPage carrito={carrito} setCarrito={setCarrito} />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/pedido" element={<PedidoPage carrito={carrito} setCarrito={setCarrito} />} />
    </Routes>
  );
}

export default App;
