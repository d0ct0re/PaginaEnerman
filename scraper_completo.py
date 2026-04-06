# -*- coding: utf-8 -*-
"""
scraper_completo.py
===================
Extrae TODOS los productos de surtidorelectrico.com.mx (Shopify) con:
  - Precios por variante
  - Todas las imágenes
  - Descripciones completas
  - Categoría y subcategoría mapeadas a ENERMAN

Salida: productos_firebase.json  (listo para setup_firebase.py)

Uso: python scraper_completo.py
"""

import json
import time
import re
import unicodedata
import urllib.request
import urllib.error

BASE_URL = "https://www.surtidorelectrico.com.mx/collections/{handle}/products.json"

# ─── Mapeo de colecciones → categoría ENERMAN ─────────────────────────────────
#
# Formato: "handle": ("Categoría", "Subcategoría")
# Colecciones con el mismo producto en múltiples handles se deduplicarán por ID.
#
COLECCIONES = {
    # ── CONDUCTORES ───────────────────────────────────────────────────────────
    "conductores":           ("Conductores", "CONDUCTORES"),
    "cable-thhw-ls":         ("Conductores", "THW-LS / THHW-LS"),
    "cables-uso-rudo":       ("Conductores", "USO RUDO"),
    "cables-duplex":         ("Conductores", "DUPLEX"),
    "cable-desnudo":         ("Conductores", "DESNUDO"),
    "alambre-desnudo":       ("Conductores", "ALAMBRE DESNUDO"),
    "viakon":                ("Conductores", "CONDUCTORES"),
    "cable-argos":           ("Conductores", "CONDUCTORES"),
    "cable-thhw-ls-caja":    ("Conductores", "THW-LS CAJA"),
    "cable-thhw-ls-metro":   ("Conductores", "THW-LS METRO"),
    "conductores-del-norte": ("Conductores", "CONDUCTORES"),

    # ── TUBERÍA ───────────────────────────────────────────────────────────────
    "tuberia":               ("Tubería", "CONDUIT"),
    "poliducto":             ("Tubería", "POLIDUCTO"),
    "condulets":             ("Tubería", "CONDULETS"),
    "codos":                 ("Tubería", "CODOS"),
    "coples":                ("Tubería", "COPLES"),
    "mufas":                 ("Tubería", "MUFAS"),

    # ── ILUMINACIÓN ───────────────────────────────────────────────────────────
    "iluminacion":           ("Iluminación", "ILUMINACIÓN"),
    "focos":                 ("Iluminación", "FOCOS"),
    "lamparas-de-techo":     ("Iluminación", "LÁMPARAS"),
    "luminarias":            ("Iluminación", "LUMINARIAS"),
    "tiras-led":             ("Iluminación", "TIRAS LED"),
    "series-de-luces":       ("Iluminación", "SERIES"),
    "gabinetes":             ("Iluminación", "GABINETES"),
    "reflectores":           ("Iluminación", "REFLECTORES"),

    # ── DISTRIBUCIÓN ─────────────────────────────────────────────────────────
    "distribucion":               ("Distribución", "DISTRIBUCIÓN"),
    "bases-para-medidor":         ("Distribución", "MEDIDORES"),
    "centros-de-carga":           ("Distribución", "CENTROS DE CARGA"),
    "pastillas-termomagneticas":  ("Distribución", "PASTILLAS"),
    "switch-seguridad":           ("Distribución", "SWITCH"),
    "apagadores":                 ("Distribución", "APAGADORES"),
    "clavijas":                   ("Distribución", "CLAVIJAS"),

    # ── HERRAMIENTAS ─────────────────────────────────────────────────────────
    "bricolaje":             ("Herramientas", "BRICOLAJE"),
    "brochas":               ("Herramientas", "BROCHAS"),

    # ── EPP ───────────────────────────────────────────────────────────────────
    # (añadir si se encuentran handles)

    # ── ACCESORIOS ────────────────────────────────────────────────────────────
    "complementos":          ("Accesorios", "COMPLEMENTOS"),
    "cajas":                 ("Accesorios", "CAJAS"),
    "cajas-de-cable":        ("Accesorios", "CAJAS DE CABLE"),
    "cintas":                ("Accesorios", "CINTAS"),
    "abrazaderas":           ("Accesorios", "ABRAZADERAS"),
    "calentador-de-agua":    ("Accesorios", "CALENTADORES"),

    # ── MARCAS (productos adicionales no cubiertos arriba) ────────────────────
    "3m":                    ("Accesorios", "3M"),
    "aksi":                  ("Accesorios", "AKSI"),
    "argos":                 ("Conductores", "ARGOS"),
    "bticino":               ("Distribución", "BTICINO"),
}

