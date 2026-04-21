import React, { useState, useEffect } from 'react';
import { Iconos } from '../lib/constants';
import TarjetaProducto from './TarjetaProducto';

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
  const dispProd = producto.disponibilidad || "disponible";
  const disponibleActual = dispProd !== "agotado" && (varianteSeleccionada?.disponible ?? producto.disponible ?? true);

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
              <StockBadge disp={dispProd} />
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

export default ModalDetalle;
