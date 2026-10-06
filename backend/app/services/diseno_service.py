from app.extensions import db
from app.models.diseno import Diseno


def _normalizar_texto(texto: str | None) -> str | None:
    if texto is None:
        return None
    limpio = " ".join(str(texto).split()).strip()
    return limpio or None


def listar_disenos(solo_activos: bool = True, search: str | None = None):
    query = Diseno.query

    if solo_activos:
        query = query.filter(Diseno.estado.is_(True))

    if search:
        like = f"%{search.strip()}%"
        query = query.filter(Diseno.nombre.ilike(like))

    return query.order_by(Diseno.nombre).all()


def obtener_diseno(diseno_id: int, solo_activos: bool = False):
    diseno = Diseno.query.get(diseno_id)
    if not diseno:
        return None
    if solo_activos and not diseno.estado:
        return None
    return diseno


def crear_diseno(nombre: str, url: str, public_id: str, descripcion: str | None = None) -> Diseno:
    nombre = _normalizar_texto(nombre)
    if not nombre:
        raise ValueError("El nombre es obligatorio")

    if not url or not public_id:
        raise ValueError("URL y public_id son obligatorios")

    if Diseno.query.filter(Diseno.nombre.ilike(nombre)).first():
        raise ValueError("Ya existe un diseño con ese nombre")

    diseno = Diseno(
        nombre=nombre,
        descripcion=_normalizar_texto(descripcion),
        url=url,
        public_id=public_id,
        estado=True,
    )

    db.session.add(diseno)
    db.session.commit()
    return diseno


def actualizar_diseno(diseno_id: int, data: dict) -> Diseno:
    diseno = Diseno.query.get(diseno_id)
    if not diseno:
        raise LookupError("Diseño no encontrado")

    if "nombre" in data:
        nombre = _normalizar_texto(data["nombre"])
        if not nombre:
            raise ValueError("El nombre no puede estar vacío")

        existente = Diseno.query.filter(
            Diseno.nombre.ilike(nombre),
            Diseno.id != diseno_id,
        ).first()
        if existente:
            raise ValueError("Ya existe otro diseño con ese nombre")

        diseno.nombre = nombre

    if "descripcion" in data:
        diseno.descripcion = _normalizar_texto(data["descripcion"])

    if "estado" in data:
        if not isinstance(data["estado"], bool):
            raise ValueError("El estado debe ser verdadero o falso")
        diseno.estado = data["estado"]

    db.session.commit()
    return diseno


def eliminar_diseno(diseno_id: int) -> str:
    """
    Elimina un diseño de la BD.
    Devuelve el public_id para que el llamador pueda borrarlo de Cloudinary.
    """
    diseno = Diseno.query.get(diseno_id)
    if not diseno:
        raise LookupError("Diseño no encontrado")

    public_id = diseno.public_id
    db.session.delete(diseno)
    db.session.commit()
    return public_id