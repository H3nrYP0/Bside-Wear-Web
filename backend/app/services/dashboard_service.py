from sqlalchemy import func

from app.extensions import db
from app.models.usuario import Usuario, RolEnum
from app.models.categoria import Categoria
from app.models.producto import Producto
from app.models.variante import VarianteProducto
from app.models.pedido import Pedido, EstadoPedido


def resumen_general() -> dict:
    """Resumen general del sistema para el panel administrativo."""

    # --- Cantidades ---
    categorias_activas = Categoria.query.filter_by(estado=True).count()
    productos_activos = Producto.query.filter_by(estado=True).count()
    variantes_activas = VarianteProducto.query.filter_by(estado=True).count()
    clientes_registrados = Usuario.query.filter_by(rol=RolEnum.CLIENTE).count()

    # --- Pedidos ---
    pedidos_totales = Pedido.query.count()
    pedidos_pendientes = Pedido.query.filter_by(estado=EstadoPedido.PENDIENTE).count()

    # --- Ingresos (excluye cancelados) ---
    ingresos_totales = (
        db.session.query(func.coalesce(func.sum(Pedido.total), 0))
        .filter(Pedido.estado != EstadoPedido.CANCELADO)
        .scalar()
    )

    # --- Stock ---
    stock_total = (
        db.session.query(func.coalesce(func.sum(VarianteProducto.stock), 0))
        .filter(VarianteProducto.estado.is_(True))
        .scalar()
    )

    # --- Variantes con stock bajo (<= 5) ---
    variantes_stock_bajo = (
        VarianteProducto.query
        .filter(VarianteProducto.estado.is_(True))
        .filter(VarianteProducto.stock <= 5)
        .count()
    )

    # --- Variantes sin stock (stock == 0) ---
    variantes_sin_stock = (
        VarianteProducto.query
        .filter(VarianteProducto.estado.is_(True))
        .filter(VarianteProducto.stock == 0)
        .count()
    )

    return {
        "cantidades": {
            "categorias_activas": categorias_activas,
            "productos_activos": productos_activos,
            "variantes_activas": variantes_activas,
            "clientes_registrados": clientes_registrados,
        },
        "pedidos": {
            "total": pedidos_totales,
            "pendientes": pedidos_pendientes,
            "ingresos_totales": float(ingresos_totales),
        },
        "stock": {
            "stock_total_disponible": int(stock_total),
            "variantes_stock_bajo": variantes_stock_bajo,
            "variantes_sin_stock": variantes_sin_stock,
        },
    }