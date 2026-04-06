# -*- coding: utf-8 -*-
"""
scraper_conductores_tuberia.py
==============================
Extrae Conductores y Tubería de surtidorelectrico.com.mx (Shopify API pública)
y genera productos_firebase.json listo para importar con import_to_firebase_v2.py

Uso:
    pip install requests
    python scraper_conductores_tuberia.py

Luego importa con:
    python import_to_firebase_v2.py
"""

import requests
import json
import time
import re
from datetime import datetime

BASE_URL = "https://www.surtidorelectrico.com.mx"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json",
}

# ── Colecciones a extraer (solo las verificadas con productos) ─────────────────
# Cada entrada: (handle_de_coleccion, categoria_enerman, subcategoria)
# Si subcategoria es None, se infiere del product_type de Shopify.
COLECCIONES = [
    # --- CONDUCTORES ---
    ("cable-thhw-ls",   "Conductores", "THW-LS / THHW-LS"),  # 32 productos
    ("conductores",     "Conductores", None),                  # 51 (overlaps)
    ("cables-uso-rudo", "Conductores", "Uso Rudo"),            # 9
    ("cables-duplex",   "Conductores", "Duplex"),              # 2
    ("cable-desnudo",   "Conductores", "Cobre Desnudo"),       # 1
    ("alambre-desnudo", "Conductores", "Cobre Desnudo"),       # 1
    ("viakon",          "Conductores", None),                  # 15 (filtrado por keyword)

    # --- TUBERÍA ---
    ("tuberia",         "Tubería", None),                      # 39
    ("poliducto",       "Tubería", "Poliducto"),               # 22 (incluye conduit)
    ("condulets",       "Tubería", "Condulet"),                # 5
]

# ── Marcas que NO queremos en Conductores (solo filtramos viakon a cable) ──────
MARCAS_IGNORAR_EN_CONDUCTORES = set()

# ── Keywords que identifican que un producto Viakon es conductor ───────────────
KEYWORDS_CONDUCTOR = ["cable", "alambre", "conductor", "thw", "thwn", "thhw", "duplex", "uso rudo"]

# ── Mapa de colores (Shopify puede poner variante en inglés) ──────────────────
COLOR_MAP = {
    "black": "Negro", "negro": "Negro",
    "red":   "Rojo",  "rojo":  "Rojo",
    "blue":  "Azul",  "azul":  "Azul",
    "white": "Blanco","blanco":"Blanco",
    "green": "Verde", "verde": "Verde",
    "yellow":"Amarillo","amarillo":"Amarillo",
    "gray":  "Gris",  "grey":  "Gris", "gris": "Gris",
    "orange":"Naranja","naranja":"Naranja",
}


def slug(text: str) -> str:
    """Genera ID seguro para Firestore."""
    t = text.lower().strip()
    t = re.sub(r'[^\w\s-]', '', t)
    t = re.sub(r'[\s_]+', '-', t)
    return t[:80]


def fetch_collection(handle: str) -> list:
    """Descarga todos los productos de una colección Shopify paginando de 250 en 250."""
    products = []
    page = 1
    while True:
        url = f"{BASE_URL}/collections/{handle}/products.json?limit=250&page={page}"
        try:
            r = requests.get(url, headers=HEADERS, timeout=15)
            if r.status_code == 404:
                return products   # colección no existe, ignorar
            if r.status_code != 200:
                print(f"  ⚠  {handle} p{page}: HTTP {r.status_code}")
                break
            data = r.json().get("products", [])
            if not data:
                break
            products.extend(data)
            print(f"  ✓  {handle} p{page}: {len(data)} productos")
            if len(data) < 250:
                break
            page += 1
            time.sleep(0.4)
        except Exception as e:
            print(f"  ✗  {handle}: {e}")
            break
    return products


def normalizar_variante_nombre(option_name: str, option_value: str) -> str:
    """Convierte el valor de opción Shopify en nombre legible."""
    val = option_value.strip()
    # Colores
    low = val.lower()
    if low in COLOR_MAP:
        return COLOR_MAP[low]
    return val


