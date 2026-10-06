from flask import Blueprint, jsonify, request

from app.services import imagen_service, cloudinary_service
from app.utils.decorators import admin_required

imagenes_bp = Blueprint("imagenes", __name__)


# ==============================
# Público
# ==============================

@imagenes_bp.get("/producto/<int:producto_id>")
def listar_imagenes_de_producto(producto_id: int):
    """Lista las imágenes de un producto (público)."""
    try:
        imagenes = imagen_service.listar_imagenes_de_producto(producto_id)
    except LookupError as e:
        return jsonify({"error": str(e)}), 404

    return jsonify({
        "total": len(imagenes),
        "imagenes": [img.to_dict() for img in imagenes],
    }), 200


# ==============================
# Admin
# ==============================

@imagenes_bp.post("/producto/<int:producto_id>")
@admin_required
def subir_imagen(producto_id: int):
    """
    Sube una imagen a Cloudinary y la asocia a un producto (solo admin).
    Recibe multipart/form-data con el campo 'archivo'.
    Acepta campo opcional 'orden'.
    """
    # Verificar que viene un archivo
    if "archivo" not in request.files:
        return jsonify({"error": "No se envió ningún archivo (campo 'archivo')"}), 400

    file = request.files["archivo"]

    # Subir a Cloudinary
    try:
        resultado = cloudinary_service.subir_imagen(file)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    # Guardar en la BD
    try:
        orden = request.form.get("orden", type=int)
        imagen = imagen_service.crear_imagen(
            producto_id=producto_id,
            url=resultado["url"],
            public_id=resultado["public_id"],
            orden=orden,
        )
    except LookupError as e:
        # Si el producto no existe, borrar la imagen recién subida de Cloudinary
        cloudinary_service.eliminar_imagen(resultado["public_id"])
        return jsonify({"error": str(e)}), 404
    except ValueError as e:
        cloudinary_service.eliminar_imagen(resultado["public_id"])
        return jsonify({"error": str(e)}), 400

    return jsonify({
        "message": "Imagen subida y asociada correctamente",
        "imagen": imagen.to_dict(),
    }), 201


@imagenes_bp.put("/<int:imagen_id>/orden")
@admin_required
def actualizar_orden(imagen_id: int):
    """Cambia el orden de una imagen (solo admin)."""
    data = request.get_json(silent=True) or {}

    try:
        imagen = imagen_service.actualizar_orden(imagen_id, data.get("orden"))
    except LookupError as e:
        return jsonify({"error": str(e)}), 404
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify({
        "message": "Orden actualizado correctamente",
        "imagen": imagen.to_dict(),
    }), 200


@imagenes_bp.delete("/<int:imagen_id>")
@admin_required
def eliminar_imagen(imagen_id: int):
    """
    Elimina una imagen de la BD y de Cloudinary (solo admin).
    """
    imagen = imagen_service.obtener_imagen(imagen_id)
    if not imagen:
        return jsonify({"error": "Imagen no encontrada"}), 404

    public_id = imagen.public_id

    # Borrar de la BD primero
    try:
        imagen_service.eliminar_imagen(imagen_id)
    except LookupError as e:
        return jsonify({"error": str(e)}), 404

    # Borrar de Cloudinary (si falla, no es crítico)
    cloudinary_service.eliminar_imagen(public_id)

    return jsonify({"message": "Imagen eliminada correctamente"}), 200