from app.extensions import db
from app.models.usuario import Usuario, RolEnum


def crear_usuario(nombre: str, email: str, password: str, rol: RolEnum = RolEnum.CLIENTE) -> Usuario:
    """Crea un usuario nuevo, valida duplicados y hashea la contraseña."""
    email = email.strip().lower()

    if Usuario.query.filter_by(email=email).first():
        raise ValueError("El email ya está registrado")

    if len(password) < 6:
        raise ValueError("La contraseña debe tener al menos 6 caracteres")

    if isinstance(rol, str):
        rol = RolEnum(rol)

    usuario = Usuario(nombre=nombre.strip(), email=email, rol=rol)
    usuario.set_password(password)

    db.session.add(usuario)
    db.session.commit()
    return usuario


def buscar_por_email(email: str):
    return Usuario.query.filter_by(email=email.strip().lower()).first()