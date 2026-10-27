from sqlalchemy import or_

from app.extensions import db
from app.models.categoria import Categoria
from app.models.producto import Producto, TipoProducto, TipoCorte


def _normalizar_texto(texto: str | None) -> str:
    return " ".join((texto or "").split()).strip()


def _validar_categoria(categoria_id: int) -> Categoria:
    categoria = Categoria.query.get(categoria_id)
    if not categoria:
        raise ValueError("La categoría no existe")
    if not categoria.estado:
        raise ValueError("La categoría está inactiva")
    return categoria


def _validar_precios(precio_costo, precio_venta):
    try:
        precio_costo = float(precio_costo)
        precio_venta = float(precio_venta)
    except (TypeError, ValueError):
        raise ValueError("Los precios deben ser números válidos")

    if precio_costo <= 0:
        raise ValueError("El precio de costo debe ser mayor a 0")
    if precio_venta <= 0:
        raise ValueError("El precio de venta debe ser mayor a 0")
    if precio_venta < precio_costo:
        raise ValueError("El precio de venta no puede ser menor al precio de costo")

    return precio_costo, precio_venta


def _validar_tipo(tipo: str) -> TipoProducto:
    try:
        return TipoProducto(tipo)
    except ValueError:
        raise ValueError(f"El tipo debe ser uno de: {[t.value for t in TipoProducto]}")


def _validar_tipo_corte(tipo: TipoProducto, tipo_corte):
    """tipo_corte solo aplica a prendas. Si es prenda, es obligatorio."""
    if tipo == TipoProducto.PRENDA:
        if not tipo_corte:
            raise ValueError("Las prendas requieren un tipo de corte (regular u oversize)")
        try:
            return TipoCorte(tipo_corte)
        except ValueError:
            raise ValueError(f"El tipo de corte debe ser uno de: {[t.value for t in TipoCorte]}")

    # Si no es prenda, tipo_corte debe ser null
    if tipo_corte:
        raise ValueError("Solo las prendas pueden tener tipo de corte")
    return None


def _validar_oferta(en_oferta, porcentaje_descuento):
    if en_oferta:
        if porcentaje_descuento is None:
            raise ValueError("Si el producto está en oferta, se requiere un porcentaje de descuento")
        try:
            porcentaje_descuento = float(porcentaje_descuento)
        except (TypeError, ValueError):
            raise ValueError("El porcentaje de descuento debe ser un número")
        if porcentaje_descuento <= 0 or porcentaje_descuento >= 100:
            raise ValueError("El porcentaje de descuento debe estar entre 1 y 99")
        return porcentaje_descuento

    # Si no está en oferta, el porcentaje se ignora
    return None


# ==============================
# Listados
# ==============================

def listar_productos_publicos(
    categoria_id: int | None = None,
    tipo: str | None = None,
    search: str | None = None,
    min_precio: float | None = None,
    max_precio: float | None = None,
    solo_ofertas: bool = False,
    page: int = 1,
    per_page: int = 12,
):
    """
    Lista productos activos de categorías activas.
    Devuelve (items, total, pages).
    """
    query = (
        Producto.query
        .join(Categoria, Producto.categoria_id == Categoria.id)
        .filter(Producto.estado.is_(True))
        .filter(Categoria.estado.is_(True))
    )

    if categoria_id:
        query = query.filter(Producto.categoria_id == categoria_id)

    if tipo:
        try:
            tipo_enum = TipoProducto(tipo)
            query = query.filter(Producto.tipo == tipo_enum)
        except ValueError:
            raise ValueError("Tipo inválido")

    if search:
        like = f"%{search.strip()}%"
        query = query.filter(Producto.nombre.ilike(like))

    if min_precio is not None:
        query = query.filter(Producto.precio_venta >= min_precio)

    if max_precio is not None:
        query = query.filter(Producto.precio_venta <= max_precio)

    if solo_ofertas:
        query = query.filter(Producto.en_oferta.is_(True))

    query = query.order_by(Producto.nombre.asc())

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    return pagination.items, pagination.total, pagination.pages


def listar_productos_admin(
    categoria_id: int | None = None,
    tipo: str | None = None,
    search: str | None = None,
    estado: bool | None = None,
    page: int = 1,
    per_page: int = 20,
):
    """
    Lista TODOS los productos (activos e inactivos) para admin.
    """
    query = Producto.query

    if categoria_id:
        query = query.filter(Producto.categoria_id == categoria_id)

    if tipo:
        try:
            tipo_enum = TipoProducto(tipo)
            query = query.filter(Producto.tipo == tipo_enum)
        except ValueError:
            raise ValueError("Tipo inválido")

    if search:
        like = f"%{search.strip()}%"
        query = query.filter(Producto.nombre.ilike(like))

    if estado is not None:
        query = query.filter(Producto.estado.is_(estado))

    query = query.order_by(Producto.nombre.asc())

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    return pagination.items, pagination.total, pagination.pages


def obtener_producto(producto_id: int, solo_activos: bool = True):
    producto = Producto.query.get(producto_id)
    if not producto:
        return None
    if solo_activos and not producto.estado:
        return None
    return producto


# ==============================
# Crear / editar / eliminar
# ==============================

