import enum
from datetime import datetime, timezone
from app.extensions import db


class EstadoPedido(str, enum.Enum):
    PENDIENTE = "pendiente"
    CONFIRMADO = "confirmado"
    ENVIADO = "enviado"
    ENTREGADO = "entregado"
    CANCELADO = "cancelado"


class Pedido(db.Model):
    __tablename__ = "pedidos"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    usuario_id = db.Column(
        db.Integer,
        db.ForeignKey("usuarios.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    estado = db.Column(
        db.Enum(
            EstadoPedido,
            name="estado_pedido_enum",
            native_enum=True,
            validate_strings=True,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=EstadoPedido.PENDIENTE,
    )

    total = db.Column(db.Numeric(12, 2), nullable=False, default=0)

    nombre_cliente = db.Column(db.String(120), nullable=False)
    telefono_cliente = db.Column(db.String(30), nullable=False)
    direccion_envio = db.Column(db.String(255), nullable=False)
    notas = db.Column(db.Text, nullable=True)

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

    # Relaciones
    usuario = db.relationship("Usuario", backref="pedidos")
    detalles = db.relationship(
        "DetallePedido",
        back_populates="pedido",
        cascade="all, delete-orphan",
        order_by="DetallePedido.id",
    )

    def to_dict(self, incluir_detalles: bool = True) -> dict:
        data = {
            "id": self.id,
            "usuario_id": self.usuario_id,
            "estado": self.estado.value if isinstance(self.estado, EstadoPedido) else self.estado,
            "total": float(self.total),
            "nombre_cliente": self.nombre_cliente,
            "telefono_cliente": self.telefono_cliente,
            "direccion_envio": self.direccion_envio,
            "notas": self.notas,
            "fecha_creacion": self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            "fecha_actualizacion": self.fecha_actualizacion.isoformat() if self.fecha_actualizacion else None,
        }

        if incluir_detalles:
            data["detalles"] = [d.to_dict() for d in self.detalles]

        return data

    def __repr__(self) -> str:
        return f"<Pedido {self.id} ({self.estado})>"