from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt


def admin_required(fn):
    """Protege una ruta para que solo admins autenticados puedan acceder."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        claims = get_jwt()
        if claims.get("rol") != "admin":
            return jsonify({"error": "Acceso denegado: se requiere rol admin"}), 403
        return fn(*args, **kwargs)
    return wrapper