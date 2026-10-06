import enum
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db


class RolEnum(str, enum.Enum):
    ADMIN = "admin"
    CLIENTE = "cliente"


class Usuario(db.Model):
    __tablename__ = "usuarios"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(180), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    rol = db.Column(
        db.Enum(
            RolEnum,
            name="rol_enum",
            native_enum=True,
            validate_strings=True,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=RolEnum.CLIENTE,
    )
    activo = db.Column(db.Boolean, nullable=False, default=True)

    fecha_creacion = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    fecha_actualizacion = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def set_password(self, password_plano: str) -> None:
        self.password_hash = generate_password_hash(password_plano)

    def check_password(self, password_plano: str) -> bool:
        return check_password_hash(self.password_hash, password_plano)

    def es_admin(self) -> bool:
        return self.rol == RolEnum.ADMIN

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "nombre": self.nombre,
            "email": self.email,
            "rol": self.rol.value if isinstance(self.rol, RolEnum) else self.rol,
            "activo": self.activo,
            "fecha_creacion": self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            "fecha_actualizacion": self.fecha_actualizacion.isoformat() if self.fecha_actualizacion else None,
        }

    def __repr__(self) -> str:
        return f"<Usuario {self.email} ({self.rol})>"