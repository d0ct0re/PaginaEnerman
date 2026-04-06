# -*- coding: utf-8 -*-
"""
setup_firebase.py
=================
Limpia Conductores + Tubería de Firestore e importa los nuevos productos
desde productos_firebase.json con variantes y precios correctos.

Uso:
    python setup_firebase.py
"""

import json
import time
from datetime import datetime, timezone
import firebase_admin
from firebase_admin import credentials, firestore

SERVICE_ACCOUNT_KEY = "serviceAccountKey.json"
INPUT_FILE          = "productos_firebase.json"
CATEGORIAS_LIMPIAR  = ["Conductores", "Tubería", "Iluminación", "Accesorios", "Distribución", "Herramientas", "EPP"]
BATCH_SIZE          = 400


def init_firebase():
    cred = credentials.Certificate(SERVICE_ACCOUNT_KEY)
    firebase_admin.initialize_app(cred)
    return firestore.client()


def limpiar_categorias(db):
    """Elimina todos los productos de las categorías especificadas."""
    eliminados = 0
    for cat in CATEGORIAS_LIMPIAR:
        print(f"\n  Limpiando: {cat}")
        docs = list(db.collection("productos").where("categoria", "==", cat).stream())
        print(f"    Encontrados: {len(docs)} documentos")
        for i in range(0, len(docs), 500):
            batch = db.batch()
            for d in docs[i:i + 500]:
                batch.delete(d.reference)
            batch.commit()
            eliminados += len(docs[i:i + 500])
            time.sleep(0.2)
        print(f"    Eliminados: {len(docs)}")
    return eliminados


def upload_products(db, productos):
    total = len(productos)
    uploaded = 0
    for i in range(0, total, BATCH_SIZE):
        batch = db.batch()
        chunk = productos[i:i + BATCH_SIZE]
        for product in chunk:
            doc_ref = db.collection("productos").document(product["id"])
            batch.set(doc_ref, product, merge=True)
        batch.commit()
        uploaded += len(chunk)
        print(f"    {uploaded}/{total} subidos")
        time.sleep(0.3)
    return uploaded


def build_search_index(db, productos):
    index = {}
    for product in productos:
        pid = product["id"]
        for term in product.get("search_terms", []):
            t = term.strip().lower()
            if len(t) < 2:
                continue
            if t not in index:
                index[t] = []
            if pid not in index[t]:
                index[t].append(pid)
    terms = list(index.items())
    print(f"    {len(terms)} términos únicos")
    for i in range(0, len(terms), BATCH_SIZE):
        batch = db.batch()
        for term, ids in terms[i:i + BATCH_SIZE]:
            safe = term.replace("/", "_").replace(".", "_")[:100]
            ref = db.collection("search_index").document(safe)
            batch.set(ref, {
                "term": term,
                "product_ids": ids,
                "count": len(ids),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }, merge=True)
        batch.commit()
        time.sleep(0.3)


def main():
    print("=" * 55)
    print("  ENERMAN - Setup Firebase")
    print("  Limpia + Importa Conductores y Tuberia")
    print("=" * 55)

    # Cargar JSON
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    productos = data.get("productos", [])

    por_cat = {}
    for p in productos:
        c = p.get("categoria", "?")
        por_cat[c] = por_cat.get(c, 0) + 1

    con_variantes = sum(1 for p in productos if p.get("tiene_variantes"))

    print(f"\n  Productos en JSON: {len(productos)}")
    for cat, n in sorted(por_cat.items()):
        print(f"    {cat}: {n}")
    print(f"  Con variantes: {con_variantes}")

    print("\n  Conectando a Firebase...")
    db = init_firebase()
    print("  OK")

    # 1. Limpiar categorias antiguas
    print("\n[1/3] Limpiando categorias antiguas...")
    eliminados = limpiar_categorias(db)
    print(f"  OK: {eliminados} documentos eliminados")

    # 2. Importar nuevos productos
    print("\n[2/3] Importando nuevos productos...")
    subidos = upload_products(db, productos)
    print(f"  OK: {subidos} productos subidos")

    # 3. Reconstruir indice de busqueda
    print("\n[3/3] Reconstruyendo indice de busqueda...")
    build_search_index(db, productos)
    print("  OK")

    print("\n" + "=" * 55)
    print(f"  COMPLETADO")
    print(f"  Eliminados: {eliminados}  |  Importados: {subidos}")
    print(f"  Siguiente: abre el catalogo y verifica")
    print("=" * 55)


if __name__ == "__main__":
    main()
