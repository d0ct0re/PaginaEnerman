"""
scraper_viakon.py
=================
Extrae todos los productos de la marca VIAKON desde surtidorelectrico.com.mx
usando la API pública JSON de Shopify (sin autenticación requerida).

Genera: viakon_products.json

Uso:
    pip install requests
    python scraper_viakon.py
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "https://www.surtidorelectrico.com.mx"

# Colecciones de VIAKON conocidas en el surtidor
# Si descubres más, agrégalas aquí
VIAKON_COLLECTIONS = [
    "viakon",              # Colección principal de marca
    "cable-thhw-ls",       # Cable THW-2-LS / THHW-LS
    "cables-duplex",       # Cable Dúplex
    "cable-desnudo",       # Cable desnudo
    "alambre-desnudo",     # Alambre desnudo
    "cables-uso-rudo",     # Cable uso rudo
]

# Mapeo de sinónimos para el buscador de ENERMAN
SYNONYMS = {
    "conductor":    ["cable", "conductor", "thw", "thhw", "alambre", "viakon", "conductor eléctrico"],
    "tubería":      ["tuberia", "conduit", "tubo", "tuberia conduit", "poliducto"],
    "iluminación":  ["iluminacion", "foco", "led", "luminaria", "lámpara", "luz"],
    "distribución": ["distribucion", "centro de carga", "tablero", "pastilla", "breaker", "interruptor"],
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json",
}


def fetch_collection_products(collection_handle: str) -> list:
    """
    Obtiene todos los productos de una colección Shopify paginando de 250 en 250.
    """
    all_products = []
    page = 1

    while True:
        url = f"{BASE_URL}/collections/{collection_handle}/products.json?limit=250&page={page}"
        try:
            response = requests.get(url, headers=HEADERS, timeout=15)
            if response.status_code != 200:
                print(f"  ⚠️  {collection_handle} página {page}: status {response.status_code}")
                break

            data = response.json()
            products = data.get("products", [])

            if not products:
                break

            all_products.extend(products)
            print(f"  ✅ {collection_handle} — página {page}: {len(products)} productos")

            if len(products) < 250:
                break  # Última página

            page += 1
            time.sleep(0.5)  # Respetar el servidor

        except requests.RequestException as e:
            print(f"  ❌ Error en {collection_handle}: {e}")
            break

    return all_products


def parse_product(raw: dict, source_collection: str) -> dict:
    """
    Transforma un producto crudo de Shopify al formato ENERMAN para Firebase.
    """
    variants = []
    for v in raw.get("variants", []):
        variant = {
            "id":              str(v.get("id", "")),
            "title":           v.get("title", ""),
            "sku":             v.get("sku", ""),
            "price":           float(v.get("price", 0)),
            "compare_at_price": float(v.get("compare_at_price") or 0),
            "available":       v.get("available", False),
            "inventory_quantity": v.get("inventory_quantity", 0),
            "weight":          v.get("weight", 0),
            "weight_unit":     v.get("weight_unit", ""),
            "option1":         v.get("option1", ""),   # Usualmente calibre
            "option2":         v.get("option2", ""),   # Usualmente color
            "option3":         v.get("option3", ""),
        }
        variants.append(variant)

    images = [img.get("src", "") for img in raw.get("images", [])]

    # Extraer opciones (calibre, color, etc.)
    options = {}
    for opt in raw.get("options", []):
        options[opt.get("name", "").lower()] = opt.get("values", [])

    # Precio mínimo de todas las variantes
    prices = [v["price"] for v in variants if v["price"] > 0]
    min_price = min(prices) if prices else 0

    product = {
        # Identificadores
        "id":               str(raw.get("id", "")),
        "handle":           raw.get("handle", ""),
        "source_url":       f"{BASE_URL}/products/{raw.get('handle', '')}",
        "source_collection": source_collection,

        # Información principal
        "title":            raw.get("title", ""),
        "vendor":           raw.get("vendor", ""),  # Marca (VIAKON)
        "product_type":     raw.get("product_type", ""),
        "tags":             raw.get("tags", []),
        "description":      raw.get("body_html", ""),

        # Categorización ENERMAN
        "categoria":        map_category(raw.get("product_type", ""), source_collection),
        "marca":            raw.get("vendor", "").upper(),
        "subcategoria":     raw.get("product_type", ""),

        # Precios
        "precio_desde":     min_price,
        "moneda":           "MXN",

        # Variantes y opciones
        "variants":         variants,
        "opciones":         options,

        # Imágenes
        "imagen_principal": images[0] if images else "",
        "imagenes":         images,

        # Metadatos
        "publicado":        raw.get("published_at", ""),
        "actualizado":      raw.get("updated_at", ""),
        "scraped_at":       datetime.utcnow().isoformat() + "Z",
        "activo":           True,

        # Búsqueda (términos adicionales para el buscador de ENERMAN)
        "search_terms":     build_search_terms(raw),
    }

    return product


def map_category(product_type: str, collection: str) -> str:
    """
    Mapea el tipo de producto del surtidor a las categorías de ENERMAN.
    """
    pt = product_type.lower()
    col = collection.lower()

    if "conductor" in pt or "cable" in pt or "alambre" in pt:
        return "Conductores"
    if "tuberia" in col or "tubo" in pt or "conduit" in pt:
        return "Tubería"
    if "iluminacion" in col or "foco" in pt or "led" in pt:
        return "Iluminación"
    if "distribucion" in col or "centro" in pt or "pastilla" in pt:
        return "Distribución"
    return "Accesorios"


def build_search_terms(raw: dict) -> list:
    """
    Construye lista de términos de búsqueda incluyendo sinónimos.
    """
    terms = set()

    title = raw.get("title", "").lower()
    vendor = raw.get("vendor", "").lower()
    product_type = raw.get("product_type", "").lower()
    tags = [t.lower() for t in raw.get("tags", [])]

    # Agregar palabras del título
    for word in title.split():
        if len(word) > 2:
            terms.add(word)

    terms.add(vendor)
    terms.add(product_type)
    terms.update(tags)

    # Agregar sinónimos según categoría
    for canonical, synonyms_list in SYNONYMS.items():
        if any(s in title or s in product_type for s in synonyms_list):
            terms.update(synonyms_list)
            terms.add(canonical)

    # Términos específicos de cable
    if "thw" in title or "thhw" in title:
        terms.update(["thw", "thhw", "cable thw", "cable thhw", "conductor thw",
                       "thw-ls", "thhw-ls", "thw2", "cable electrico"])
    if "duplex" in title:
        terms.update(["duplex", "cable duplex", "stp", "cable stp"])
    if "uso rudo" in title:
        terms.update(["uso rudo", "cable uso rudo", "multiconductor"])

    # Calibres (si aparecen en variantes)
    for v in raw.get("variants", []):
        for opt in ["option1", "option2", "option3"]:
            val = v.get(opt, "")
            if val:
                terms.add(val.lower())

    return sorted(list(terms))


def deduplicate(products: list) -> list:
    """
    Elimina duplicados por ID de producto.
    """
    seen = set()
    unique = []
    for p in products:
        if p["id"] not in seen:
            seen.add(p["id"])
            unique.append(p)
    return unique


def main():
    print("=" * 60)
    print("  ENERMAN — Scraper VIAKON")
    print(f"  Fuente: {BASE_URL}")
    print("=" * 60)

    all_raw = []

    for collection in VIAKON_COLLECTIONS:
        print(f"\n📦 Colección: {collection}")
        products = fetch_collection_products(collection)
        # Filtrar solo VIAKON por si la colección tiene otras marcas
        viakon_only = [p for p in products if "viakon" in p.get("vendor", "").lower()]
        print(f"   → {len(viakon_only)} productos VIAKON encontrados")
        all_raw.extend(viakon_only)
        time.sleep(1)

    print(f"\n🔄 Total bruto: {len(all_raw)} productos (con posibles duplicados)")

    # Parsear y deduplicar
    parsed = [parse_product(p, "viakon") for p in all_raw]
    unique = deduplicate(parsed)

    print(f"✅ Total único: {len(unique)} productos VIAKON")

    # Guardar JSON
    output = {
        "meta": {
            "fuente":       BASE_URL,
            "marca":        "VIAKON",
            "total":        len(unique),
            "generado_en":  datetime.utcnow().isoformat() + "Z",
        },
        "productos": unique,
    }

    with open("viakon_products.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n💾 Guardado en: viakon_products.json")
    print("=" * 60)
    print("  Siguiente paso: ejecuta import_to_firebase.py")
    print("=" * 60)


if __name__ == "__main__":
    main()