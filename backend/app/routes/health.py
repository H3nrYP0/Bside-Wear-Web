from flask import Blueprint, jsonify

health_bp = Blueprint("health", __name__)


@health_bp.get("/health")
def health_check():
    return jsonify({
        "status": "ok",
        "service": "Bside Wear Web API",
        "message": "Backend funcionando correctamente"
    }), 200