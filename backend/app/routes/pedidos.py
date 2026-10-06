from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from app.services import pedido_service
from app.utils.decorators import admin_required

pedidos_bp = Blueprint("pedidos", __name__)


# ==============================
# Cliente autenticado
# ==============================

@pedidos_bp.post("/")
@jwt_required()
def crear_pedido():
    """Crea un pedido desde el carrito del cliente (cliente autenticado)."""
    usuario_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}

    try:
        pedido = pedido_service.crear_pedido(usuario_id, data)
    except LookupError as e:
        return jsonify({"error": str(e)}), 404
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify({
        "message": "Pedido creado correctamente",
        "pedido": pedido.to_dict(),
    }), 201


@pedidos_bp.get("/mis-pedidos")
@jwt_required()
def listar_mis_pedidos():
    """Lista los pedidos del usuario autenticado."""
    usuario_id = int(get_jwt_identity())
    pedidos = pedido_service.listar_pedidos_de_usuario(usuario_id)

    return jsonify({
        "total": len(pedidos),
        "pedidos": [p.to_dict() for p in pedidos],
    }), 200


@pedidos_bp.get("/mis-pedidos/<int:pedido_id>")
@jwt_required()
def obtener_mi_pedido(pedido_id: int):
    """Devuelve un pedido del usuario autenticado."""
    usuario_id = int(get_jwt_identity())
    pedido = pedido_service.obtener_pedido(pedido_id)

    if not pedido or pedido.usuario_id != usuario_id:
        return jsonify({"error": "Pedido no encontrado"}), 404

    return jsonify({"pedido": pedido.to_dict()}), 200


# ==============================
# Admin
# ==============================

@pedidos_bp.get("/admin/todos")
@admin_required
def listar_pedidos_admin():
    """Lista TODOS los pedidos (solo admin), con filtros opcionales."""
    estado = request.args.get("estado", type=str)
    usuario_id = request.args.get("usuario_id", type=int)

    try:
        pedidos = pedido_service.listar_pedidos_admin(estado=estado, usuario_id=usuario_id)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify({
        "total": len(pedidos),
        "pedidos": [p.to_dict() for p in pedidos],
    }), 200


@pedidos_bp.get("/admin/<int:pedido_id>")
@admin_required
def obtener_pedido_admin(pedido_id: int):
    """Devuelve un pedido por ID (solo admin)."""
    pedido = pedido_service.obtener_pedido(pedido_id)
    if not pedido:
        return jsonify({"error": "Pedido no encontrado"}), 404
    return jsonify({"pedido": pedido.to_dict()}), 200


@pedidos_bp.put("/admin/<int:pedido_id>/estado")
@admin_required
def cambiar_estado_pedido(pedido_id: int):
    """Cambia el estado de un pedido (solo admin)."""
    data = request.get_json(silent=True) or {}
    nuevo_estado = data.get("estado", "").strip()

    try:
        pedido = pedido_service.cambiar_estado(pedido_id, nuevo_estado)
    except LookupError as e:
        return jsonify({"error": str(e)}), 404
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify({
        "message": "Estado actualizado correctamente",
        "pedido": pedido.to_dict(),
    }), 200