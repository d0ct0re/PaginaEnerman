import React from 'react';
import { Trash2, Plus, Minus, X, Info } from 'lucide-react';
import { Iconos } from '../lib/constants';

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
            {/* Servicios upsell */}
            <div className="bg-[#1D1D1F] rounded-xl p-3.5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#E0B11E]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Zap size={14} className="text-[#E0B11E]" />
              </div>
              <div>
                <p className="text-white text-xs font-bold leading-snug">¿Necesitas instalación?</p>
                <p className="text-white/40 text-[10px] leading-snug mt-0.5">ENERMAN ofrece servicios eléctricos 24/7 — instalación, mantenimiento y más.</p>
                <button onClick={() => { onCerrar(); navigate('/cotiza'); }}
                  className="text-[#E0B11E] text-[10px] font-bold mt-1.5 hover:underline">
                  Solicitar servicio →
                </button>
              </div>
            </div>
          </footer>
        )}
      </aside>
    </div>
  );
}

export default CarritoLateral;