def crear_producto(data: dict) -> Producto:
    nombre = _normalizar_texto(data.get("nombre"))
    if not nombre:
        raise ValueError("El nombre es obligatorio")

    if Producto.query.filter(Producto.nombre.ilike(nombre)).first():
        raise ValueError("Ya existe un producto con ese nombre")

    categoria_id = data.get("categoria_id")
    if not categoria_id:
        raise ValueError("La categoría es obligatoria")
    _validar_categoria(categoria_id)

    tipo = _validar_tipo(data.get("tipo", TipoProducto.PRENDA.value))
    tipo_corte = _validar_tipo_corte(tipo, data.get("tipo_corte"))

    precio_costo, precio_venta = _validar_precios(
        data.get("precio_costo"),
        data.get("precio_venta"),
    )

    en_oferta = bool(data.get("en_oferta", False))
    porcentaje_descuento = _validar_oferta(en_oferta, data.get("porcentaje_descuento"))

    # Validar variantes iniciales
    variantes_data = data.get("variantes")
    if variantes_data is not None:
        if not isinstance(variantes_data, list):
            raise ValueError("El campo 'variantes' debe ser una lista")
        if len(variantes_data) == 0:
            raise ValueError("Si envías 'variantes', debe haber al menos una")

    # Si no vienen variantes, se creará una variante genérica automáticamente
    if variantes_data is None:
        variantes_data = [{"talla": None, "color": None, "stock": 0}]

    producto = Producto(
        nombre=nombre,
        descripcion=_normalizar_texto(data.get("descripcion")) or None,
        categoria_id=categoria_id,
        tipo=tipo,
        tipo_corte=tipo_corte,
        precio_costo=precio_costo,
        precio_venta=precio_venta,
        en_oferta=en_oferta,
        porcentaje_descuento=porcentaje_descuento,
        estado=bool(data.get("estado", True)),
    )

    db.session.add(producto)
    db.session.flush()  # Para obtener el id del producto antes del commit

    # Crear variantes iniciales
    from app.services import variante_service
    variante_service.crear_variantes_iniciales(producto.id, variantes_data)

    db.session.commit()
    return producto


def actualizar_producto(producto_id: int, data: dict) -> Producto:
    producto = Producto.query.get(producto_id)
    if not producto:
        raise LookupError("Producto no encontrado")

    if "nombre" in data:
        nombre = _normalizar_texto(data["nombre"])
        if not nombre:
            raise ValueError("El nombre no puede estar vacío")
        existente = Producto.query.filter(
            Producto.nombre.ilike(nombre),
            Producto.id != producto_id,
        ).first()
        if existente:
            raise ValueError("Ya existe otro producto con ese nombre")
        producto.nombre = nombre

    if "descripcion" in data:
        producto.descripcion = _normalizar_texto(data["descripcion"]) or None

    if "categoria_id" in data:
        _validar_categoria(data["categoria_id"])
        producto.categoria_id = data["categoria_id"]

    # Recalcular tipo y tipo_corte si vienen
    tipo = producto.tipo
    if "tipo" in data:
        tipo = _validar_tipo(data["tipo"])

    tipo_corte_actual = producto.tipo_corte.value if producto.tipo_corte else None
    tipo_corte_input = data.get("tipo_corte", tipo_corte_actual)

    # Si cambia el tipo, validar coherencia con tipo_corte
    if "tipo" in data or "tipo_corte" in data:
        tipo_corte = _validar_tipo_corte(tipo, tipo_corte_input)
        producto.tipo = tipo
        producto.tipo_corte = tipo_corte

    # Precios
    if "precio_costo" in data or "precio_venta" in data:
        precio_costo = data.get("precio_costo", float(producto.precio_costo))
        precio_venta = data.get("precio_venta", float(producto.precio_venta))
        precio_costo, precio_venta = _validar_precios(precio_costo, precio_venta)
        producto.precio_costo = precio_costo
        producto.precio_venta = precio_venta

    # Oferta
    if "en_oferta" in data or "porcentaje_descuento" in data:
        en_oferta = data.get("en_oferta", producto.en_oferta)
        porcentaje = data.get("porcentaje_descuento", float(producto.porcentaje_descuento) if producto.porcentaje_descuento else None)
        producto.en_oferta = bool(en_oferta)
        producto.porcentaje_descuento = _validar_oferta(en_oferta, porcentaje)

    if "estado" in data:
        if not isinstance(data["estado"], bool):
            raise ValueError("El estado debe ser verdadero o falso")
        producto.estado = data["estado"]

    db.session.commit()
    return producto


def eliminar_producto(producto_id: int) -> None:
    producto = Producto.query.get(producto_id)
    if not producto:
        raise LookupError("Producto no encontrado")

    # Verificar si tiene variantes (relación activa)
    if producto.variantes and len(producto.variantes) > 0:
        raise ValueError(
            f"No se puede eliminar: el producto tiene {len(producto.variantes)} variante(s) asociada(s)"
        )

    # Verificar si tiene imágenes (relación activa)
    if producto.imagenes and len(producto.imagenes) > 0:
        raise ValueError(
            f"No se puede eliminar: el producto tiene {len(producto.imagenes)} imagen(es) asociada(s)"
        )

    db.session.delete(producto)
    db.session.commit()