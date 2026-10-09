"""agregar campo personalizable a productos

Revision ID: 1e3e6da30b2c
Revises: ee0fc890d576
Create Date: 2026-10-09 09:46:46.744017

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1e3e6da30b2c'
down_revision = 'ee0fc890d576'
branch_labels = None
depends_on = None


def upgrade():
    # 1. Agregar la columna como nullable primero, con default en la BD
    op.add_column(
        'productos',
        sa.Column(
            'personalizable',
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )

    # 2. Opcionalmente, quitar el server_default (ya no es necesario)
    #    Dejarlo puesto no molesta, así que lo dejamos para simplificar.


def downgrade():
    op.drop_column('productos', 'personalizable')