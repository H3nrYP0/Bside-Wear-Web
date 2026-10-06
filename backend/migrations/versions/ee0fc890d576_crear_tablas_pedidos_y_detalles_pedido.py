"""crear tablas pedidos y detalles_pedido

Revision ID: ee0fc890d576
Revises: b8d07486fc46
Create Date: 2026-10-06 17:19:04.303688

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ee0fc890d576'
down_revision = 'b8d07486fc46'
branch_labels = None
depends_on = None


def upgrade():
    # =========================================
    # 1. Crear el tipo ENUM (idempotente)
    # =========================================
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_pedido_enum') THEN
                CREATE TYPE estado_pedido_enum AS ENUM (
                    'pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'
                );
            END IF;
        END$$;
    """)

    # =========================================
    # 2. Tabla pedidos
    # =========================================
    op.execute("""
        CREATE TABLE pedidos (
            id SERIAL PRIMARY KEY,
            usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
            estado estado_pedido_enum NOT NULL DEFAULT 'pendiente',
            total NUMERIC(12, 2) NOT NULL DEFAULT 0,
            nombre_cliente VARCHAR(120) NOT NULL,
            telefono_cliente VARCHAR(30) NOT NULL,
            direccion_envio VARCHAR(255) NOT NULL,
            notas TEXT,
            fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    """)
    op.execute("CREATE INDEX ix_pedidos_usuario_id ON pedidos (usuario_id);")

    # =========================================
    # 3. Tabla detalles_pedido
    # =========================================
    op.execute("""
        CREATE TABLE detalles_pedido (
            id SERIAL PRIMARY KEY,
            pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
            variante_id INTEGER NOT NULL REFERENCES variantes_producto(id) ON DELETE RESTRICT,
            producto_id INTEGER NOT NULL,
            producto_nombre VARCHAR(150) NOT NULL,
            variante_talla VARCHAR(10),
            variante_color VARCHAR(30),
            cantidad INTEGER NOT NULL,
            precio_unitario NUMERIC(10, 2) NOT NULL,
            subtotal NUMERIC(12, 2) NOT NULL
        );
    """)
    op.execute("CREATE INDEX ix_detalles_pedido_pedido_id ON detalles_pedido (pedido_id);")
    op.execute("CREATE INDEX ix_detalles_pedido_variante_id ON detalles_pedido (variante_id);")


def downgrade():
    # 1. Eliminar tablas
    op.execute("DROP TABLE IF EXISTS detalles_pedido CASCADE;")
    op.execute("DROP TABLE IF EXISTS pedidos CASCADE;")

    # 2. Eliminar el tipo ENUM
    op.execute("DROP TYPE IF EXISTS estado_pedido_enum;")