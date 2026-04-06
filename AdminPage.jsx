import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from "firebase/firestore";
import { db } from "./firebase";

// ─── PANEL DE ADMINISTRACIÓN ENERMAN ─────────────────────────────────────────
// Accede en: http://localhost:5173/admin
// Funciones: ver todos los productos, editar, agregar, eliminar, buscar, filtrar

const CATEGORIAS = ["Conductores", "Iluminación", "Tubería", "Distribución", "Herramientas", "EPP", "Accesorios"];

function AdminPage() {
  const [productos, setProductos]         = useState([]);
  const [cargando, setCargando]           = useState(true);
  const [busqueda, setBusqueda]           = useState("");
  const [categoriaFiltro, setCategoria]   = useState("Todas");
  const [productoEdit, setProductoEdit]   = useState(null);
  const [modoNuevo, setModoNuevo]         = useState(false);
  const [guardando, setGuardando]         = useState(false);
  const [mensaje, setMensaje]             = useState(null);
  const [vistaDetalle, setVistaDetalle]   = useState(null);
  const [paginaActual, setPagina]         = useState(1);
  const POR_PAGINA = 20;

  // ── Cargar productos ────────────────────────────────────────────────────────
  const cargarProductos = useCallback(async () => {
    setCargando(true);
    try {
      const snap = await getDocs(collection(db, "productos"));
      const data = snap.docs.map(d => ({ _docId: d.id, ...d.data() }));
      data.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
      setProductos(data);
    } catch (e) {
      mostrarMensaje("Error al cargar: " + e.message, "error");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarProductos(); }, [cargarProductos]);

  const mostrarMensaje = (texto, tipo = "ok") => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 3500);
  };

  // ── Filtrado ────────────────────────────────────────────────────────────────
  const filtrados = productos.filter(p => {
    const texto = [p.title, p.marca, p.categoria, p.subcategoria, p.id, p._docId, p.description]
      .join(" ").toLowerCase();
    const catOk = categoriaFiltro === "Todas" || p.categoria === categoriaFiltro;
    return catOk && texto.includes(busqueda.toLowerCase());
  });

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginados = filtrados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  useEffect(() => { setPagina(1); }, [busqueda, categoriaFiltro]);

  // ── Estadísticas ────────────────────────────────────────────────────────────
  const stats = {
    total: productos.length,
    conPrecio: productos.filter(p => p.precio_desde > 0).length,
    conImagen: productos.filter(p => p.imagen_principal).length,
    porCategoria: CATEGORIAS.map(c => ({
      cat: c,
      count: productos.filter(p => p.categoria === c).length
    })),
  };

  // ── Guardar edición ─────────────────────────────────────────────────────────
  const guardarProducto = async (datos) => {
    setGuardando(true);
    try {
      if (modoNuevo) {
        const newId = "prod_" + Date.now();
        await addDoc(collection(db, "productos"), { ...datos, id: newId });
        mostrarMensaje("✅ Producto agregado correctamente");
      } else {
        const ref = doc(db, "productos", productoEdit._docId);
        await updateDoc(ref, datos);
        mostrarMensaje("✅ Producto actualizado");
      }
      setProductoEdit(null);
      setModoNuevo(false);
      await cargarProductos();
    } catch (e) {
      mostrarMensaje("❌ Error: " + e.message, "error");
    } finally {
      setGuardando(false);
    }
  };

  // ── Eliminar ────────────────────────────────────────────────────────────────
  const eliminarProducto = async (p) => {
    if (!confirm(`¿Eliminar "${p.title}"? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteDoc(doc(db, "productos", p._docId));
      mostrarMensaje("🗑️ Producto eliminado");
      await cargarProductos();
    } catch (e) {
      mostrarMensaje("❌ Error al eliminar: " + e.message, "error");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#fff", fontFamily: "system-ui, sans-serif" }}>

      {/* Mensaje flotante */}
      {mensaje && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: mensaje.tipo === "error" ? "#7f1d1d" : "#14532d",
          color: "#fff", padding: "12px 20px", borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)", fontSize: 14, maxWidth: 400,
        }}>
          {mensaje.texto}
        </div>
      )}

      {/* Header */}
      <div style={{ background: "#0a0a0a", borderBottom: "1px solid #1a1a1a", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 24, fontWeight: 900, color: "#e0b11e", letterSpacing: 4 }}>ENERMAN</span>
          <span style={{ background: "#1a1a1a", color: "#e0b11e", fontSize: 11, padding: "4px 10px", borderRadius: 20, fontWeight: 600, letterSpacing: 2 }}>ADMIN</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <a href="/" style={{ color: "#888", fontSize: 13, textDecoration: "none" }}>← Ver sitio</a>
          <button
            onClick={() => { setModoNuevo(true); setProductoEdit({}); }}
            style={{ background: "#e0b11e", color: "#000", border: "none", borderRadius: 10, padding: "8px 18px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}
          >
            + Agregar producto
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total productos", valor: stats.total, color: "#e0b11e" },
            { label: "Con precio", valor: stats.conPrecio, color: "#22c55e" },
            { label: "Con imagen", valor: stats.conImagen, color: "#3b82f6" },
            { label: "Sin imagen", valor: stats.total - stats.conImagen, color: "#ef4444" },
          ].map(s => (
            <div key={s.label} style={{ background: "#0e0e0e", borderRadius: 14, padding: "16px 20px", border: "1px solid #1a1a1a" }}>
              <p style={{ fontSize: 12, color: "#666", margin: 0, marginBottom: 6 }}>{s.label}</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: s.color, margin: 0 }}>{s.valor}</p>
            </div>
          ))}
        </div>

        {/* Por categoría */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {stats.porCategoria.map(c => (
            <button key={c.cat}
              onClick={() => setCategoria(categoriaFiltro === c.cat ? "Todas" : c.cat)}
              style={{
                background: categoriaFiltro === c.cat ? "#e0b11e" : "#111",
                color: categoriaFiltro === c.cat ? "#000" : "#999",
                border: "1px solid #222", borderRadius: 20, padding: "6px 14px",
                fontSize: 12, cursor: "pointer", fontWeight: 600,
              }}
            >
              {c.cat} ({c.count})
            </button>
          ))}
          {categoriaFiltro !== "Todas" && (
            <button onClick={() => setCategoria("Todas")}
              style={{ background: "transparent", color: "#e0b11e", border: "1px solid #333", borderRadius: 20, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>
              Limpiar filtro ✕
            </button>
          )}
        </div>

        {/* Buscador */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, marca, ID, categoría..."
            style={{
              flex: 1, background: "#111", border: "1px solid #222", borderRadius: 12,
              padding: "12px 16px", color: "#fff", fontSize: 14, outline: "none",
            }}
          />
          {busqueda && (
            <button onClick={() => setBusqueda("")}
              style={{ background: "#1a1a1a", color: "#888", border: "1px solid #222", borderRadius: 12, padding: "12px 16px", cursor: "pointer" }}>
              Limpiar
            </button>
          )}
          <button onClick={cargarProductos}
            style={{ background: "#1a1a1a", color: "#e0b11e", border: "1px solid #222", borderRadius: 12, padding: "12px 16px", cursor: "pointer", fontSize: 13 }}>
            🔄 Actualizar
          </button>
        </div>

        <p style={{ color: "#555", fontSize: 13, marginBottom: 16 }}>
          {filtrados.length} producto(s) {busqueda && `· búsqueda: "${busqueda}"`} {categoriaFiltro !== "Todas" && `· categoría: ${categoriaFiltro}`}
        </p>

        {/* Tabla de productos */}
        {cargando ? (
          <div style={{ textAlign: "center", padding: 60, color: "#555" }}>Cargando productos desde Firebase...</div>
        ) : (
          <div style={{ background: "#0a0a0a", borderRadius: 16, border: "1px solid #1a1a1a", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                  {["Imagen", "Nombre / ID", "Marca", "Categoría", "Subcategoría", "Precio", "Acciones"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, color: "#555", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginados.map((p, i) => (
                  <tr key={p._docId} style={{ borderBottom: "1px solid #111", background: i % 2 === 0 ? "transparent" : "#0d0d0d" }}>
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ width: 48, height: 48, borderRadius: 8, overflow: "hidden", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {p.imagen_principal
                          ? <img src={p.imagen_principal} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                          : <span style={{ fontSize: 20, opacity: 0.3 }}>📦</span>
                        }
                      </div>
                    </td>
                    <td style={{ padding: "10px 16px", maxWidth: 250 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title || "Sin nombre"}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "#444", marginTop: 2 }}>ID: {p.id || p._docId}</p>
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: 12, color: "#888" }}>{p.marca || "—"}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{ background: "#e0b11e15", color: "#e0b11e", fontSize: 11, padding: "3px 8px", borderRadius: 20, fontWeight: 600 }}>{p.categoria || "—"}</span>
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: 12, color: "#666" }}>{p.subcategoria || "—"}</td>
                    <td style={{ padding: "10px 16px" }}>
                      {p.precio_desde > 0
                        ? <span style={{ color: "#e0b11e", fontWeight: 700, fontSize: 13 }}>${Number(p.precio_desde).toFixed(2)}</span>
                        : <span style={{ color: "#444", fontSize: 12 }}>Consultar</span>
                      }
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => setVistaDetalle(p)}
                          style={{ background: "#1a1a1a", color: "#888", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12 }}>
                          👁 Ver
                        </button>
                        <button onClick={() => { setProductoEdit(p); setModoNuevo(false); }}
                          style={{ background: "#1c2a1a", color: "#4ade80", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12 }}>
                          ✏️ Editar
                        </button>
                        <button onClick={() => eliminarProducto(p)}
                          style={{ background: "#2a1a1a", color: "#f87171", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12 }}>
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtrados.length === 0 && (
              <div style={{ textAlign: "center", padding: 40, color: "#555" }}>No se encontraron productos con esos filtros.</div>
            )}
          </div>
        )}

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 20 }}>
            <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={paginaActual === 1}
              style={{ background: "#111", color: paginaActual === 1 ? "#333" : "#fff", border: "1px solid #222", borderRadius: 8, padding: "8px 16px", cursor: paginaActual === 1 ? "not-allowed" : "pointer" }}>
              ← Anterior
            </button>
            <span style={{ color: "#666", fontSize: 13 }}>Página {paginaActual} de {totalPaginas}</span>
            <button onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={paginaActual === totalPaginas}
              style={{ background: "#111", color: paginaActual === totalPaginas ? "#333" : "#fff", border: "1px solid #222", borderRadius: 8, padding: "8px 16px", cursor: paginaActual === totalPaginas ? "not-allowed" : "pointer" }}>
              Siguiente →
            </button>
          </div>
        )}
      </div>

      {/* Modal: Ver detalle */}
      {vistaDetalle && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={() => setVistaDetalle(null)}>
          <div style={{ background: "#0e0e0e", borderRadius: 20, padding: 32, maxWidth: 700, width: "100%", maxHeight: "85vh", overflowY: "auto", border: "1px solid #222" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ margin: 0, color: "#e0b11e", fontSize: 18 }}>Detalle del producto</h2>
              <button onClick={() => setVistaDetalle(null)} style={{ background: "transparent", border: "none", color: "#888", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 20, marginBottom: 20 }}>
              <div style={{ width: 140, height: 140, borderRadius: 12, overflow: "hidden", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {vistaDetalle.imagen_principal
                  ? <img src={vistaDetalle.imagen_principal} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontSize: 40, opacity: 0.3 }}>📦</span>
                }
              </div>
              <div>
                <h3 style={{ margin: "0 0 8px", color: "#fff", fontSize: 16 }}>{vistaDetalle.title}</h3>
                <p style={{ margin: "0 0 4px", fontSize: 12, color: "#555" }}>ID Firestore: {vistaDetalle._docId}</p>
                <p style={{ margin: "0 0 4px", fontSize: 12, color: "#555" }}>ID Producto: {vistaDetalle.id}</p>
                <p style={{ margin: "0 0 4px", fontSize: 12, color: "#555" }}>Marca: {vistaDetalle.marca || "—"}</p>
                <p style={{ margin: "0 0 4px", fontSize: 12, color: "#555" }}>Categoría: {vistaDetalle.categoria} › {vistaDetalle.subcategoria}</p>
                <p style={{ margin: "0 0 4px", fontSize: 13, color: "#e0b11e", fontWeight: 700 }}>
                  {vistaDetalle.precio_desde > 0 ? `$${Number(vistaDetalle.precio_desde).toFixed(2)} MXN` : "Precio a consultar"}
                </p>
              </div>
            </div>

            {vistaDetalle.description && (
              <div style={{ background: "#111", borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <p style={{ margin: "0 0 6px", fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 1 }}>Descripción</p>
                <p style={{ margin: 0, fontSize: 13, color: "#ccc", lineHeight: 1.6 }}>{vistaDetalle.description?.replace(/<[^>]+>/g, "").slice(0, 500)}</p>
              </div>
            )}

            {vistaDetalle.imagenes?.filter(i => i).length > 0 && (
              <div>
                <p style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Imágenes</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {vistaDetalle.imagenes.filter(i => i).map((img, i) => (
                    <img key={i} src={img} alt="" style={{ width: 70, height: 70, borderRadius: 8, objectFit: "cover", background: "#1a1a1a" }} />
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => { setVistaDetalle(null); setProductoEdit(vistaDetalle); setModoNuevo(false); }}
                style={{ flex: 1, background: "#e0b11e", color: "#000", border: "none", borderRadius: 12, padding: "12px", fontWeight: 700, cursor: "pointer" }}>
                ✏️ Editar este producto
              </button>
              <button onClick={() => setVistaDetalle(null)}
                style={{ background: "#1a1a1a", color: "#888", border: "none", borderRadius: 12, padding: "12px 20px", cursor: "pointer" }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Editar / Nuevo producto */}
      {productoEdit !== null && (
        <ModalEditar
          producto={modoNuevo ? {} : productoEdit}
          modoNuevo={modoNuevo}
          guardando={guardando}
          onGuardar={guardarProducto}
          onCerrar={() => { setProductoEdit(null); setModoNuevo(false); }}
        />
      )}
    </div>
  );
}

// ─── MODAL DE EDICIÓN ─────────────────────────────────────────────────────────
function ModalEditar({ producto, modoNuevo, guardando, onGuardar, onCerrar }) {
  const [form, setForm] = useState({
    title:          producto.title || "",
    marca:          producto.marca || "",
    categoria:      producto.categoria || "Accesorios",
    subcategoria:   producto.subcategoria || "",
    description:    producto.description?.replace(/<[^>]+>/g, "") || "",
    imagen_principal: producto.imagen_principal || "",
    precio_desde:   producto.precio_desde || 0,
    activo:         producto.activo !== false,
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleGuardar = () => {
    if (!form.title.trim()) { alert("El nombre es obligatorio"); return; }
    onGuardar({
      ...form,
      precio_desde: Number(form.precio_desde) || 0,
      imagenes: [form.imagen_principal, producto.imagenes?.[1] || "", producto.imagenes?.[2] || ""].filter(Boolean),
      search_terms: [form.categoria.toLowerCase(), form.marca.toLowerCase(), form.subcategoria.toLowerCase(), form.title.toLowerCase()],
    });
  };

  const campo = (label, key, tipo = "text", opciones = null) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 11, color: "#555", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>{label}</label>
      {opciones ? (
        <select value={form[key]} onChange={e => set(key, e.target.value)}
          style={{ width: "100%", background: "#151515", border: "1px solid #222", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 13, outline: "none" }}>
          {opciones.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : tipo === "textarea" ? (
        <textarea value={form[key]} onChange={e => set(key, e.target.value)} rows={4}
          style={{ width: "100%", background: "#151515", border: "1px solid #222", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
      ) : (
        <input type={tipo} value={form[key]} onChange={e => set(key, tipo === "number" ? Number(e.target.value) : e.target.value)}
          style={{ width: "100%", background: "#151515", border: "1px solid #222", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
      )}
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onCerrar}>
      <div style={{ background: "#0e0e0e", borderRadius: 20, padding: 32, maxWidth: 600, width: "100%", maxHeight: "88vh", overflowY: "auto", border: "1px solid #222" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
          <h2 style={{ margin: 0, color: "#e0b11e", fontSize: 18 }}>{modoNuevo ? "➕ Nuevo producto" : "✏️ Editar producto"}</h2>
          <button onClick={onCerrar} style={{ background: "transparent", border: "none", color: "#888", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>

        {campo("Nombre del producto *", "title")}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>{campo("Marca", "marca")}</div>
          <div>{campo("Precio MXN (0 = consultar)", "precio_desde", "number")}</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>{campo("Categoría", "categoria", "text", CATEGORIAS)}</div>
          <div>{campo("Subcategoría", "subcategoria")}</div>
        </div>

        {campo("Descripción", "description", "textarea")}
        {campo("URL de imagen principal", "imagen_principal")}

        {form.imagen_principal && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, color: "#555", marginBottom: 6 }}>VISTA PREVIA</p>
            <img src={form.imagen_principal} alt="" style={{ width: 100, height: 100, borderRadius: 10, objectFit: "cover", background: "#1a1a1a" }}
              onError={e => { e.target.style.display = "none"; }} />
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <input type="checkbox" checked={form.activo} onChange={e => set("activo", e.target.checked)} id="activo" />
          <label htmlFor="activo" style={{ fontSize: 13, color: "#888", cursor: "pointer" }}>Producto activo (visible en catálogo)</label>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={handleGuardar} disabled={guardando}
            style={{ flex: 1, background: "#e0b11e", color: "#000", border: "none", borderRadius: 12, padding: "14px", fontWeight: 700, cursor: guardando ? "not-allowed" : "pointer", fontSize: 14, opacity: guardando ? 0.7 : 1 }}>
            {guardando ? "Guardando..." : modoNuevo ? "✅ Crear producto" : "✅ Guardar cambios"}
          </button>
          <button onClick={onCerrar}
            style={{ background: "#1a1a1a", color: "#888", border: "none", borderRadius: 12, padding: "14px 20px", cursor: "pointer" }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
