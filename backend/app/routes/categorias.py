from flask import Blueprint, jsonify, request

from app.services import categoria_service
from app.utils.decorators import admin_required

categorias_bp = Blueprint("categorias", __name__)


# ==============================
# Público
# ==============================

@categorias_bp.get("/")
def listar_categorias():
    """Lista todas las categorías activas (público)."""
    categorias = categoria_service.listar_categorias(solo_activas=True)
    return jsonify({
        "total": len(categorias),
        "categorias": [c.to_dict() for c in categorias],
    }), 200


@categorias_bp.get("/<int:categoria_id>")
def obtener_categoria(categoria_id: int):
    """Devuelve una categoría por ID (público)."""
    categoria = categoria_service.obtener_categoria(categoria_id)
    if not categoria or not categoria.estado:
        return jsonify({"error": "Categoría no encontrada"}), 404
    return jsonify({"categoria": categoria.to_dict()}), 200


# ==============================
# Admin
# ==============================

@categorias_bp.get("/admin/todas")
@admin_required
def listar_todas_admin():
    """Lista TODAS las categorías, activas e inactivas (solo admin)."""
    categorias = categoria_service.listar_categorias(solo_activas=False)
    return jsonify({
        "total": len(categorias),
        "categorias": [c.to_dict() for c in categorias],
    }), 200


@categorias_bp.post("/")
@admin_required
def crear_categoria():
    """Crea una categoría nueva (solo admin)."""
    data = request.get_json(silent=True) or {}

    try:
        categoria = categoria_service.crear_categoria(
            nombre=data.get("nombre", ""),
            descripcion=data.get("descripcion"),
        )
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify({
        "message": "Categoría creada correctamente",
        "categoria": categoria.to_dict(),
    }), 201


@categorias_bp.put("/<int:categoria_id>")
@admin_required
def actualizar_categoria(categoria_id: int):
    """Edita una categoría existente (solo admin)."""
    data = request.get_json(silent=True) or {}

    try:
        categoria = categoria_service.actualizar_categoria(categoria_id, data)
    except LookupError as e:
        return jsonify({"error": str(e)}), 404
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify({
        "message": "Categoría actualizada correctamente",
        "categoria": categoria.to_dict(),
    }), 200


@categorias_bp.delete("/<int:categoria_id>")
@admin_required
def eliminar_categoria(categoria_id: int):
    """Elimina una categoría (solo si no tiene productos asociados)."""
    try:
        categoria_service.eliminar_categoria(categoria_id)
    except LookupError as e:
        return jsonify({"error": str(e)}), 404
    except ValueError as e:
        return jsonify({"error": str(e)}), 409

    return jsonify({"message": "Categoría eliminada correctamente"}), 200