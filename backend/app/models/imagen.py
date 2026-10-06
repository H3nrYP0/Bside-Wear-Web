from app.extensions import db


class ImagenProducto(db.Model):
    __tablename__ = "imagenes_producto"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    producto_id = db.Column(
        db.Integer,
        db.ForeignKey("productos.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    url = db.Column(db.String(500), nullable=False)
    public_id = db.Column(db.String(200), nullable=False)
    orden = db.Column(db.Integer, nullable=False, default=0)

    # Relaciones
    producto = db.relationship("Producto", back_populates="imagenes")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "producto_id": self.producto_id,
            "url": self.url,
            "public_id": self.public_id,
            "orden": self.orden,
        }

    def __repr__(self) -> str:
        return f"<Imagen producto={self.producto_id} orden={self.orden}>"