# ─── Colores en inglés → español ──────────────────────────────────────────────
COLORES_EN = {
    "black": "Negro", "white": "Blanco", "red": "Rojo",
    "blue": "Azul", "green": "Verde", "yellow": "Amarillo",
    "orange": "Naranja", "gray": "Gris", "grey": "Gris",
    "brown": "Café", "pink": "Rosa", "purple": "Morado",
    "silver": "Plateado", "gold": "Dorado", "natural": "Natural",
}


def slug(texto):
    """Convierte texto a slug URL-safe."""
    texto = unicodedata.normalize("NFD", str(texto).lower())
    texto = "".join(c for c in texto if unicodedata.category(c) != "Mn")
    texto = re.sub(r"[^a-z0-9\s-]", "", texto)
    texto = re.sub(r"[\s_]+", "-", texto.strip())
    return texto[:80]


def strip_html(html):
    """Elimina etiquetas HTML y normaliza espacios."""
    if not html:
        return ""
    texto = re.sub(r"<[^>]+>", " ", html)
    texto = re.sub(r"\s+", " ", texto)
    return texto.strip()


def normalizar_nombre_variante(nombre):
    """Normaliza nombres de variantes (colores, default)."""
    n = nombre.strip()
    lower = n.lower()
    if lower in COLORES_EN:
        return COLORES_EN[lower]
    if lower in ("default title", "default", "único", "unico", "sin variante"):
        return None
    return n


def fetch_json(url, retries=3):
    """Descarga JSON con reintentos."""
    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; ENERMAN-Scraper/1.0)",
        "Accept": "application/json",
    }
    for intento in range(retries):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=20) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            print(f"    HTTP {e.code} en {url} (intento {intento+1})")
        except Exception as e:
            print(f"    Error: {e} (intento {intento+1})")
        time.sleep(1.5 * (intento + 1))
    return None


def fetch_collection(handle):
    """Descarga todos los productos de una colección (paginado)."""
    productos = []
    pagina = 1
    while True:
        url = BASE_URL.format(handle=handle) + f"?limit=250&page={pagina}"
        data = fetch_json(url)
        if not data or not data.get("products"):
            break
        batch = data["products"]
        productos.extend(batch)
        if len(batch) < 250:
            break
        pagina += 1
        time.sleep(0.4)
    return productos


def shopify_to_enerman(sp, categoria, subcategoria):
    """Convierte un producto Shopify al formato ENERMAN Firebase."""
    title = sp.get("title", "").strip()
    vendor = sp.get("vendor", "").strip().upper()
    handle = sp.get("handle", "")

    # ID único: slug de marca + título
    doc_id = slug(f"{vendor}-{title}") if vendor else slug(title)

    # Imágenes (hasta 3)
    imagenes = [img["src"].split("?")[0] for img in sp.get("images", []) if img.get("src")]
    imagen_principal = imagenes[0] if imagenes else ""
    imagen_2 = imagenes[1] if len(imagenes) > 1 else ""
    imagen_3 = imagenes[2] if len(imagenes) > 2 else ""

    # Descripción limpia
    descripcion = strip_html(sp.get("body_html", ""))

    # Tags
    tags_raw = sp.get("tags", [])
    if isinstance(tags_raw, str):
        tags_raw = [t.strip() for t in tags_raw.split(",")]
    tags = [t.lower().strip() for t in tags_raw if t.strip()]

    # Variantes
    sp_variantes = sp.get("variants", [])
    variantes_enerman = []

    for v in sp_variantes:
        # Nombre: combina option1/2/3 ignorando nulos y "Default Title"
        partes = []
        for opt_key in ("option1", "option2", "option3"):
            val = v.get(opt_key, "")
            if val and val.lower() not in ("default title", "default", ""):
                n = normalizar_nombre_variante(val)
                if n:
                    partes.append(n)
        nombre_variante = " / ".join(partes) if partes else None

        precio_raw = v.get("price", "0") or "0"
        try:
            precio = float(precio_raw)
        except ValueError:
            precio = 0.0

        disponible = v.get("available", True)

        variantes_enerman.append({
            "id":         str(v.get("id", "")),
            "nombre":     nombre_variante or title,
            "precio":     round(precio, 2),
            "disponible": disponible,
        })

    # ¿Tiene variantes reales? (más de 1 variante con nombre distinto)
    nombres_unicos = set(v["nombre"] for v in variantes_enerman)
    tiene_variantes = len(variantes_enerman) >= 2 and len(nombres_unicos) >= 2

    if not tiene_variantes:
        # Solo una variante o todas iguales → no mostrar selector
        variantes_enerman = []

    # Precio desde (mínimo)
    precios = [v["precio"] for v in variantes_enerman if v["precio"] > 0]
    if not precios:
        # Intentar tomar de la primera variante directamente
        for v in sp_variantes:
            try:
                p = float(v.get("price", 0) or 0)
                if p > 0:
                    precios.append(p)
                    break
            except ValueError:
                pass

    precio_desde = round(min(precios), 2) if precios else 0

    # Search terms
    search_terms = list(set(filter(None, [
        categoria.lower(),
        subcategoria.lower(),
        vendor.lower(),
        title.lower(),
        *tags[:5],
    ])))

    return {
        "id":               doc_id,
        "title":            title,
        "marca":            vendor,
        "categoria":        categoria,
        "subcategoria":     subcategoria,
        "description":      descripcion,
        "imagen_principal": imagen_principal,
        "imagen_2":         imagen_2,
        "imagen_3":         imagen_3,
        "imagenes":         list(filter(None, [imagen_principal, imagen_2, imagen_3])),
        "precio_desde":     precio_desde,
        "activo":           True,
        "disponible":       True,
        "tiene_variantes":  tiene_variantes,
        "variantes":        variantes_enerman,
        "tags":             tags,
        "search_terms":     search_terms,
        "_fuente":          "surtidor",
        "_handle_origen":   handle,
    }


