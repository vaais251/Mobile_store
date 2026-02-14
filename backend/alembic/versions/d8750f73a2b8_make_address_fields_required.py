"""make_address_fields_required

Revision ID: d8750f73a2b8
Revises: f38ec14738e4
Create Date: 2026-02-15 00:02:34.907661
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic
revision: str = 'd8750f73a2b8'
down_revision: Union[str, None] = 'f38ec14738e4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # First, fill in any existing NULL values with empty strings
    op.execute("UPDATE users SET address_street = '' WHERE address_street IS NULL")
    op.execute("UPDATE users SET address_city = '' WHERE address_city IS NULL")

    # Now make the columns NOT NULL
    op.alter_column('users', 'address_street',
               existing_type=sa.TEXT(),
               nullable=False,
               server_default='')
    op.alter_column('users', 'address_city',
               existing_type=sa.VARCHAR(length=100),
               nullable=False,
               server_default='')


def downgrade() -> None:
    op.alter_column('users', 'address_city',
               existing_type=sa.VARCHAR(length=100),
               nullable=True)
    op.alter_column('users', 'address_street',
               existing_type=sa.TEXT(),
               nullable=True)
