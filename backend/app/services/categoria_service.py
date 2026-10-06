from app.extensions import db
from app.models.categoria import Categoria
from app.models.producto import Producto


def _normalizar_texto(texto: str | None) -> str:
    """Colapsa espacios múltiples y limpia extremos."""
    return " ".join((texto or "").split()).strip()


def listar_categorias(solo_activas: bool = True):
    query = Categoria.query
    if solo_activas:
        query = query.filter_by(estado=True)
    return query.order_by(Categoria.nombre).all()


def obtener_categoria(categoria_id: int):
    return Categoria.query.get(categoria_id)


def crear_categoria(nombre: str, descripcion: str | None = None) -> Categoria:
    nombre = _normalizar_texto(nombre)
    if not nombre:
        raise ValueError("El nombre es obligatorio")

    if Categoria.query.filter(Categoria.nombre.ilike(nombre)).first():
        raise ValueError("Ya existe una categoría con ese nombre")

    categoria = Categoria(
        nombre=nombre,
        descripcion=_normalizar_texto(descripcion) or None,
    )
    db.session.add(categoria)
    db.session.commit()
    return categoria


def actualizar_categoria(categoria_id: int, data: dict) -> Categoria:
    categoria = Categoria.query.get(categoria_id)
    if not categoria:
        raise LookupError("Categoría no encontrada")

    if "nombre" in data:
        nombre = _normalizar_texto(data["nombre"])
        if not nombre:
            raise ValueError("El nombre no puede estar vacío")

        existente = Categoria.query.filter(
            Categoria.nombre.ilike(nombre),
            Categoria.id != categoria_id,
        ).first()
        if existente:
            raise ValueError("Ya existe otra categoría con ese nombre")

        categoria.nombre = nombre

    if "descripcion" in data:
        categoria.descripcion = _normalizar_texto(data["descripcion"]) or None

    if "estado" in data:
        if not isinstance(data["estado"], bool):
            raise ValueError("El estado debe ser verdadero o falso")
        categoria.estado = data["estado"]

    db.session.commit()
    return categoria


def eliminar_categoria(categoria_id: int) -> None:
    categoria = Categoria.query.get(categoria_id)
    if not categoria:
        raise LookupError("Categoría no encontrada")

    productos_asociados = Producto.query.filter_by(categoria_id=categoria_id).count()
    if productos_asociados > 0:
        raise ValueError(
            f"No se puede eliminar: la categoría tiene {productos_asociados} producto(s) asociado(s)"
        )

    db.session.delete(categoria)
    db.session.commit()