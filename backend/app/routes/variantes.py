from flask import Blueprint, jsonify, request

from app.services import variante_service
from app.utils.decorators import admin_required

variantes_bp = Blueprint("variantes", __name__)


# ==============================
# Público
# ==============================

@variantes_bp.get("/producto/<int:producto_id>")
def listar_variantes_de_producto(producto_id: int):
    """Lista las variantes activas de un producto (público)."""
    try:
        variantes = variante_service.listar_variantes_de_producto(producto_id, solo_activas=True)
    except LookupError as e:
        return jsonify({"error": str(e)}), 404

    return jsonify({
        "total": len(variantes),
        "variantes": [v.to_dict() for v in variantes],
    }), 200


# ==============================
# Admin
# ==============================

@variantes_bp.get("/producto/<int:producto_id>/admin")
@admin_required
def listar_variantes_admin(producto_id: int):
    """Lista todas las variantes (activas e inactivas) de un producto (solo admin)."""
    try:
        variantes = variante_service.listar_variantes_de_producto(producto_id, solo_activas=False)
    except LookupError as e:
        return jsonify({"error": str(e)}), 404

    return jsonify({
        "total": len(variantes),
        "variantes": [v.to_dict() for v in variantes],
    }), 200


@variantes_bp.post("/producto/<int:producto_id>")
@admin_required
def crear_variante(producto_id: int):
    """Crea una variante nueva para un producto (solo admin)."""
    data = request.get_json(silent=True) or {}

    try:
        variante = variante_service.crear_variante(producto_id, data)
    except LookupError as e:
        return jsonify({"error": str(e)}), 404
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify({
        "message": "Variante creada correctamente",
        "variante": variante.to_dict(),
    }), 201


@variantes_bp.put("/<int:variante_id>")
@admin_required
def actualizar_variante(variante_id: int):
    """Edita una variante existente (solo admin)."""
    data = request.get_json(silent=True) or {}

    try:
        variante = variante_service.actualizar_variante(variante_id, data)
    except LookupError as e:
        return jsonify({"error": str(e)}), 404
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify({
        "message": "Variante actualizada correctamente",
        "variante": variante.to_dict(),
    }), 200


@variantes_bp.delete("/<int:variante_id>")
@admin_required
def eliminar_variante(variante_id: int):
    """Elimina una variante (solo si no es la última del producto)."""
    try:
        variante_service.eliminar_variante(variante_id)
    except LookupError as e:
        return jsonify({"error": str(e)}), 404
    except ValueError as e:
        return jsonify({"error": str(e)}), 409

    return jsonify({"message": "Variante eliminada correctamente"}), 200