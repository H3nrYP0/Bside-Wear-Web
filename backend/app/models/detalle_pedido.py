from app.extensions import db


class DetallePedido(db.Model):
    __tablename__ = "detalles_pedido"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    pedido_id = db.Column(
        db.Integer,
        db.ForeignKey("pedidos.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    variante_id = db.Column(
        db.Integer,
        db.ForeignKey("variantes_producto.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    # Datos históricos (congelados al momento del pedido)
    producto_id = db.Column(db.Integer, nullable=False)
    producto_nombre = db.Column(db.String(150), nullable=False)
    variante_talla = db.Column(db.String(10), nullable=True)
    variante_color = db.Column(db.String(30), nullable=True)

    cantidad = db.Column(db.Integer, nullable=False)
    precio_unitario = db.Column(db.Numeric(10, 2), nullable=False)
    subtotal = db.Column(db.Numeric(12, 2), nullable=False)

    # Relaciones
    pedido = db.relationship("Pedido", back_populates="detalles")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "pedido_id": self.pedido_id,
            "variante_id": self.variante_id,
            "producto_id": self.producto_id,
            "producto_nombre": self.producto_nombre,
            "variante_talla": self.variante_talla,
            "variante_color": self.variante_color,
            "cantidad": self.cantidad,
            "precio_unitario": float(self.precio_unitario),
            "subtotal": float(self.subtotal),
        }

    def __repr__(self) -> str:
        return f"<DetallePedido pedido={self.pedido_id} {self.producto_nombre} x{self.cantidad}>"