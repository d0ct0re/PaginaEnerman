import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Download, CheckCircle2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../context/AuthContext';
import { activityTracker } from '../lib/activityTracker';
import FooterEnerman from '../components/FooterEnerman';

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
} // Helper pdf images

function PedidoPage({ carrito, setCarrito }) {
  const navigate = useNavigate();
  const { user, perfil } = useAuth();
  const [nota, setNota] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState(null); // { texto, color }

  // ── Datos del cliente para la cotización ─────────────────
  const [clienteNombre,  setClienteNombre]  = useState(perfil?.nombre  || "");
  const [clienteEmpresa, setClienteEmpresa] = useState("");
  const [clienteTel,     setClienteTel]     = useState(perfil?.telefono || user?.phoneNumber || "");
  const [clienteRFC,     setClienteRFC]     = useState("");

  // ── Entrega ───────────────────────────────────────────────
  const [entrega,        setEntrega]        = useState("tienda"); // "tienda" | "domicilio"
  const [domCalle,       setDomCalle]       = useState("");
  const [domColonia,     setDomColonia]     = useState("");
  const [domCP,          setDomCP]          = useState("");
  const [domReferencias, setDomReferencias] = useState("");

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

  const pedidoInp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-[#1A1C1D] focus:outline-none focus:border-[#E0B11E] focus:ring-1 focus:ring-[#E0B11E]/20 transition-all placeholder-[#C7C7CC]";

  // Genera número de cotización
  const numCotizacion = `ENR-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;

  // Construye el mensaje de texto para WhatsApp
  const buildMensaje = () => {
    const fecha = new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
    const lineas = carrito.map((item, i) => {
      const precio = item.precioFinal || item.precio || 0;
      const variante = item.varianteNombre ? ` (${item.varianteNombre})` : "";
      const subtotal = precio > 0 ? `$${(precio * item.cantidad).toFixed(2)} MXN` : "Consultar precio";
      return `${i + 1}. ${item.nombre}${variante}\n   Cant: ${item.cantidad}${precio > 0 ? ` | $${precio.toFixed(2)} c/u` : ""} | *${subtotal}*`;
    });
    const totalTexto = total > 0 ? `\n*Total estimado: $${total.toFixed(2)} MXN*` : "";
    const notaTexto  = nota.trim() ? `\nNotas: ${nota.trim()}` : "";
    const clienteTexto = clienteNombre.trim()
      ? `\n\n*Cliente:* ${clienteNombre}${clienteEmpresa ? ` — ${clienteEmpresa}` : ""}${clienteTel ? `\nTel: ${clienteTel}` : ""}${clienteRFC ? `\nRFC: ${clienteRFC}` : ""}`
      : "";
    const entregaTexto = entrega === "domicilio"
      ? `\n\n*Entrega a domicilio:*\n${domCalle}, Col. ${domColonia}, C.P. ${domCP}${domReferencias ? `\nRef: ${domReferencias}` : ""}`
      : "\n\n*Retiro en tienda*";
    return `*PRE-COTIZACION ENERMAN*\n_Folio: ${numCotizacion}_\n_${fecha}_${clienteTexto}${entregaTexto}\n\n${lineas.join("\n\n")}${totalTexto}${notaTexto}\n\n_Valida por 15 dias habiles_`;
  };

  // Genera el documento PDF con imágenes
  const buildPDF = async (imagenesCache) => {
    const doc = new jsPDF();
    const fecha = new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });
    const pageW = doc.internal.pageSize.width;
    const pageH = doc.internal.pageSize.height;

    // Fecha de validez (+15 días hábiles ≈ +21 días)
    const fechaValidez = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
      .toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });

    // ── Encabezado ───────────────────────────────────────────
    doc.setFillColor(29, 29, 31);
    doc.rect(0, 0, pageW, 36, "F");
    doc.setFontSize(20); doc.setFont("helvetica", "bold");
    doc.setTextColor(224, 177, 30);
    doc.text("ENERMAN", 14, 16);
    doc.setFontSize(7.5); doc.setFont("helvetica", "normal");
    doc.setTextColor(160, 160, 160);
    doc.text("Material Eléctrico · Calle 3914, Monterrey, N.L.", 14, 24);
    doc.text("Tel: 814 499 4504  ·  @ENERMAN", 14, 30);
    doc.setFont("helvetica", "bold"); doc.setTextColor(224, 177, 30);
    doc.text("PRE-COTIZACIÓN", pageW - 14, 14, { align: "right" });
    doc.setFont("helvetica", "normal"); doc.setTextColor(180, 180, 180);
    doc.text(`Folio: ${numCotizacion}`, pageW - 14, 21, { align: "right" });
    doc.text(`Fecha: ${fecha}`, pageW - 14, 27, { align: "right" });
    doc.text(`Válida hasta: ${fechaValidez}`, pageW - 14, 33, { align: "right" });

    // ── Datos del cliente ─────────────────────────────────────
    let afterHeader = 42;
    if (clienteNombre.trim() || clienteEmpresa.trim()) {
      doc.setFillColor(248, 248, 250);
      doc.rect(10, afterHeader, pageW - 20, clienteEmpresa.trim() ? 18 : 12, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(40, 40, 40);
      doc.text(`Cliente: ${clienteNombre}${clienteEmpresa ? " — " + clienteEmpresa : ""}`, 14, afterHeader + 8);
      if (clienteTel || clienteRFC) {
        doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(100, 100, 100);
        const extras = [clienteTel ? `Tel: ${clienteTel}` : null, clienteRFC ? `RFC: ${clienteRFC}` : null].filter(Boolean).join("   ");
        doc.text(extras, 14, afterHeader + 15);
        afterHeader += 6;
      }
      afterHeader += 16;
    }

    // ── Entrega ───────────────────────────────────────────────
    if (entrega === "domicilio" && domCalle.trim()) {
      doc.setFillColor(224, 177, 30, 30);
      doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(120, 90, 0);
      doc.text(`Entrega a domicilio: ${domCalle}, Col. ${domColonia}, C.P. ${domCP}`, 14, afterHeader + 6);
      afterHeader += 12;
    }

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
      startY: afterHeader,
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

    // ── Validez ───────────────────────────────────────────────
    const validezY = finalY + (total > 0 ? 26 : 12) + (nota.trim() ? 10 : 0);
    doc.setFont("helvetica", "italic"); doc.setFontSize(7.5); doc.setTextColor(140, 140, 140);
    doc.text(`Cotización válida por 15 días hábiles hasta el ${fechaValidez}. Precios sujetos a disponibilidad.`, 14, validezY + 8);

    // ── Pie de página ────────────────────────────────────────
    doc.setFillColor(29, 29, 31);
    doc.rect(0, pageH - 14, pageW, 14, "F");
    doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(120, 120, 120);
    doc.text("ENERMAN · Calle 3914, Monterrey N.L. · 814 499 4504 · @ENERMAN", pageW / 2, pageH - 7, { align: "center" });
    doc.setTextColor(90, 90, 90);
    doc.text(`Folio: ${numCotizacion}`, pageW - 14, pageH - 3, { align: "right" });

    return doc;
  };

  // ── Guardar cotización en Firestore ──────────────────────
  const guardarPedidoFirestore = async () => {
    if (!user) return;
    try {
      const data = {
        folio: numCotizacion,
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
        cliente: {
          nombre: clienteNombre.trim() || perfil?.nombre || "",
          empresa: clienteEmpresa.trim() || null,
          telefono: clienteTel.trim() || null,
          rfc: clienteRFC.trim() || null,
        },
        entrega: entrega === "domicilio" ? {
          tipo: "domicilio",
          calle: domCalle,
          colonia: domColonia,
          cp: domCP,
          referencias: domReferencias,
        } : { tipo: "tienda" },
        fecha: serverTimestamp(),
        estado: "enviado",
        canal: "whatsapp",
        uid: user.uid,
      };
      // Guardar en historial del usuario
      await addDoc(collection(db, "pedidos", user.uid, "historial"), data);
      // Guardar en colección global de cotizaciones para admin
      await addDoc(collection(db, "cotizaciones"), data);
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
      activityTracker.whatsappRequest(user?.uid, carrito, carrito.reduce((s, i) => s + (i.precioFinal || 0) * i.cantidad, 0));

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
      mostrarAviso("PDF descargado — Adjúntalo en WhatsApp al enviar el mensaje", "#1D1D1F");
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

                {/* ── Datos del cliente ──────────────────────── */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-lg bg-[#FFF8E1] flex items-center justify-center">
                      <FileText size={13} className="text-[#E0B11E]" />
                    </div>
                    <h3 className="font-bold text-[#1A1C1D] text-sm">Datos para la cotización</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-[#6E6E73] uppercase tracking-wide mb-1">Nombre</label>
                        <input type="text" value={clienteNombre} onChange={e => setClienteNombre(e.target.value)}
                          placeholder="Tu nombre" className={pedidoInp} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#6E6E73] uppercase tracking-wide mb-1">Empresa</label>
                        <input type="text" value={clienteEmpresa} onChange={e => setClienteEmpresa(e.target.value)}
                          placeholder="(opcional)" className={pedidoInp} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-[#6E6E73] uppercase tracking-wide mb-1">Teléfono</label>
                        <input type="tel" value={clienteTel} onChange={e => setClienteTel(e.target.value)}
                          placeholder="814 000 0000" className={pedidoInp} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#6E6E73] uppercase tracking-wide mb-1">RFC</label>
                        <input type="text" value={clienteRFC} onChange={e => setClienteRFC(e.target.value)}
                          placeholder="(opcional)" className={`${pedidoInp} uppercase`} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Tipo de entrega ────────────────────────── */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <h3 className="font-bold text-[#1A1C1D] text-sm mb-3">¿Cómo recibes tu material?</h3>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      { v: "tienda",    label: "Recoger en tienda" },
                      { v: "domicilio", label: "Envío a domicilio" },
                    ].map(op => (
                      <button key={op.v} onClick={() => setEntrega(op.v)}
                        className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-bold transition-all ${
                          entrega === op.v ? "border-[#E0B11E] bg-[#FFF8E1] text-[#1A0E00]" : "border-gray-200 text-[#6E6E73] hover:border-gray-300"
                        }`}>
                        {op.label}
                      </button>
                    ))}
                  </div>
                  {entrega === "domicilio" && (
                    <div className="space-y-2.5 pt-1 border-t border-[#F2F2F7]">
                      <div>
                        <label className="block text-[10px] font-bold text-[#6E6E73] uppercase tracking-wide mb-1">Calle y número *</label>
                        <input type="text" value={domCalle} onChange={e => setDomCalle(e.target.value)}
                          placeholder="Av. Constitución 1234" className={pedidoInp} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-[#6E6E73] uppercase tracking-wide mb-1">Colonia</label>
                          <input type="text" value={domColonia} onChange={e => setDomColonia(e.target.value)}
                            placeholder="Col. Centro" className={pedidoInp} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#6E6E73] uppercase tracking-wide mb-1">C.P.</label>
                          <input type="text" value={domCP} onChange={e => setDomCP(e.target.value)}
                            placeholder="64000" className={pedidoInp} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#6E6E73] uppercase tracking-wide mb-1">Referencias</label>
                        <input type="text" value={domReferencias} onChange={e => setDomReferencias(e.target.value)}
                          placeholder="Entre calles, color de fachada…" className={pedidoInp} />
                      </div>
                    </div>
                  )}
                  {entrega === "tienda" && (
                    <p className="text-[10px] text-[#6E6E73] leading-relaxed">
                      Calle 3914, Monterrey N.L. · Lun–Vie 8:00–18:00 · Sáb 9:00–14:00
                    </p>
                  )}
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
                        <p className="text-sm font-black leading-tight">Enviar pre-cotización por WhatsApp</p>
                        <p className="text-[10px] opacity-80 font-normal">PDF folio {numCotizacion} · Válida 15 días</p>
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

                {/* Guardar cotización */}
                <button
                  onClick={async () => {
                    await guardarPedidoFirestore();
                    navigate("/mis-cotizaciones");
                  }}
                  disabled={enviando}
                  className="w-full py-3 rounded-2xl bg-white border border-[#E8E8EA] text-[#1A1C1D] font-bold flex items-center justify-center gap-2 text-sm disabled:opacity-60 hover:border-[#E0B11E] transition-colors shadow-sm"
                >
                  <FileText size={16} className="text-[#6E6E73]" /> Guardar cotización
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

export default PedidoPage;
