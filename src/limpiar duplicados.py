"""
═══════════════════════════════════════════════════════════════════════════════
SCRIPT PARA LIMPIAR PRODUCTOS DUPLICADOS EN FIREBASE
═══════════════════════════════════════════════════════════════════════════════

Este script:
1. Lee todos los productos de Firebase
2. Identifica duplicados por nombre (title)
3. Mantiene el producto con precio (o el primero si ninguno tiene)
4. Elimina los duplicados

REQUISITOS:
pip install firebase-admin --break-system-packages

CONFIGURACIÓN:
1. Descarga tu Service Account Key desde:
   https://console.firebase.google.com/project/enerman-8a7cb/settings/serviceaccounts/adminsdk
2. Guárdalo como 'serviceAccountKey.json' en la misma carpeta
3. Ejecuta: python limpiar_duplicados.py
"""

import firebase_admin
from firebase_admin import credentials, firestore
from collections import defaultdict

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURACIÓN
# ═══════════════════════════════════════════════════════════════════════════════

SERVICE_ACCOUNT_PATH = "serviceAccountKey.json"
COLLECTION_NAME = "productos"
DRY_RUN = True  # Cambiar a False para eliminar realmente

# ═══════════════════════════════════════════════════════════════════════════════
# FUNCIONES
# ═══════════════════════════════════════════════════════════════════════════════

def inicializar_firebase():
    """Inicializa la conexión a Firebase"""
    try:
        cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
        firebase_admin.initialize_app(cred)
        return firestore.client()
    except Exception as e:
        print(f"❌ Error al conectar con Firebase: {e}")
        print("\n📋 Asegúrate de:")
        print("   1. Tener el archivo serviceAccountKey.json")
        print("   2. Descargarlo desde la consola de Firebase")
        print("   3. Colocarlo en la misma carpeta que este script")
        exit(1)

def obtener_productos(db):
    """Obtiene todos los productos de Firestore"""
    print("📦 Obteniendo productos de Firebase...")
    productos = []
    docs = db.collection(COLLECTION_NAME).stream()
    
    for doc in docs:
        data = doc.to_dict()
        data['_doc_id'] = doc.id
        productos.append(data)
    
    print(f"   ✓ Se encontraron {len(productos)} productos")
    return productos

def identificar_duplicados(productos):
    """Agrupa productos por nombre y detecta duplicados"""
    print("\n🔍 Buscando duplicados...")
    
    grupos = defaultdict(list)
    for p in productos:
        nombre = (p.get('title') or '').strip().lower()
        if nombre:
            grupos[nombre].append(p)
    
    duplicados = {k: v for k, v in grupos.items() if len(v) > 1}
    
    total_duplicados = sum(len(v) - 1 for v in duplicados.values())
    print(f"   ✓ Se encontraron {len(duplicados)} productos con duplicados")
    print(f"   ✓ Total de documentos duplicados a eliminar: {total_duplicados}")
    
    return duplicados

def elegir_producto_principal(lista_productos):
    """
    Elige cuál producto mantener de una lista de duplicados.
    Prioridad:
    1. El que tenga precio > 0
    2. El que tenga imagen
    3. El primero de la lista
    """
    # Ordenar por precio (mayor primero) y presencia de imagen
    def score(p):
        precio = float(p.get('precio_desde') or 0)
        tiene_imagen = 1 if p.get('imagen_principal') else 0
        return (precio, tiene_imagen)
    
    ordenados = sorted(lista_productos, key=score, reverse=True)
    return ordenados[0], ordenados[1:]

def limpiar_duplicados(db, duplicados, dry_run=True):
    """Elimina los productos duplicados"""
    if dry_run:
        print("\n🧪 MODO SIMULACIÓN (DRY RUN) - No se eliminará nada")
    else:
        print("\n🗑️ ELIMINANDO DUPLICADOS...")
    
    eliminados = 0
    errores = 0
    
    for nombre, productos in duplicados.items():
        principal, a_eliminar = elegir_producto_principal(productos)
        
        print(f"\n📌 '{nombre}'")
        print(f"   ✓ Mantener: ID={principal['_doc_id']}, precio={principal.get('precio_desde', 0)}")
        
        for dup in a_eliminar:
            doc_id = dup['_doc_id']
            precio = dup.get('precio_desde', 0)
            print(f"   ✗ Eliminar: ID={doc_id}, precio={precio}")
            
            if not dry_run:
                try:
                    db.collection(COLLECTION_NAME).document(doc_id).delete()
                    eliminados += 1
                except Exception as e:
                    print(f"     ❌ Error: {e}")
                    errores += 1
            else:
                eliminados += 1
    
    return eliminados, errores

def mostrar_resumen(total_productos, duplicados, eliminados, errores, dry_run):
    """Muestra el resumen final"""
    print("\n" + "═" * 60)
    print("📊 RESUMEN")
    print("═" * 60)
    print(f"   Productos totales:     {total_productos}")
    print(f"   Grupos con duplicados: {len(duplicados)}")
    print(f"   Documentos a eliminar: {eliminados}")
    
    if not dry_run:
        print(f"   Eliminados con éxito:  {eliminados - errores}")
        print(f"   Errores:               {errores}")
        print(f"\n✅ Limpieza completada")
    else:
        print(f"\n⚠️  Ejecuta con DRY_RUN = False para eliminar realmente")

# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

def main():
    print("═" * 60)
    print("🧹 LIMPIEZA DE PRODUCTOS DUPLICADOS - ENERMAN")
    print("═" * 60)
    
    # Conectar a Firebase
    db = inicializar_firebase()
    
    # Obtener productos
    productos = obtener_productos(db)
    
    if not productos:
        print("❌ No se encontraron productos")
        return
    
    # Identificar duplicados
    duplicados = identificar_duplicados(productos)
    
    if not duplicados:
        print("\n✅ No hay duplicados. ¡Tu base de datos está limpia!")
        return
    
    # Mostrar duplicados encontrados
    print("\n📋 DUPLICADOS ENCONTRADOS:")
    print("-" * 60)
    for nombre, lista in list(duplicados.items())[:10]:  # Mostrar solo 10
        print(f"   • '{nombre}' ({len(lista)} copias)")
    if len(duplicados) > 10:
        print(f"   ... y {len(duplicados) - 10} más")
    
    # Limpiar
    if not DRY_RUN:
        confirmacion = input("\n⚠️  ¿Estás seguro de eliminar los duplicados? (escribe 'SI' para confirmar): ")
        if confirmacion != 'SI':
            print("❌ Operación cancelada")
            return
    
    eliminados, errores = limpiar_duplicados(db, duplicados, DRY_RUN)
    
    # Resumen
    mostrar_resumen(len(productos), duplicados, eliminados, errores, DRY_RUN)

if __name__ == "__main__":
    main()
