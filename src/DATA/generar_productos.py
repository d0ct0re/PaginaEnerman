import pandas as pd
import json

archivo = "src/DATA/enerman_catalogo_master_v4.xlsx"

# Leer hojas
df_productos = pd.read_excel(archivo, sheet_name="Productos")
df_variantes = pd.read_excel(archivo, sheet_name="Variantes")

# Limpiar NaN
df_productos = df_productos.fillna("")
df_variantes = df_variantes.fillna("")

# Convertir a listas de diccionarios
productos = df_productos.to_dict(orient="records")
variantes = df_variantes.to_dict(orient="records")

# Agrupar variantes por producto_id
variantes_por_producto = {}
for variante in variantes:
    producto_id = variante.get("producto_id", "")
    if producto_id not in variantes_por_producto:
        variantes_por_producto[producto_id] = []
    variantes_por_producto[producto_id].append(variante)

# Unir productos con sus variantes
catalogo_final = []
for producto in productos:
    producto_id = producto.get("producto_id", "")
    producto["variantes"] = variantes_por_producto.get(producto_id, [])
    catalogo_final.append(producto)

# Guardar JSON
with open("src/DATA/productos.json", "w", encoding="utf-8") as f:
    json.dump(catalogo_final, f, ensure_ascii=False, indent=2)

print("productos.json generado correctamente")

