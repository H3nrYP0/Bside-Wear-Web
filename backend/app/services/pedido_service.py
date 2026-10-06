from decimal import Decimal

from app.extensions import db
from app.models.pedido import Pedido, EstadoPedido
from app.models.detalle_pedido import DetallePedido
from app.models.variante import VarianteProducto
from app.models.producto import Producto
from app.models.usuario import Usuario


def _normalizar_texto(texto: str | None) -> str:
    return " ".join((texto or "").split()).strip()


def _validar_datos_cliente(data: dict) -> dict:
    nombre = _normalizar_texto(data.get("nombre_cliente"))
    telefono = _normalizar_texto(data.get("telefono_cliente"))
    direccion = _normalizar_texto(data.get("direccion_envio"))

    if not nombre:
        raise ValueError("El nombre del cliente es obligatorio")
    if not telefono:
        raise ValueError("El teléfono es obligatorio")
    if not direccion:
        raise ValueError("La dirección de envío es obligatoria")

    return {
        "nombre_cliente": nombre,
        "telefono_cliente": telefono,
        "direccion_envio": direccion,
        "notas": _normalizar_texto(data.get("notas")) or None,
    }


def _validar_items(items: list) -> list:
    if not items or not isinstance(items, list):
        raise ValueError("El pedido debe tener al menos un producto")

    items_validados = []
    for idx, item in enumerate(items):
        if not isinstance(item, dict):
            raise ValueError(f"El ítem {idx + 1} no es válido")

        variante_id = item.get("variante_id")
        cantidad = item.get("cantidad")

        if not variante_id:
            raise ValueError(f"El ítem {idx + 1} no tiene variante_id")

        try:
            cantidad = int(cantidad)
        except (TypeError, ValueError):
            raise ValueError(f"La cantidad del ítem {idx + 1} debe ser un número entero")

        if cantidad <= 0:
            raise ValueError(f"La cantidad del ítem {idx + 1} debe ser mayor a 0")

        items_validados.append({"variante_id": variante_id, "cantidad": cantidad})

    return items_validados


# ==============================
# Crear pedido
# ==============================

def crear_pedido(usuario_id: int, data: dict) -> Pedido:
    """
    Crea un pedido para un usuario.

    Espera:
        {
            "items": [{"variante_id": 5, "cantidad": 2}, ...],
            "nombre_cliente": "...",
            "telefono_cliente": "...",
            "direccion_envio": "...",
            "notas": "..."  # opcional
        }
    """
    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        raise LookupError("Usuario no encontrado")

    datos_cliente = _validar_datos_cliente(data)
    items = _validar_items(data.get("items", []))

    # Verificar que todas las variantes existan, estén activas, y tengan stock
    detalles_pendientes = []
    total = Decimal("0.00")

    for item in items:
        variante = VarianteProducto.query.get(item["variante_id"])
        if not variante:
            raise ValueError(f"La variante con id {item['variante_id']} no existe")

        if not variante.estado:
            raise ValueError(f"La variante {variante.id} está inactiva")

        producto = Producto.query.get(variante.producto_id)
        if not producto or not producto.estado:
            raise ValueError(f"El producto de la variante {variante.id} no está disponible")

        if variante.stock < item["cantidad"]:
            raise ValueError(
                f"Stock insuficiente para {producto.nombre} "
                f"(talla: {variante.talla or 'N/A'}, color: {variante.color or 'N/A'}). "
                f"Disponible: {variante.stock}, solicitado: {item['cantidad']}"
            )

        precio_unitario = Decimal(str(producto.precio_final()))
        subtotal = precio_unitario * item["cantidad"]

        detalles_pendientes.append({
            "variante": variante,
            "producto": producto,
            "cantidad": item["cantidad"],
            "precio_unitario": precio_unitario,
            "subtotal": subtotal,
        })

        total += subtotal

    # Crear pedido
    pedido = Pedido(
        usuario_id=usuario_id,
        estado=EstadoPedido.PENDIENTE,
        total=total,
        **datos_cliente,
    )

    db.session.add(pedido)
    db.session.flush()  # Para obtener pedido.id

    # Crear detalles y descontar stock
    for item in detalles_pendientes:
        variante = item["variante"]
        producto = item["producto"]

        detalle = DetallePedido(
            pedido_id=pedido.id,
            variante_id=variante.id,
            producto_id=producto.id,
            producto_nombre=producto.nombre,
            variante_talla=variante.talla,
            variante_color=variante.color,
            cantidad=item["cantidad"],
            precio_unitario=item["precio_unitario"],
            subtotal=item["subtotal"],
        )
        db.session.add(detalle)

        # Descontar stock
        variante.stock -= item["cantidad"]

    db.session.commit()
    return pedido


# ==============================
# Consultas
# ==============================

def listar_pedidos_de_usuario(usuario_id: int):
    return (
        Pedido.query
        .filter_by(usuario_id=usuario_id)
        .order_by(Pedido.fecha_creacion.desc())
        .all()
    )


def obtener_pedido(pedido_id: int):
    return Pedido.query.get(pedido_id)


def listar_pedidos_admin(estado: str | None = None, usuario_id: int | None = None):
    query = Pedido.query

    if estado:
        try:
            estado_enum = EstadoPedido(estado)
            query = query.filter(Pedido.estado == estado_enum)
        except ValueError:
            raise ValueError(f"Estado inválido. Válidos: {[e.value for e in EstadoPedido]}")

    if usuario_id:
        query = query.filter(Pedido.usuario_id == usuario_id)

    return query.order_by(Pedido.fecha_creacion.desc()).all()


# ==============================
# Cambiar estado
# ==============================

def cambiar_estado(pedido_id: int, nuevo_estado: str) -> Pedido:
    pedido = Pedido.query.get(pedido_id)
    if not pedido:
        raise LookupError("Pedido no encontrado")

    try:
        estado_enum = EstadoPedido(nuevo_estado)
    except ValueError:
        raise ValueError(f"Estado inválido. Válidos: {[e.value for e in EstadoPedido]}")

    # Si se cancela, devolver stock
    if estado_enum == EstadoPedido.CANCELADO and pedido.estado != EstadoPedido.CANCELADO:
        for detalle in pedido.detalles:
            variante = VarianteProducto.query.get(detalle.variante_id)
            if variante:
                variante.stock += detalle.cantidad

    pedido.estado = estado_enum
    db.session.commit()
    return pedido