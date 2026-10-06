import enum
from app.extensions import db


class TipoProducto(str, enum.Enum):
    PRENDA = "prenda"
    ACCESORIO = "accesorio"
    COMBO = "combo"


class TipoCorte(str, enum.Enum):
    REGULAR = "regular"
    OVERSIZE = "oversize"


class Producto(db.Model):
    __tablename__ = "productos"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    categoria_id = db.Column(
        db.Integer,
        db.ForeignKey("categorias.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    nombre = db.Column(db.String(120), nullable=False, index=True)
    descripcion = db.Column(db.Text, nullable=True)

    tipo = db.Column(
        db.Enum(
            TipoProducto,
            name="tipo_producto_enum",
            native_enum=True,
            validate_strings=True,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
        default=TipoProducto.PRENDA,
    )

    # Solo aplica a prendas. Para accesorios y combos queda en NULL.
    tipo_corte = db.Column(
        db.Enum(
            TipoCorte,
            name="tipo_corte_enum",
            native_enum=True,
            validate_strings=True,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=True,
    )

    precio_costo = db.Column(db.Numeric(10, 2), nullable=False)
    precio_venta = db.Column(db.Numeric(10, 2), nullable=False)

    en_oferta = db.Column(db.Boolean, nullable=False, default=False)
    porcentaje_descuento = db.Column(db.Numeric(5, 2), nullable=True)

    estado = db.Column(db.Boolean, nullable=False, default=True)

    # Relaciones
    categoria = db.relationship("Categoria", back_populates="productos")
    variantes = db.relationship(
        "VarianteProducto",
        back_populates="producto",
        cascade="all, delete-orphan",
    )
    imagenes = db.relationship(
        "ImagenProducto",
        back_populates="producto",
        cascade="all, delete-orphan",
        order_by="ImagenProducto.orden",
    )

    # Métodos
    def precio_final(self):
        """Devuelve el precio con descuento aplicado si está en oferta."""
        if self.en_oferta and self.porcentaje_descuento:
            descuento = self.precio_venta * (self.porcentaje_descuento / 100)
            return float(self.precio_venta - descuento)
        return float(self.precio_venta)

    def to_dict_publico(self) -> dict:
        """Lo que ve el cliente. NO expone precio_costo. Incluye imagenes."""
        # Imagen principal (la de menor orden) y todas las URLs
        imagenes_ordenadas = sorted(self.imagenes, key=lambda i: i.orden)
        imagen_principal = imagenes_ordenadas[0].url if imagenes_ordenadas else None
        return {
            "id": self.id,
            "categoria_id": self.categoria_id,
            "nombre": self.nombre,
            "descripcion": self.descripcion,
            "tipo": self.tipo.value if isinstance(self.tipo, TipoProducto) else self.tipo,
            "tipo_corte": (
                self.tipo_corte.value
                if isinstance(self.tipo_corte, TipoCorte)
                else self.tipo_corte
            ),
            "precio_venta": float(self.precio_venta),
            "en_oferta": self.en_oferta,
            "porcentaje_descuento": (
                float(self.porcentaje_descuento) if self.porcentaje_descuento else None
            ),
            "precio_final": self.precio_final(),
            "estado": self.estado,
            "imagen_principal": imagen_principal,
            "imagenes": [img.url for img in imagenes_ordenadas],
        }

    def to_dict_admin(self) -> dict:
        """Lo que ve el admin. Incluye precio_costo."""
        data = self.to_dict_publico()
        data["precio_costo"] = float(self.precio_costo)
        return data

    def __repr__(self) -> str:
        return f"<Producto {self.nombre}>"