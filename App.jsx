import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

// ============================================
// CONFIGURACIÓN DE COLORES (Diseño Stitch)
// ============================================
const COLORS = {
  background: '#F9F9FB',
  surfaceLowest: '#FFFFFF',
  surfaceLow: '#F3F3F5',
  surfaceHigh: '#E8E8EA',
  surfaceHighest: '#E2E2E4',
  onSurface: '#1A1C1D',
  onSurfaceVariant: '#6E6E73',
  primary: '#E0B11E',
  primaryDim: '#F1C030',
  primaryDark: '#765B00',
  headerBg: '#1D1D1F',
  outline: '#D2C5AD',
};

// ============================================
// CATEGORÍAS
// ============================================
const CATEGORIAS = [
  { id: 'todos', nombre: 'Todos', icon: 'grid_view' },
  { id: 'Conductores', nombre: 'Conductores', icon: 'cable' },
  { id: 'Iluminación', nombre: 'Iluminación', icon: 'lightbulb' },
  { id: 'Tubería', nombre: 'Tubería', icon: 'plumbing' },
  { id: 'Distribución', nombre: 'Distribución', icon: 'electric_meter' },
  { id: 'Herramientas', nombre: 'Herramientas', icon: 'construction' },
  { id: 'EPP', nombre: 'EPP', icon: 'shield' },
  { id: 'Accesorios', nombre: 'Accesorios', icon: 'category' },
];

