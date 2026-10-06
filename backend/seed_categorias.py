"""
Script para insertar las categorías iniciales de B-Side.

Uso:
    python seed_categorias.py
"""
from app import create_app
from app.extensions import db
from app.models.categoria import Categoria


CATEGORIAS_INICIALES = [
    {"nombre": "Camisetas", "descripcion": "Camisetas de diseño urbano B-Side"},
    {"nombre": "Hoodies", "descripcion": "Hoodies con identidad visual propia"},
    {"nombre": "Buzos", "descripcion": "Buzos urbanos B-Side"},
    {"nombre": "Accesorios", "descripcion": "Posters, stickers y otros productos B-Side"},
]


def seed():
    app = create_app()
    with app.app_context():
        for item in CATEGORIAS_INICIALES:
            existente = Categoria.query.filter(
                Categoria.nombre.ilike(item["nombre"])
            ).first()
            if existente:
                print(f"[SKIP] Ya existe: {item['nombre']}")
                continue

            categoria = Categoria(
                nombre=item["nombre"],
                descripcion=item["descripcion"],
            )
            db.session.add(categoria)
            print(f"[OK] Agregada: {item['nombre']}")

        db.session.commit()
        print("Seed completado")


if __name__ == "__main__":
    seed()