from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from app.services.auth_service import crear_usuario, buscar_por_email
from app.models.usuario import Usuario

from app.utils.decorators import admin_required

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/registro")
def registro():
    data = request.get_json(silent=True) or {}

    nombre = data.get("nombre", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not nombre or not email or not password:
        return jsonify({"error": "Nombre, email y contraseña son obligatorios"}), 400

    try:
        usuario = crear_usuario(nombre=nombre, email=email, password=password)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify({
        "message": "Usuario registrado correctamente",
        "usuario": usuario.to_dict(),
    }), 201


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email y contraseña son obligatorios"}), 400

    usuario = buscar_por_email(email)

    if not usuario or not usuario.check_password(password):
        return jsonify({"error": "Credenciales inválidas"}), 401

    if not usuario.activo:
        return jsonify({"error": "Usuario desactivado"}), 403

    token = create_access_token(
        identity=str(usuario.id),
        additional_claims={"rol": usuario.rol, "email": usuario.email},
    )

    return jsonify({
        "message": "Login exitoso",
        "token": token,
        "usuario": usuario.to_dict(),
    }), 200


@auth_bp.get("/perfil")
@jwt_required()
def perfil():
    usuario_id = int(get_jwt_identity())
    usuario = Usuario.query.get(usuario_id)

    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404

    return jsonify({"usuario": usuario.to_dict()}), 200

@auth_bp.get("/solo-admin")
@admin_required
def solo_admin():
    return jsonify({"message": "Bienvenido, admin. Tienes acceso."}), 200