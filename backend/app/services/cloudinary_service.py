import cloudinary
import cloudinary.uploader
import cloudinary.api
from cloudinary.exceptions import Error as CloudinaryError

from flask import current_app


def _configurar():
    """Configura Cloudinary con las credenciales del .env."""
    cloudinary.config(
        cloud_name=current_app.config["CLOUDINARY_CLOUD_NAME"],
        api_key=current_app.config["CLOUDINARY_API_KEY"],
        api_secret=current_app.config["CLOUDINARY_API_SECRET"],
        secure=True,
    )


def subir_imagen(file, carpeta: str = "bside/productos") -> dict:
    """
    Sube una imagen a Cloudinary.

    Args:
        file: objeto file de Flask (request.files['archivo'])
        carpeta: carpeta destino en Cloudinary

    Returns:
        dict con 'url' y 'public_id'

    Raises:
        ValueError: si el archivo es inválido o la subida falla
    """
    if not file or not file.filename:
        raise ValueError("No se recibió ningún archivo")

    # Validar extensión
    extensiones_validas = {"jpg", "jpeg", "png", "webp", "gif"}
    if "." not in file.filename:
        raise ValueError("El archivo no tiene extensión")

    extension = file.filename.rsplit(".", 1)[1].lower()
    if extension not in extensiones_validas:
        raise ValueError(
            f"Formato no permitido. Usa: {', '.join(sorted(extensiones_validas))}"
        )

    _configurar()

    try:
        resultado = cloudinary.uploader.upload(
            file,
            folder=carpeta,
            resource_type="image",
        )
    except CloudinaryError as e:
        raise ValueError(f"Error al subir la imagen a Cloudinary: {str(e)}")

    return {
        "url": resultado.get("secure_url"),
        "public_id": resultado.get("public_id"),
    }


def eliminar_imagen(public_id: str) -> bool:
    """
    Elimina una imagen de Cloudinary por su public_id.

    Returns:
        True si se eliminó (o ya no existía), False si falló.
    """
    if not public_id:
        return False

    _configurar()

    try:
        resultado = cloudinary.uploader.destroy(public_id, resource_type="image")
        return resultado.get("result") in ("ok", "not found")
    except CloudinaryError:
        return False