from flask import Blueprint, jsonify

from app.services import dashboard_service
from app.utils.decorators import admin_required

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.get("/resumen")
@admin_required
def resumen():
    """Resumen general del sistema (solo admin)."""
    return jsonify(dashboard_service.resumen_general()), 200