def shopify_to_firebase(shopify_product: dict, categoria: str, subcategoria_default) -> dict | None:
    """
    Convierte un producto Shopify al formato Firebase de ENERMAN.
    Retorna None si el producto no tiene variantes disponibles.
    """
    title = shopify_product.get("title", "").strip()
    if not title:
        return None

    # Filtro extra para colección viakon: solo conductores
    if categoria == "Conductores":
        title_low = title.lower()
        if not any(k in title_low for k in KEYWORDS_CONDUCTOR):
            return None  # es luminaria u otro producto de Viakon

    # Imágenes
    imagenes = [img["src"] for img in shopify_product.get("images", []) if img.get("src")]
    imagen_principal = imagenes[0] if imagenes else ""
    imagen_2 = imagenes[1] if len(imagenes) > 1 else ""
    imagen_3 = imagenes[2] if len(imagenes) > 2 else ""

    # Descripción (strip HTML básico)
    desc_raw = shopify_product.get("body_html", "") or ""
    descripcion = re.sub(r'<[^>]+>', ' ', desc_raw).strip()
    descripcion = re.sub(r'\s+', ' ', descripcion)[:800]

    # Marca
    marca = (shopify_product.get("vendor", "") or "").strip() or "ENERMAN"

    # Subcategoría: usar el tipo de producto Shopify o el default
    subcat = (shopify_product.get("product_type", "") or subcategoria_default or "").strip()

    # Variantes Shopify
    shopify_variants = shopify_product.get("variants", [])
    options = shopify_product.get("options", [])     # [{name: "Calibre", ...}]

    # Solo hay elección real si hay 2+ variantes con nombres distintos
    tiene_variantes = len(shopify_variants) >= 2

    variantes_enerman = []
    precios_disponibles = []

    for sv in shopify_variants:
        precio_str = sv.get("price", "0") or "0"
        try:
            precio = float(precio_str)
        except ValueError:
            precio = 0.0

        disponible = sv.get("available", True)
        sku = (sv.get("sku", "") or "").strip()

        # Armar nombre de la variante combinando opciones
        partes_nombre = []
        for i in range(1, 4):
            val = sv.get(f"option{i}", "") or ""
            if val and val.lower() not in ("default title", "default"):
                # Normalizar color si aplica
                opt_name = options[i-1]["name"].lower() if i-1 < len(options) else ""
                if "color" in opt_name or "colour" in opt_name:
                    val = normalizar_variante_nombre(opt_name, val)
                partes_nombre.append(val)

        nombre_variante = " / ".join(partes_nombre) if partes_nombre else sv.get("title", "Estándar")

        if precio > 0:
            precios_disponibles.append(precio)

        variantes_enerman.append({
            "id":         sku or slug(f"{title}-{nombre_variante}"),
            "nombre":     nombre_variante,
            "precio":     precio,
            "disponible": disponible,
        })

    precio_desde = min(precios_disponibles) if precios_disponibles else 0.0

    # ID único para Firestore: basado en título y marca
    firestore_id = slug(f"{marca}-{title}")

    # Search terms
    search_terms = list({
        categoria.lower(),
        marca.lower(),
        subcat.lower(),
        title.lower(),
        *[w for w in title.lower().split() if len(w) > 2],
    })

    producto = {
        "id":               firestore_id,
        "title":            title,
        "marca":            marca,
        "categoria":        categoria,
        "subcategoria":     subcat,
        "description":      descripcion,
        "imagen_principal": imagen_principal,
        "imagen_2":         imagen_2,
        "imagen_3":         imagen_3,
        "precio_desde":     precio_desde,
        "disponible":       True,
        "activo":           True,
        "tiene_variantes":  tiene_variantes,
        "variantes":        variantes_enerman if tiene_variantes else [],
        "search_terms":     search_terms,
        "_fuente":          "surtidor",           # para saber que imagen viene de ahí
        "_shopify_id":      shopify_product["id"],
        "_actualizado":     datetime.now().isoformat(),
    }

    return producto


def main():
    print("=" * 55)
    print("  ENERMAN — Scraper Conductores + Tubería")
    print(f"  Fuente: {BASE_URL}")
    print("=" * 55)

    # 1. Descargar todas las colecciones
    shopify_raw: dict[int, tuple[dict, str, str | None]] = {}  # shopify_id → (producto, cat, subcat)

    for handle, categoria, subcategoria in COLECCIONES:
        print(f"\n→ Colección: {handle}")
        products = fetch_collection(handle)
        for p in products:
            sid = p["id"]
            if sid not in shopify_raw:
                shopify_raw[sid] = (p, categoria, subcategoria)
            # Si ya existe pero con subcategoría None, actualizar
            elif shopify_raw[sid][2] is None and subcategoria is not None:
                shopify_raw[sid] = (p, shopify_raw[sid][1], subcategoria)

    print(f"\n→ Total productos únicos descargados: {len(shopify_raw)}")

    # 2. Convertir a formato Firebase
    productos_firebase = []
    ids_vistos = set()

    for sid, (sp, categoria, subcat) in shopify_raw.items():
        producto = shopify_to_firebase(sp, categoria, subcat)
        if producto is None:
            continue
        # Deduplicar por ID de Firestore (podría haber colisión de slugs)
        fid = producto["id"]
        if fid in ids_vistos:
            fid = fid + f"-{len(ids_vistos)}"
            producto["id"] = fid
        ids_vistos.add(fid)
        productos_firebase.append(producto)

    # 3. Estadísticas
    con_vars = sum(1 for p in productos_firebase if p["tiene_variantes"])
    sin_precio = sum(1 for p in productos_firebase if p["precio_desde"] == 0)
    por_cat = {}
    for p in productos_firebase:
        c = p["categoria"]
        por_cat[c] = por_cat.get(c, 0) + 1

    print(f"\n{'─'*55}")
    print(f"  Productos listos:       {len(productos_firebase)}")
    print(f"  Con variantes:          {con_vars}")
    print(f"  Sin precio (consultar): {sin_precio}")
    for cat, n in sorted(por_cat.items()):
        print(f"    {cat}: {n}")
    print(f"{'─'*55}")

    # 4. Guardar
    salida = {"productos": productos_firebase}
    with open("productos_firebase.json", "w", encoding="utf-8") as f:
        json.dump(salida, f, ensure_ascii=False, indent=2)

    print(f"\n✅  Guardado: productos_firebase.json ({len(productos_firebase)} productos)")
    print("    Siguiente paso:  python import_to_firebase_v2.py")
    print()

    # 5. Preview: muestra 3 productos con variantes
    print("── Preview (productos con variantes) ──")
    preview = [p for p in productos_firebase if p["tiene_variantes"]][:3]
    for p in preview:
        print(f"\n  {p['title']} ({p['categoria']})")
        print(f"  Precio desde: ${p['precio_desde']}")
        print(f"  Variantes ({len(p['variantes'])}):")
        for v in p["variantes"][:5]:
            print(f"    • {v['nombre']:20} ${v['precio']}")
        if len(p["variantes"]) > 5:
            print(f"    ... y {len(p['variantes'])-5} más")


if __name__ == "__main__":
    main()