def main():
    print("=" * 60)
    print("  ENERMAN - Scraper Completo")
    print("  Fuente: surtidorelectrico.com.mx")
    print("=" * 60)

    todos_productos = {}   # doc_id → producto (deduplicado)
    handles_sin_productos = []
    resumen = {}

    total_handles = len(COLECCIONES)
    for i, (handle, (categoria, subcategoria)) in enumerate(COLECCIONES.items(), 1):
        print(f"\n[{i:02d}/{total_handles}] /{handle} → {categoria} / {subcategoria}")
        shopify_prods = fetch_collection(handle)

        if not shopify_prods:
            print(f"    ⚠  Sin productos (handle inválido o colección vacía)")
            handles_sin_productos.append(handle)
            continue

        nuevos = 0
        for sp in shopify_prods:
            prod = shopify_to_enerman(sp, categoria, subcategoria)
            if prod["id"] not in todos_productos:
                todos_productos[prod["id"]] = prod
                nuevos += 1

        resumen[handle] = {"categoria": categoria, "count": len(shopify_prods), "nuevos": nuevos}
        print(f"    ✓  {len(shopify_prods)} productos en Shopify · {nuevos} nuevos para ENERMAN")
        time.sleep(0.5)

    # ── Resultado final ────────────────────────────────────────────────────────
    productos_lista = list(todos_productos.values())

    # Estadísticas
    print("\n" + "=" * 60)
    print("  RESUMEN")
    print("=" * 60)

    por_categoria = {}
    con_precio = 0
    con_variantes = 0
    con_imagen = 0

    for p in productos_lista:
        cat = p["categoria"]
        por_categoria[cat] = por_categoria.get(cat, 0) + 1
        if p["precio_desde"] > 0:
            con_precio += 1
        if p["tiene_variantes"]:
            con_variantes += 1
        if p["imagen_principal"]:
            con_imagen += 1

    print(f"\n  Total productos únicos: {len(productos_lista)}")
    print(f"  Con precio:             {con_precio} ({100*con_precio//max(len(productos_lista),1)}%)")
    print(f"  Con variantes:          {con_variantes} ({100*con_variantes//max(len(productos_lista),1)}%)")
    print(f"  Con imagen:             {con_imagen} ({100*con_imagen//max(len(productos_lista),1)}%)")
    print(f"\n  Por categoría:")
    for cat, n in sorted(por_categoria.items()):
        print(f"    {cat}: {n}")

    if handles_sin_productos:
        print(f"\n  Handles sin productos ({len(handles_sin_productos)}):")
        for h in handles_sin_productos:
            print(f"    - {h}")

    # Guardar
    output = {"productos": productos_lista}
    with open("productos_firebase.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n  ✅ Guardado en productos_firebase.json")
    print(f"  Siguiente: python setup_firebase.py")
    print("=" * 60)


if __name__ == "__main__":
    main()
