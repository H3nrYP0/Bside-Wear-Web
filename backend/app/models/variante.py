from app.extensions import db


class VarianteProducto(db.Model):
    __tablename__ = "variantes_producto"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    producto_id = db.Column(
        db.Integer,
        db.ForeignKey("productos.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    talla = db.Column(db.String(10), nullable=True)
    color = db.Column(db.String(30), nullable=True)
    stock = db.Column(db.Integer, nullable=False, default=0)

    estado = db.Column(db.Boolean, nullable=False, default=True)

    # Relaciones
    producto = db.relationship("Producto", back_populates="variantes")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "producto_id": self.producto_id,
            "talla": self.talla,
            "color": self.color,
            "stock": self.stock,
            "estado": self.estado,
        }

    def __repr__(self) -> str:
        return f"<Variante producto={self.producto_id} talla={self.talla} color={self.color}>"