// ============================================
// COMPONENTE PRINCIPAL APP
// ============================================
export default function App() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [productoDetalle, setProductoDetalle] = useState(null);
  const [imagenActiva, setImagenActiva] = useState(0);

  // Cargar productos desde Firebase
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const q = query(collection(db, 'productos'), orderBy('title'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProductos(data);
      } catch (error) {
        console.error('Error cargando productos:', error);
      } finally {
        setLoading(false);
      }
    };
    cargarProductos();
  }, []);

  // Filtrar productos
  const productosFiltrados = productos.filter(p => {
    const coincideCategoria = categoriaActiva === 'todos' || p.categoria === categoriaActiva;
    const coincideBusqueda = !busqueda || 
      p.title?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.marca?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCategoria && coincideBusqueda && p.activo !== false;
  });

  // Funciones del carrito
  const agregarAlCarrito = (producto) => {
    setCarrito(prev => {
      const existe = prev.find(p => p.id === producto.id);
      if (existe) {
        return prev.map(p => p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p);
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
    setCarritoAbierto(true);
  };

  const actualizarCantidad = (id, delta) => {
    setCarrito(prev => prev.map(p => {
      if (p.id === id) {
        const nuevaCantidad = p.cantidad + delta;
        return nuevaCantidad > 0 ? { ...p, cantidad: nuevaCantidad } : p;
      }
      return p;
    }).filter(p => p.cantidad > 0));
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(prev => prev.filter(p => p.id !== id));
  };

  const totalCarrito = carrito.reduce((sum, p) => sum + (p.precio_desde || 0) * p.cantidad, 0);
  const totalItems = carrito.reduce((sum, p) => sum + p.cantidad, 0);

  // Obtener imágenes del producto
  const getImagenesProducto = (producto) => {
    const imagenes = [];
    if (producto.imagen_principal) imagenes.push(producto.imagen_principal);
    if (producto.imagen_2) imagenes.push(producto.imagen_2);
    if (producto.imagen_3) imagenes.push(producto.imagen_3);
    if (producto.imagenes && Array.isArray(producto.imagenes)) {
      producto.imagenes.forEach(img => {
        if (img && !imagenes.includes(img)) imagenes.push(img);
      });
    }
    return imagenes.length > 0 ? imagenes : ['/placeholder.png'];
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background, fontFamily: "'Inter', sans-serif" }}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      
      {/* Header */}
      <header 
        className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-20"
        style={{ backgroundColor: COLORS.headerBg }}
      >
        <div className="flex items-center gap-4">
          <span 
            className="text-2xl font-black tracking-tighter uppercase"
            style={{ color: COLORS.primary }}
          >
            ENERMAN
          </span>
        </div>
        
        {/* Buscador */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar producto, marca, categoría..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full text-sm focus:outline-none"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.1)', 
                color: 'white',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            />
          </div>
        </div>

        {/* Carrito */}
        <button 
          onClick={() => setCarritoAbierto(true)}
          className="relative p-2 rounded-full hover:bg-white/10 transition-all"
        >
          <span className="material-symbols-outlined text-2xl" style={{ color: COLORS.primary }}>
            shopping_cart
          </span>
          {totalItems > 0 && (
            <span 
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
              style={{ backgroundColor: COLORS.primary, color: COLORS.headerBg }}
            >
              {totalItems}
            </span>
          )}
        </button>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-32 px-4 md:px-6 max-w-7xl mx-auto">
        {/* Filtros de Categoría */}
        <section className="mb-8 overflow-x-auto no-scrollbar">
          <div className="flex gap-3 py-2">
            {CATEGORIAS.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoriaActiva(cat.id)}
                className="whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2"
                style={{
                  backgroundColor: categoriaActiva === cat.id ? COLORS.primary : COLORS.surfaceHighest,
                  color: categoriaActiva === cat.id ? COLORS.headerBg : COLORS.onSurfaceVariant,
                  boxShadow: categoriaActiva === cat.id ? '0 4px 12px rgba(224,177,30,0.3)' : 'none'
                }}
              >
                <span className="material-symbols-outlined text-lg">{cat.icon}</span>
                {cat.nombre}
              </button>
            ))}
          </div>
        </section>

        {/* Buscador móvil */}
        <div className="md:hidden mb-6">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl text-sm focus:outline-none"
              style={{ 
                backgroundColor: COLORS.surfaceLowest, 
                color: COLORS.onSurface,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
            />
          </div>
        </div>

        {/* Título y contador */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold" style={{ color: COLORS.onSurface }}>
            {categoriaActiva === 'todos' ? 'Todos los productos' : categoriaActiva}
          </h1>
          <span className="text-sm font-medium" style={{ color: COLORS.onSurfaceVariant }}>
            {productosFiltrados.length} producto(s)
          </span>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 rounded-full animate-spin"
              style={{ borderColor: COLORS.surfaceHigh, borderTopColor: COLORS.primary }}
            />
          </div>
        )}

        {/* Grid de Productos */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productosFiltrados.map(producto => (
              <ProductCard
                key={producto.id}
                producto={producto}
                onVerDetalle={() => {
                  setProductoDetalle(producto);
                  setImagenActiva(0);
                }}
                onAgregar={() => agregarAlCarrito(producto)}
                getImagenes={getImagenesProducto}
              />
            ))}
          </div>
        )}

        {/* Sin resultados */}
        {!loading && productosFiltrados.length === 0 && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl mb-4" style={{ color: COLORS.surfaceHigh }}>
              search_off
            </span>
            <p className="text-lg font-medium" style={{ color: COLORS.onSurfaceVariant }}>
              No se encontraron productos
            </p>
            <button
              onClick={() => { setCategoriaActiva('todos'); setBusqueda(''); }}
              className="mt-4 px-6 py-2 rounded-full font-bold text-sm"
              style={{ backgroundColor: COLORS.primary, color: COLORS.headerBg }}
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </main>

      {/* Modal de Detalle */}
      {productoDetalle && (
        <ProductDetailModal
          producto={productoDetalle}
          imagenes={getImagenesProducto(productoDetalle)}
          imagenActiva={imagenActiva}
          setImagenActiva={setImagenActiva}
          onClose={() => setProductoDetalle(null)}
          onAgregar={() => {
            agregarAlCarrito(productoDetalle);
            setProductoDetalle(null);
          }}
        />
      )}

      {/* Carrito Lateral */}
      {carritoAbierto && (
        <CartPanel
          carrito={carrito}
          total={totalCarrito}
          onClose={() => setCarritoAbierto(false)}
          onActualizarCantidad={actualizarCantidad}
          onEliminar={eliminarDelCarrito}
          getImagenes={getImagenesProducto}
        />
      )}

      {/* Estilos globales */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
    </div>
  );
}

