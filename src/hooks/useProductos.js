import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

export function useProductos() {
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

export function getImagenes(producto) {
  const imgs = [];
  if (producto.imagen) imgs.push(producto.imagen);
  if (producto.imagen_2) imgs.push(producto.imagen_2);
  if (producto.imagen_3) imgs.push(producto.imagen_3);
  return imgs;
}
