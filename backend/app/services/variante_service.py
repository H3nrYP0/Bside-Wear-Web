from app.extensions import db
from app.models.producto import Producto
from app.models.variante import VarianteProducto


def _normalizar_texto(texto: str | None) -> str | None:
    """Devuelve el texto normalizado, o None si queda vacío."""
    if texto is None:
        return None
    limpio = " ".join(str(texto).split()).strip()
    return limpio or None


def _validar_stock(stock) -> int:
    try:
        stock = int(stock)
    except (TypeError, ValueError):
        raise ValueError("El stock debe ser un número entero")
    if stock < 0:
        raise ValueError("El stock no puede ser negativo")
    return stock


def _verificar_duplicado(producto_id: int, talla, color, excluir_id: int | None = None):
    """Verifica que no exista otra variante con la misma combinación talla+color."""
    query = VarianteProducto.query.filter(
        VarianteProducto.producto_id == producto_id,
        VarianteProducto.talla.is_(talla) if talla is None else VarianteProducto.talla == talla,
        VarianteProducto.color.is_(color) if color is None else VarianteProducto.color == color,
    )
    if excluir_id:
        query = query.filter(VarianteProducto.id != excluir_id)
    if query.first():
        raise ValueError(
            f"Ya existe una variante con talla={talla or 'N/A'} y color={color or 'N/A'} en este producto"
        )


# ==============================
# Listar / obtener
# ==============================

def listar_variantes_de_producto(producto_id: int, solo_activas: bool = True):
    producto = Producto.query.get(producto_id)
    if not producto:
        raise LookupError("Producto no encontrado")

    query = VarianteProducto.query.filter_by(producto_id=producto_id)
    if solo_activas:
        query = query.filter(VarianteProducto.estado.is_(True))

    return query.order_by(VarianteProducto.id).all()


def obtener_variante(variante_id: int):
    return VarianteProducto.query.get(variante_id)


# ==============================
# Crear / editar / eliminar
# ==============================

def crear_variante(producto_id: int, data: dict) -> VarianteProducto:
    producto = Producto.query.get(producto_id)
    if not producto:
        raise LookupError("Producto no encontrado")

    talla = _normalizar_texto(data.get("talla"))
    color = _normalizar_texto(data.get("color"))
    stock = _validar_stock(data.get("stock", 0))

    _verificar_duplicado(producto_id, talla, color)

    variante = VarianteProducto(
        producto_id=producto_id,
        talla=talla,
        color=color,
        stock=stock,
        estado=bool(data.get("estado", True)),
    )

    db.session.add(variante)
    db.session.commit()
    return variante


def crear_variantes_iniciales(producto_id: int, variantes_data: list) -> list:
    """
    Crea varias variantes para un producto (usado al crear un producto nuevo).
    No hace commit por cada una, lo hace el llamador.
    """
    creadas = []
    for data in variantes_data:
        talla = _normalizar_texto(data.get("talla"))
        color = _normalizar_texto(data.get("color"))
        stock = _validar_stock(data.get("stock", 0))

        _verificar_duplicado(producto_id, talla, color)

        variante = VarianteProducto(
            producto_id=producto_id,
            talla=talla,
            color=color,
            stock=stock,
            estado=bool(data.get("estado", True)),
        )
        db.session.add(variante)
        creadas.append(variante)

    return creadas


def actualizar_variante(variante_id: int, data: dict) -> VarianteProducto:
    variante = VarianteProducto.query.get(variante_id)
    if not variante:
        raise LookupError("Variante no encontrada")

    if "talla" in data or "color" in data:
        talla = _normalizar_texto(data.get("talla", variante.talla))
        color = _normalizar_texto(data.get("color", variante.color))

        _verificar_duplicado(variante.producto_id, talla, color, excluir_id=variante_id)

        variante.talla = talla
        variante.color = color

    if "stock" in data:
        variante.stock = _validar_stock(data["stock"])

    if "estado" in data:
        if not isinstance(data["estado"], bool):
            raise ValueError("El estado debe ser verdadero o falso")
        variante.estado = data["estado"]

    db.session.commit()
    return variante


def eliminar_variante(variante_id: int) -> None:
    variante = VarianteProducto.query.get(variante_id)
    if not variante:
        raise LookupError("Variante no encontrada")

    # Verificar que no sea la última variante del producto
    total = VarianteProducto.query.filter_by(producto_id=variante.producto_id).count()
    if total <= 1:
        raise ValueError(
            "No se puede eliminar la última variante del producto. "
            "Todo producto debe tener al menos una variante. "
            "Elimina el producto completo si quieres deshacerte de él."
        )

    db.session.delete(variante)
    db.session.commit()