// ============================================
// COMPONENTE: Tarjeta de Producto
// ============================================
function ProductCard({ producto, onVerDetalle, onAgregar, getImagenes }) {
  const [hover, setHover] = useState(false);
  const imagenes = getImagenes(producto);
  const tieneMultiplesImagenes = imagenes.length > 1;

  return (
    <div
      className="rounded-3xl overflow-hidden transition-all duration-300 cursor-pointer"
      style={{
        backgroundColor: COLORS.surfaceLowest,
        boxShadow: hover 
          ? '0 20px 40px rgba(26,28,29,0.12)' 
          : '0 4px 16px rgba(26,28,29,0.04)',
        transform: hover ? 'translateY(-4px)' : 'translateY(0)'
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onVerDetalle}
    >
      {/* Imagen */}
      <div 
        className="aspect-square relative overflow-hidden flex items-center justify-center p-6"
        style={{ backgroundColor: COLORS.surfaceHighest }}
      >
        <img
          src={imagenes[0]}
          alt={producto.title}
          className="max-w-full max-h-full object-contain transition-transform duration-500"
          style={{ transform: hover ? 'scale(1.08)' : 'scale(1)' }}
          onError={(e) => { e.target.src = '/placeholder.png'; }}
        />
        
        {/* Indicador de múltiples imágenes */}
        {tieneMultiplesImagenes && (
          <div className="absolute bottom-3 right-3 flex gap-1">
            {imagenes.slice(0, 3).map((_, i) => (
              <div 
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: i === 0 ? COLORS.primary : 'rgba(255,255,255,0.5)' }}
              />
            ))}
          </div>
        )}

        {/* Badge de categoría */}
        <span 
          className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
          style={{ 
            backgroundColor: `${COLORS.primary}20`, 
            color: COLORS.primaryDark 
          }}
        >
          {producto.categoria}
        </span>
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 
          className="font-bold text-base leading-tight mb-1 line-clamp-2"
          style={{ color: COLORS.onSurface }}
        >
          {producto.title}
        </h3>
        <p 
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: COLORS.onSurfaceVariant }}
        >
          {producto.marca || 'ENERMAN'}
        </p>
        
        {/* Precio */}
        <div className="mb-4">
          {producto.precio_desde > 0 ? (
            <span className="text-xl font-black" style={{ color: COLORS.primary }}>
              ${producto.precio_desde.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              <span className="text-xs font-normal ml-1" style={{ color: COLORS.onSurfaceVariant }}>
                MXN
              </span>
            </span>
          ) : (
            <span className="text-sm font-semibold" style={{ color: COLORS.onSurfaceVariant }}>
              Consultar precio
            </span>
          )}
        </div>

        {/* Botones */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); onVerDetalle(); }}
            className="py-3 px-4 rounded-full font-bold text-xs uppercase tracking-wider transition-all hover:bg-gray-100"
            style={{ 
              border: `1px solid ${COLORS.outline}30`,
              color: COLORS.onSurface 
            }}
          >
            Ver detalle
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAgregar(); }}
            className="py-3 px-4 rounded-full font-bold text-xs uppercase tracking-wider transition-all hover:shadow-lg"
            style={{ 
              backgroundColor: COLORS.primary,
              color: COLORS.headerBg
            }}
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE: Modal de Detalle de Producto
// ============================================
function ProductDetailModal({ producto, imagenes, imagenActiva, setImagenActiva, onClose, onAgregar }) {
  const [cantidad, setCantidad] = useState(1);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] overflow-auto rounded-3xl"
        style={{ backgroundColor: COLORS.surfaceLowest }}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          style={{ backgroundColor: COLORS.surfaceLowest }}
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="md:flex">
          {/* Galería de imágenes */}
          <div className="md:w-1/2 p-6">
            {/* Imagen principal */}
            <div 
              className="aspect-square rounded-2xl overflow-hidden flex items-center justify-center mb-4"
              style={{ backgroundColor: COLORS.surfaceLow }}
            >
              <img
                src={imagenes[imagenActiva]}
                alt={producto.title}
                className="max-w-full max-h-full object-contain"
                onError={(e) => { e.target.src = '/placeholder.png'; }}
              />
            </div>
            
            {/* Miniaturas */}
            {imagenes.length > 1 && (
              <div className="flex gap-3 justify-center">
                {imagenes.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImagenActiva(i)}
                    className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center p-2 transition-all"
                    style={{
                      backgroundColor: COLORS.surfaceLow,
                      border: imagenActiva === i ? `2px solid ${COLORS.primary}` : '2px solid transparent'
                    }}
                  >
                    <img
                      src={img}
                      alt=""
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => { e.target.src = '/placeholder.png'; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info del producto */}
          <div className="md:w-1/2 p-6 md:pl-0">
            {/* Categoría y marca */}
            <div className="flex items-center gap-3 mb-2">
              <span 
                className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                style={{ backgroundColor: `${COLORS.primary}20`, color: COLORS.primaryDark }}
              >
                {producto.categoria}
              </span>
              {producto.disponible !== false && (
                <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                  Disponible
                </span>
              )}
            </div>

            {/* Título */}
            <h2 
              className="text-2xl font-bold leading-tight mb-2"
              style={{ color: COLORS.onSurface }}
            >
              {producto.title}
            </h2>
            
            {/* Marca */}
            <p 
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ color: COLORS.onSurfaceVariant }}
            >
              {producto.marca || 'ENERMAN'} • ID: {producto.id}
            </p>

            {/* Precio */}
            <div className="mb-6">
              {producto.precio_desde > 0 ? (
                <span className="text-3xl font-black" style={{ color: COLORS.primary }}>
                  ${producto.precio_desde.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  <span className="text-sm font-normal ml-2" style={{ color: COLORS.onSurfaceVariant }}>
                    MXN + IVA
                  </span>
                </span>
              ) : (
                <span className="text-xl font-semibold" style={{ color: COLORS.onSurfaceVariant }}>
                  Precio a consultar
                </span>
              )}
            </div>

            {/* Selector de cantidad */}
            <div className="flex items-center gap-4 mb-6">
              <div 
                className="flex items-center rounded-full p-1"
                style={{ backgroundColor: COLORS.surfaceLow }}
              >
                <button
                  onClick={() => setCantidad(c => Math.max(1, c - 1))}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                >
                  <span className="material-symbols-outlined">remove</span>
                </button>
                <span className="w-12 text-center font-bold text-lg">{cantidad}</span>
                <button
                  onClick={() => setCantidad(c => c + 1)}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>

            {/* Botón agregar */}
            <button
              onClick={onAgregar}
              className="w-full py-4 rounded-full font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:shadow-lg active:scale-98"
              style={{ backgroundColor: COLORS.primary, color: COLORS.headerBg }}
            >
              <span className="material-symbols-outlined">add_shopping_cart</span>
              Añadir al pedido
            </button>

            {/* Descripción */}
            {producto.description && (
              <div className="mt-6 pt-6" style={{ borderTop: `1px solid ${COLORS.outline}20` }}>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: COLORS.onSurface }}>
                  Descripción
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: COLORS.onSurfaceVariant }}>
                  {producto.description}
                </p>
              </div>
            )}

            {/* Subcategoría */}
            {producto.subcategoria && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span 
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: COLORS.surfaceLow, color: COLORS.onSurfaceVariant }}
                >
                  {producto.subcategoria}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE: Panel del Carrito
