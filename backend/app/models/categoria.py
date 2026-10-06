from app.extensions import db


class Categoria(db.Model):
    __tablename__ = "categorias"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(80), unique=True, nullable=False, index=True)
    descripcion = db.Column(db.Text, nullable=True)
    estado = db.Column(db.Boolean, nullable=False, default=True)

    # Relaciones
    productos = db.relationship(
        "Producto",
        back_populates="categoria",
        cascade="all, delete-orphan",
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "nombre": self.nombre,
            "descripcion": self.descripcion,
            "estado": self.estado,
        }

    def __repr__(self) -> str:
        return f"<Categoria {self.nombre}>"