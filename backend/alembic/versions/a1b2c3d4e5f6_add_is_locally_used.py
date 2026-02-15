"""add is_locally_used column

Revision ID: a1b2c3d4e5f6
Revises: f38ec14738e4
Create Date: 2026-02-15 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "d8750f73a2b8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "phone_listings",
        sa.Column(
            "is_locally_used",
            sa.Boolean(),
            nullable=True,
            comment="Whether the phone was used locally in Pakistan",
        ),
    )


def downgrade() -> None:
    op.drop_column("phone_listings", "is_locally_used")
