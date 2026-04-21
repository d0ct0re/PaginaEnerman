import React from 'react';
import { Iconos } from '../lib/constants';

// ── Helper: badge de disponibilidad ──────────────────────────────────────────
function StockBadge({ disp, small = false }) {
  const cfg = {
    disponible:  { label: "En stock",          bg: "#ECFDF5", color: "#059669", dot: "#10B981" },
    ultimas:     { label: "Últimas unidades",   bg: "#FFFBEB", color: "#D97706", dot: "#F59E0B" },
    agotado:     { label: "Agotado",            bg: "#FEF2F2", color: "#DC2626", dot: "#EF4444" },
    consultar:   { label: "Consultar stock",    bg: "#F3F3F5", color: "#6E6E73", dot: "#9CA3AF" },
  };
  const c = cfg[disp] || cfg.disponible;
  const px = small ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[10px]";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-bold ${px}`}
      style={{ background: c.bg, color: c.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
      {c.label}
    </span>
  );
}

function TarjetaProducto({ producto, onAgregar, onVerDetalle, compacta = false }) {
  const tieneVariantes = producto.tiene_variantes && producto.variantes?.length > 0;
  const precioMinimo = tieneVariantes
    ? Math.min(...producto.variantes.filter(v => v.precio > 0).map(v => v.precio))
    : producto.precio;
  const disp = producto.disponibilidad || "disponible";
  const agotado = disp === "agotado";

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
        <div className="absolute bottom-3 left-3">
          <StockBadge disp={disp} small />
        </div>
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
            onClick={() => agotado ? null : (tieneVariantes ? onVerDetalle(producto) : onAgregar(producto))}
            disabled={agotado}
            className={`py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-sm ${
              agotado
                ? "bg-[#F3F3F5] text-[#C7C7CC] cursor-not-allowed"
                : "bg-[#E0B11E] text-[#241A00] hover:bg-[#F1C030]"
            }`}
          >
            {agotado ? 'Agotado' : tieneVariantes ? 'Escoger' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TarjetaProducto;