// ============================================
function CartPanel({ carrito, total, onClose, onActualizarCantidad, onEliminar, getImagenes }) {
  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <aside 
        className="absolute top-0 right-0 h-full w-full max-w-md flex flex-col shadow-2xl"
        style={{ backgroundColor: COLORS.surfaceLowest }}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-6 border-b" style={{ borderColor: `${COLORS.outline}15` }}>
          <h2 className="text-xl font-bold" style={{ color: COLORS.onSurface }}>
            Tu Carrito ({carrito.length})
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* Lista de items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {carrito.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-5xl mb-4" style={{ color: COLORS.surfaceHigh }}>
                shopping_cart
              </span>
              <p className="font-medium" style={{ color: COLORS.onSurfaceVariant }}>
                Tu carrito está vacío
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {carrito.map(item => (
                <article key={item.id} className="flex gap-4">
                  {/* Imagen */}
                  <div 
                    className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: COLORS.surfaceLow }}
                  >
                    <img
                      src={getImagenes(item)[0]}
                      alt={item.title}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => { e.target.src = '/placeholder.png'; }}
                    />
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 
                        className="font-bold text-sm leading-tight max-w-[160px]"
                        style={{ color: COLORS.onSurface }}
                      >
                        {item.title}
                      </h3>
                      <p className="font-bold text-sm" style={{ color: COLORS.onSurface }}>
                        ${((item.precio_desde || 0) * item.cantidad).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      {/* Controles de cantidad */}
                      <div 
                        className="flex items-center rounded-full px-2 py-1 gap-3"
                        style={{ backgroundColor: COLORS.surfaceLow }}
                      >
                        <button
                          onClick={() => onActualizarCantidad(item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white"
                        >
                          <span className="material-symbols-outlined text-sm">remove</span>
                        </button>
                        <span className="text-sm font-bold w-4 text-center">{item.cantidad}</span>
                        <button
                          onClick={() => onActualizarCantidad(item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white"
                        >
                          <span className="material-symbols-outlined text-sm">add</span>
                        </button>
                      </div>
                      
                      {/* Eliminar */}
                      <button
                        onClick={() => onEliminar(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Footer con total */}
        {carrito.length > 0 && (
          <footer className="p-6 space-y-4 border-t" style={{ borderColor: `${COLORS.outline}15` }}>
            <div className="flex justify-between items-end">
              <span className="text-lg font-bold" style={{ color: COLORS.onSurface }}>Total</span>
              <div className="text-right">
                <span 
                  className="block text-2xl font-black"
                  style={{ color: COLORS.onSurface }}
                >
                  ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs uppercase tracking-wider font-medium" style={{ color: COLORS.onSurfaceVariant }}>
                  + IVA
                </span>
              </div>
            </div>
            
            <button
              className="w-full py-4 rounded-full font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:shadow-lg"
              style={{ backgroundColor: COLORS.primary, color: COLORS.headerBg }}
            >
              Ver pedido completo
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
            
            <button
              onClick={onClose}
              className="w-full py-3 rounded-full font-bold text-xs uppercase tracking-wider transition-colors hover:bg-gray-100"
              style={{ color: COLORS.onSurfaceVariant }}
            >
              Continuar comprando
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
}
