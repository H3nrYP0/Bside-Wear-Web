from flask import Blueprint, jsonify, request

from app.services import producto_service
from app.utils.decorators import admin_required

productos_bp = Blueprint("productos", __name__)


# ==============================
# Público
# ==============================

@productos_bp.get("/")
def listar_productos():
    """Lista productos activos con filtros y paginación (público)."""
    try:
        items, total, pages = producto_service.listar_productos_publicos(
            categoria_id=request.args.get("categoria_id", type=int),
            tipo=request.args.get("tipo", type=str),
            search=request.args.get("search", type=str),
            min_precio=request.args.get("min_precio", type=float),
            max_precio=request.args.get("max_precio", type=float),
            solo_ofertas=request.args.get("solo_ofertas", "false").lower() == "true",
            page=request.args.get("page", 1, type=int),
            per_page=min(request.args.get("per_page", 12, type=int), 50),
        )
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify({
        "total": total,
        "pages": pages,
        "productos": [p.to_dict_publico() for p in items],
    }), 200


@productos_bp.get("/<int:producto_id>")
def obtener_producto(producto_id: int):
    """Devuelve un producto activo por ID (público)."""
    producto = producto_service.obtener_producto(producto_id, solo_activos=True)
    if not producto:
        return jsonify({"error": "Producto no encontrado"}), 404
    return jsonify({"producto": producto.to_dict_publico()}), 200


# ==============================
# Admin
# ==============================

@productos_bp.get("/admin/todos")
@admin_required
def listar_productos_admin():
    """Lista TODOS los productos, activos e inactivos (solo admin)."""
    estado_param = request.args.get("estado", type=str)
    estado = None
    if estado_param is not None:
        if estado_param.lower() == "true":
            estado = True
        elif estado_param.lower() == "false":
            estado = False

    try:
        items, total, pages = producto_service.listar_productos_admin(
            categoria_id=request.args.get("categoria_id", type=int),
            tipo=request.args.get("tipo", type=str),
            search=request.args.get("search", type=str),
            estado=estado,
            page=request.args.get("page", 1, type=int),
            per_page=min(request.args.get("per_page", 20, type=int), 100),
        )
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify({
        "total": total,
        "pages": pages,
        "productos": [p.to_dict_admin() for p in items],
    }), 200


@productos_bp.get("/admin/<int:producto_id>")
@admin_required
def obtener_producto_admin(producto_id: int):
    """Devuelve un producto por ID, incluso si está inactivo (solo admin)."""
    producto = producto_service.obtener_producto(producto_id, solo_activos=False)
    if not producto:
        return jsonify({"error": "Producto no encontrado"}), 404
    return jsonify({"producto": producto.to_dict_admin()}), 200


@productos_bp.post("/")
@admin_required
def crear_producto():
    """Crea un producto nuevo (solo admin)."""
    data = request.get_json(silent=True) or {}

    try:
        producto = producto_service.crear_producto(data)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify({
        "message": "Producto creado correctamente",
        "producto": producto.to_dict_admin(),
    }), 201


@productos_bp.put("/<int:producto_id>")
@admin_required
def actualizar_producto(producto_id: int):
    """Edita un producto existente (solo admin)."""
    data = request.get_json(silent=True) or {}

    try:
        producto = producto_service.actualizar_producto(producto_id, data)
    except LookupError as e:
        return jsonify({"error": str(e)}), 404
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify({
        "message": "Producto actualizado correctamente",
        "producto": producto.to_dict_admin(),
    }), 200


@productos_bp.delete("/<int:producto_id>")
@admin_required
def eliminar_producto(producto_id: int):
    """Elimina un producto (solo si no tiene variantes ni imágenes)."""
    try:
        producto_service.eliminar_producto(producto_id)
    except LookupError as e:
        return jsonify({"error": str(e)}), 404
    except ValueError as e:
        return jsonify({"error": str(e)}), 409

    return jsonify({"message": "Producto eliminado correctamente"}), 200