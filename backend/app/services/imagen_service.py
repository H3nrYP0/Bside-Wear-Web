from app.extensions import db
from app.models.imagen import ImagenProducto
from app.models.producto import Producto


def listar_imagenes_de_producto(producto_id: int):
    producto = Producto.query.get(producto_id)
    if not producto:
        raise LookupError("Producto no encontrado")

    return (
        ImagenProducto.query
        .filter_by(producto_id=producto_id)
        .order_by(ImagenProducto.orden)
        .all()
    )


def obtener_imagen(imagen_id: int):
    return ImagenProducto.query.get(imagen_id)


def crear_imagen(producto_id: int, url: str, public_id: str, orden: int = 0) -> ImagenProducto:
    producto = Producto.query.get(producto_id)
    if not producto:
        raise LookupError("Producto no encontrado")

    if not url or not public_id:
        raise ValueError("URL y public_id son obligatorios")

    # Si no se especifica orden, asignar el siguiente
    if orden is None or orden == 0:
        max_orden = (
            db.session.query(db.func.max(ImagenProducto.orden))
            .filter_by(producto_id=producto_id)
            .scalar()
        )
        orden = (max_orden or 0) + 1

    imagen = ImagenProducto(
        producto_id=producto_id,
        url=url,
        public_id=public_id,
        orden=orden,
    )

    db.session.add(imagen)
    db.session.commit()
    return imagen


def actualizar_orden(imagen_id: int, nuevo_orden: int) -> ImagenProducto:
    imagen = ImagenProducto.query.get(imagen_id)
    if not imagen:
        raise LookupError("Imagen no encontrada")

    try:
        nuevo_orden = int(nuevo_orden)
    except (TypeError, ValueError):
        raise ValueError("El orden debe ser un número entero")

    if nuevo_orden < 0:
        raise ValueError("El orden no puede ser negativo")

    imagen.orden = nuevo_orden
    db.session.commit()
    return imagen


def eliminar_imagen(imagen_id: int) -> None:
    imagen = ImagenProducto.query.get(imagen_id)
    if not imagen:
        raise LookupError("Imagen no encontrada")

    db.session.delete(imagen)
    db.session.commit()