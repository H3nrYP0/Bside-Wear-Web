from app.extensions import db


class Diseno(db.Model):
    __tablename__ = "disenos"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(120), nullable=False, index=True)
    descripcion = db.Column(db.Text, nullable=True)
    url = db.Column(db.String(500), nullable=False)
    public_id = db.Column(db.String(200), nullable=False)
    estado = db.Column(db.Boolean, nullable=False, default=True)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "nombre": self.nombre,
            "descripcion": self.descripcion,
            "url": self.url,
            "public_id": self.public_id,
            "estado": self.estado,
        }

    def __repr__(self) -> str:
        return f"<Diseno {self.nombre}>"