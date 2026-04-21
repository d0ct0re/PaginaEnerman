import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ShoppingCart, LayoutGrid } from 'lucide-react';
import { Iconos, CATEGORIAS, CAT_ICONS, MARCAS } from '../lib/constants';
import { useProductos } from '../hooks/useProductos';
import { useAuth } from '../context/AuthContext';
import { activityTracker } from '../lib/activityTracker';
import TarjetaProducto from '../components/TarjetaProducto';
import ModalDetalle from '../components/ModalDetalle';
import CarritoLateral from '../components/CarritoLateral';

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

  // Trackear búsqueda (debounced — solo cuando el usuario deja de escribir)
  useEffect(() => {
    if (!busqueda.trim() || !user) return;
    const t = setTimeout(() => activityTracker.search(user.uid, busqueda.trim()), 1200);
    return () => clearTimeout(t);
  }, [busqueda, user]);

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
    activityTracker.addToCart(user.uid, producto, cantidad);
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
              <Link to="/registro" className="hidden md:flex px-4 py-2 rounded-full bg-[#E0B11E] text-[#1A0E00] font-bold text-xs hover:bg-[#F0C22E] transition-colors">
                Registrarse
              </Link>
            </>
          ) : isAdmin ? (
            <Link to="/enr-admin" className="hidden md:flex text-white/70 hover:text-white text-sm font-medium transition-colors">Admin</Link>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/mis-cotizaciones" className="text-white/60 hover:text-white text-xs font-medium transition-colors">
                Mis cotizaciones
              </Link>
              <span className="text-white/20">|</span>
              <span className="text-white/60 text-xs max-w-[110px] truncate">
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
        {/* ── Barra de categorías — premium industrial ───────── */}
        <div className="overflow-x-auto no-scrollbar mb-6">
          <div className="flex gap-2 py-1 min-w-max md:min-w-0 md:flex-wrap md:justify-center">
            {CATEGORIAS.map(cat => {
              const activa = categoriaActiva === cat.nombre;
              const CatIcon = CAT_ICONS[cat.nombre] || LayoutGrid;
              return (
                <button
                  key={cat.nombre}
                  onClick={() => cambiarCategoria(cat.nombre)}
                  aria-pressed={activa}
                  className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer transition-all duration-200"
                  style={{
                    minWidth: 72,
                    padding: '12px 10px',
                    borderRadius: 14,
                    background: activa ? '#0F0F12' : '#111114',
                    border: activa
                      ? '1px solid #FFD700'
                      : '1px solid #252528',
                    boxShadow: activa
                      ? '0 0 0 1px rgba(255,215,0,0.10), 0 4px 16px rgba(255,215,0,0.07)'
                      : 'none',
                    transform: activa ? 'translateY(-2px)' : 'translateY(0)',
                  }}
                >
                  {/* Contenedor icono — cuadrado 44×44, bordes 12px */}
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: activa
                      ? 'rgba(255,215,0,0.12)'
                      : 'rgba(255,255,255,0.05)',
                    transition: 'background 0.2s',
                  }}>
                    <CatIcon
                      size={20}
                      strokeWidth={1.75}
                      color={activa ? '#FFD700' : '#5E606A'}
                    />
                  </div>
                  {/* Label */}
                  <span style={{
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.09em',
                    color: activa ? '#FFD700' : '#4E5058',
                    lineHeight: 1.2,
                    textAlign: 'center',
                  }}>
                    {cat.nombre}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Servicios 24/7 strip ──────────────────────────── */}
        <div className="mb-6 rounded-2xl overflow-hidden bg-[#1D1D1F] flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5">
          <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
            <span className="flex items-center gap-1.5 text-[#E0B11E] text-xs font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#E0B11E] animate-pulse" />
              Servicios eléctricos 24/7
            </span>
            {["Instalación", "Mantenimiento", "Asesoría técnica", "Revisión de planos", "Proyectos industriales"].map(s => (
              <span key={s} className="text-white/40 text-xs hidden sm:inline">·</span>
            )).reduce((acc, el, i) => [...acc, el,
              <span key={`s${i}`} className="text-white/60 text-xs hidden sm:inline font-medium">{["Instalación","Mantenimiento","Asesoría técnica","Revisión de planos","Proyectos industriales"][i]}</span>
            ], [])}
          </div>
          <button onClick={() => navigate('/cotiza')}
            className="flex-shrink-0 px-4 py-2 rounded-xl bg-[#E0B11E] text-[#1A0E00] font-bold text-xs hover:bg-[#F1C030] transition-colors whitespace-nowrap">
            Solicitar cotización →
          </button>
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
                {marcaActiva} &times;
              </button>
            )}
            {subcatActiva && (
              <button onClick={() => setSubcatActiva('')}
                className="flex items-center gap-1 px-3 py-1 bg-[#1D1D1F] text-white rounded-full text-xs font-bold">
                {subcatActiva} &times;
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
                    onVerDetalle={(p) => {
                      setProductoDetalle(p);
                      if (user) activityTracker.viewProduct(user.uid, p.id, p.title || p.nombre);
                    }}
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

export default CatalogoPage;
