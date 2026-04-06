// agregarProducto.js
// Ejecuta esto en la consola del navegador en tu página (localhost:5173)
// O copia el objeto y agrégalo manualmente en Firebase Console

const tuboConduitPDR = {
  // Información general
  title: "Tubo Conduit Galvanizado Pared Delgada",
  marca: "RYMCO",
  categoria: "Tubería",
  subcategoria: "Tubo Conduit",
  descripcion: "Funciona para acometidas, como protección al cableado eléctrico, recomendado para interior. Fabricada en acero galvanizado. Largo 305 cm.",
  
  // Imagen principal
  imagen_principal: "https://www.surtidorelectrico.com.mx/cdn/shop/files/TCPD_800x.jpg?v=1719869198",
  imagen_2: "",
  imagen_3: "",
  
  // Precio base (el más bajo)
  precio_desde: 91.33,
  
  // Disponibilidad general
  disponible: true,
  activo: true,
  
  // ⭐ VARIANTES - Esta es la nueva estructura
  tiene_variantes: true,
  variantes: [
    {
      id: "TCPD13RY",
      sku: "TCPD13RY",
      nombre: "½\"",
      tamaño: "½\"",
      precio: 91.33,
      stock: 100,
      disponible: true
    },
    {
      id: "TCPD19RY",
      sku: "TCPD19RY",
      nombre: "¾\"",
      tamaño: "¾\"",
      precio: 122.00,
      stock: 100,
      disponible: true
    },
    {
      id: "TCPD25RY",
      sku: "TCPD25RY",
      nombre: "1\"",
      tamaño: "1\"",
      precio: 213.93,
      stock: 100,
      disponible: true
    },
    {
      id: "TCPD32RY",
      sku: "TCPD32RY",
      nombre: "1 ¼\"",
      tamaño: "1 ¼\"",
      precio: 281.97,
      stock: 100,
      disponible: true
    },
    {
      id: "TCPD38RY",
      sku: "TCPD38RY",
      nombre: "1 ½\"",
      tamaño: "1 ½\"",
      precio: 327.04,
      stock: 100,
      disponible: true
    },
    {
      id: "TCPD51RY",
      sku: "TCPD51RY",
      nombre: "2\"",
      tamaño: "2\"",
      precio: 416.18,
      stock: 100,
      disponible: true
    },
    {
      id: "TCPD63RY",
      sku: "TCPD63RY",
      nombre: "2 ½\"",
      tamaño: "2 ½\"",
      precio: 847.62,
      stock: 100,
      disponible: true
    },
    {
      id: "TCPD76RY",
      sku: "TCPD76RY",
      nombre: "3\"",
      tamaño: "3\"",
      precio: 1059.90,
      stock: 100,
      disponible: true
    },
    {
      id: "TCPD102RY",
      sku: "TCPD102RY",
      nombre: "4\"",
      tamaño: "4\"",
      precio: 1494.32,
      stock: 100,
      disponible: true
    }
  ],
  
  // Especificaciones técnicas
  especificaciones: {
    material: "Acero galvanizado",
    largo: "305 cm",
    tipo: "Pared Delgada",
    uso: "Interior"
  },
  
  // Metadatos
  fecha_creacion: new Date().toISOString(),
  fecha_actualizacion: new Date().toISOString()
};

// Para usar en consola del navegador:
// 1. Abre localhost:5173
// 2. Abre DevTools (F12)
// 3. Ve a Console
// 4. Pega este código
// 5. Luego ejecuta:
//    import { doc, setDoc } from "firebase/firestore";
//    import { db } from "./firebase";
//    await setDoc(doc(db, "productos", "tubo-conduit-pdr"), tuboConduitPDR);

console.log("Producto listo para agregar:", tuboConduitPDR);
