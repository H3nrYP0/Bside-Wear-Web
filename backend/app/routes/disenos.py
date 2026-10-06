from flask import Blueprint, jsonify, request

from app.services import diseno_service, cloudinary_service
from app.utils.decorators import admin_required

disenos_bp = Blueprint("disenos", __name__)


# ==============================
# Público
# ==============================

@disenos_bp.get("/")
def listar_disenos():
    """Lista los diseños activos disponibles para personalizar (público)."""
    search = request.args.get("search", type=str)
    disenos = diseno_service.listar_disenos(solo_activos=True, search=search)

    return jsonify({
        "total": len(disenos),
        "disenos": [d.to_dict() for d in disenos],
    }), 200


@disenos_bp.get("/<int:diseno_id>")
def obtener_diseno(diseno_id: int):
    """Devuelve un diseño activo por ID (público)."""
    diseno = diseno_service.obtener_diseno(diseno_id, solo_activos=True)
    if not diseno:
        return jsonify({"error": "Diseño no encontrado"}), 404
    return jsonify({"diseno": diseno.to_dict()}), 200


# ==============================
# Admin
# ==============================

@disenos_bp.get("/admin/todos")
@admin_required
def listar_disenos_admin():
    """Lista TODOS los diseños, activos e inactivos (solo admin)."""
    search = request.args.get("search", type=str)
    disenos = diseno_service.listar_disenos(solo_activos=False, search=search)

    return jsonify({
        "total": len(disenos),
        "disenos": [d.to_dict() for d in disenos],
    }), 200


@disenos_bp.post("/")
@admin_required
def crear_diseno():
    """
    Crea un diseño nuevo. Recibe multipart/form-data con:
    - archivo (obligatorio): imagen PNG/JPG
    - nombre (obligatorio)
    - descripcion (opcional)
    """
    if "archivo" not in request.files:
        return jsonify({"error": "No se envió ningún archivo (campo 'archivo')"}), 400

    file = request.files["archivo"]
    nombre = request.form.get("nombre", "").strip()
    descripcion = request.form.get("descripcion", "").strip() or None

    if not nombre:
        return jsonify({"error": "El nombre es obligatorio"}), 400

    # Subir a Cloudinary
    try:
        resultado = cloudinary_service.subir_imagen(file, carpeta="bside/disenos")
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    # Guardar en BD
    try:
        diseno = diseno_service.crear_diseno(
            nombre=nombre,
            url=resultado["url"],
            public_id=resultado["public_id"],
            descripcion=descripcion,
        )
    except ValueError as e:
        # Si falla al guardar, eliminar de Cloudinary
        cloudinary_service.eliminar_imagen(resultado["public_id"])
        return jsonify({"error": str(e)}), 400

    return jsonify({
        "message": "Diseño creado correctamente",
        "diseno": diseno.to_dict(),
    }), 201


@disenos_bp.put("/<int:diseno_id>")
@admin_required
def actualizar_diseno(diseno_id: int):
    """Edita un diseño existente (solo admin)."""
    data = request.get_json(silent=True) or {}

    try:
        diseno = diseno_service.actualizar_diseno(diseno_id, data)
    except LookupError as e:
        return jsonify({"error": str(e)}), 404
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify({
        "message": "Diseño actualizado correctamente",
        "diseno": diseno.to_dict(),
    }), 200


@disenos_bp.delete("/<int:diseno_id>")
@admin_required
def eliminar_diseno(diseno_id: int):
    """Elimina un diseño de la BD y de Cloudinary (solo admin)."""
    try:
        public_id = diseno_service.eliminar_diseno(diseno_id)
    except LookupError as e:
        return jsonify({"error": str(e)}), 404

    # Eliminar de Cloudinary (si falla, no es crítico)
    cloudinary_service.eliminar_imagen(public_id)

    return jsonify({"message": "Diseño eliminado correctamente"}), 200