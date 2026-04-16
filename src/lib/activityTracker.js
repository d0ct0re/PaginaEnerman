import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

// ─── Servicio de trackeo de actividad de usuarios ─────────────────────────────
// No intrusivo: todos los errores son silenciosos para no afectar la UI.

const track = async (userId, tipo, detalles = {}) => {
  if (!userId) return;
  try {
    await addDoc(collection(db, "user_activity"), {
      userId,
      tipo,
      detalles,
      pagina: window.location.pathname,
      timestamp: serverTimestamp(),
    });
  } catch {
    // Silencioso — el trackeo nunca debe interrumpir la experiencia del usuario
  }
};

export const activityTracker = {
  login:           (userId)                    => track(userId, "login", {}),
  logout:          (userId)                    => track(userId, "logout", {}),
  addToCart:       (userId, producto, cantidad) => track(userId, "agregar_carrito", { productoId: producto.id, nombre: producto.title, cantidad }),
  removeFromCart:  (userId, producto)           => track(userId, "quitar_carrito",  { productoId: producto.id, nombre: producto.title }),
  whatsappRequest: (userId, productos, total)   => track(userId, "enviar_whatsapp", { totalProductos: productos.length, total }),
  viewProduct:     (userId, productoId, nombre) => track(userId, "ver_producto",    { productoId, nombre }),
  search:          (userId, termino)            => track(userId, "busqueda",        { termino }),
  saveCotizacion:  (userId, folio, total)       => track(userId, "guardar_cotizacion", { folio, total }),
};
