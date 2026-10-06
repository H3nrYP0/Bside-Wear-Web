"""modelo inicial completo del catalogo

Revision ID: 11438eefc602
Revises: 
Create Date: 2026-10-06 13:36:23.383021

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '11438eefc602'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # =========================================
    # 1. Crear los tipos ENUM (idempotente)
    # =========================================
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rol_enum') THEN
                CREATE TYPE rol_enum AS ENUM ('admin', 'cliente');
            END IF;
        END$$;
    """)

    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_producto_enum') THEN
                CREATE TYPE tipo_producto_enum AS ENUM ('prenda', 'accesorio', 'combo');
            END IF;
        END$$;
    """)

    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_corte_enum') THEN
                CREATE TYPE tipo_corte_enum AS ENUM ('regular', 'oversize');
            END IF;
        END$$;
    """)

    # =========================================
    # 2. Tabla usuarios
    # =========================================
    op.execute("""
        CREATE TABLE usuarios (
            id SERIAL PRIMARY KEY,
            nombre VARCHAR(120) NOT NULL,
            email VARCHAR(180) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            rol rol_enum NOT NULL DEFAULT 'cliente',
            activo BOOLEAN NOT NULL DEFAULT TRUE,
            fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    """)
    op.execute("CREATE UNIQUE INDEX ix_usuarios_email ON usuarios (email);")

    # =========================================
    # 3. Tabla categorias
    # =========================================
    op.execute("""
        CREATE TABLE categorias (
            id SERIAL PRIMARY KEY,
            nombre VARCHAR(80) NOT NULL,
            descripcion TEXT,
            estado BOOLEAN NOT NULL DEFAULT TRUE
        );
    """)
    op.execute("CREATE UNIQUE INDEX ix_categorias_nombre ON categorias (nombre);")

    # =========================================
    # 4. Tabla productos
    # =========================================
    op.execute("""
        CREATE TABLE productos (
            id SERIAL PRIMARY KEY,
            categoria_id INTEGER NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
            nombre VARCHAR(120) NOT NULL,
            descripcion TEXT,
            tipo tipo_producto_enum NOT NULL DEFAULT 'prenda',
            tipo_corte tipo_corte_enum,
            precio_costo NUMERIC(10, 2) NOT NULL,
            precio_venta NUMERIC(10, 2) NOT NULL,
            en_oferta BOOLEAN NOT NULL DEFAULT FALSE,
            porcentaje_descuento NUMERIC(5, 2),
            estado BOOLEAN NOT NULL DEFAULT TRUE
        );
    """)
    op.execute("CREATE INDEX ix_productos_categoria_id ON productos (categoria_id);")
    op.execute("CREATE INDEX ix_productos_nombre ON productos (nombre);")

    # =========================================
    # 5. Tabla imagenes_producto
    # =========================================
    op.execute("""
        CREATE TABLE imagenes_producto (
            id SERIAL PRIMARY KEY,
            producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
            url VARCHAR(500) NOT NULL,
            public_id VARCHAR(200) NOT NULL,
            orden INTEGER NOT NULL DEFAULT 0
        );
    """)
    op.execute("CREATE INDEX ix_imagenes_producto_producto_id ON imagenes_producto (producto_id);")

    # =========================================
    # 6. Tabla variantes_producto
    # =========================================
    op.execute("""
        CREATE TABLE variantes_producto (
            id SERIAL PRIMARY KEY,
            producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
            talla VARCHAR(10),
            color VARCHAR(30),
            stock INTEGER NOT NULL DEFAULT 0,
            estado BOOLEAN NOT NULL DEFAULT TRUE
        );
    """)
    op.execute("CREATE INDEX ix_variantes_producto_producto_id ON variantes_producto (producto_id);")


def downgrade():
    # 1. Eliminar tablas (en orden inverso de dependencias)
    op.execute("DROP TABLE IF EXISTS variantes_producto CASCADE;")
    op.execute("DROP TABLE IF EXISTS imagenes_producto CASCADE;")
    op.execute("DROP TABLE IF EXISTS productos CASCADE;")
    op.execute("DROP TABLE IF EXISTS categorias CASCADE;")
    op.execute("DROP TABLE IF EXISTS usuarios CASCADE;")

    # 2. Eliminar los tipos ENUM
    op.execute("DROP TYPE IF EXISTS tipo_corte_enum;")
    op.execute("DROP TYPE IF EXISTS tipo_producto_enum;")
    op.execute("DROP TYPE IF EXISTS rol_enum;")