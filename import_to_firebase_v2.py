# -*- coding: utf-8 -*-
import json
import time
from datetime import datetime, timezone
import firebase_admin
from firebase_admin import credentials, firestore

SERVICE_ACCOUNT_KEY = "serviceAccountKey.json"
INPUT_FILE          = "productos_firebase.json"
BATCH_SIZE          = 400

def init_firebase():
    cred = credentials.Certificate(SERVICE_ACCOUNT_KEY)
    firebase_admin.initialize_app(cred)
    return firestore.client()

def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def upload_products(db, productos):
    total = len(productos)
    uploaded = 0
    print(f"\nSubiendo {total} productos a Firestore...")
    for i in range(0, total, BATCH_SIZE):
        batch = db.batch()
        chunk = productos[i:i + BATCH_SIZE]
        for product in chunk:
            doc_ref = db.collection("productos").document(product["id"])
            batch.set(doc_ref, product, merge=True)
        try:
            batch.commit()
            uploaded += len(chunk)
            print(f"  OK: {uploaded}/{total} productos subidos")
        except Exception as e:
            print(f"  ERROR: {e}")
        time.sleep(0.3)
    return uploaded

def build_search_index(db, productos):
    print(f"\nConstruyendo indice de busqueda...")
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
    print(f"  -> {len(terms)} terminos unicos")
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
        try:
            batch.commit()
        except Exception as e:
            print(f"  ERROR indice: {e}")
        time.sleep(0.3)
    print(f"  OK: Indice construido")

def main():
    print("=" * 50)
    print("  ENERMAN - Importar productos a Firebase")
    print("=" * 50)
    data = load_json(INPUT_FILE)
    productos = data.get("productos", [])
    print(f"\n{len(productos)} productos cargados")
    print("\nConectando a Firebase...")
    db = init_firebase()
    print("  OK: Conectado")
    upload_products(db, productos)
    build_search_index(db, productos)
    print("\n" + "=" * 50)
    print("  COMPLETADO")
    print("=" * 50)

if __name__ == "__main__":
    main()
