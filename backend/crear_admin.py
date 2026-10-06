"""
Script para crear un usuario administrador.

Uso:
    python crear_admin.py <nombre> <email> <password>

Ejemplo:
    python crear_admin.py "David Admin" admin@bside.com MiClaveSegura123
"""
import sys

from app import create_app
from app.extensions import db
from app.models.usuario import Usuario, RolEnum


def crear_admin(nombre: str, email: str, password: str) -> None:
    app = create_app()
    with app.app_context():
        email = email.strip().lower()

        existente = Usuario.query.filter_by(email=email).first()
        if existente:
            if existente.rol == RolEnum.ADMIN:
                print(f"⚠️  Ya existe un admin con ese email: {email}")
                return
            existente.rol = RolEnum.ADMIN
            db.session.commit()
            print(f"✅ Usuario existente promovido a admin: {email}")
            return

        if len(password) < 6:
            print("❌ La contraseña debe tener al menos 6 caracteres")
            sys.exit(1)

        usuario = Usuario(nombre=nombre.strip(), email=email, rol=RolEnum.ADMIN)
        usuario.set_password(password)
        db.session.add(usuario)
        db.session.commit()

        print(f"✅ Admin creado correctamente: {email}")


if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Uso: python crear_admin.py <nombre> <email> <password>")
        sys.exit(1)

    crear_admin(sys.argv[1], sys.argv[2], sys.argv[3])