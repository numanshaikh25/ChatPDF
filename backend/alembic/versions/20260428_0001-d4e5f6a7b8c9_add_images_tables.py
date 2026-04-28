"""Add images and image_messages tables

Revision ID: d4e5f6a7b8c9
Revises: b2c3d4e5f6a7
Create Date: 2026-04-28 00:01:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "d4e5f6a7b8c9"
down_revision: Union[str, None] = "c3d4e5f6a7b8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "images",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("filename", sa.String(255), nullable=False),
        sa.Column("minio_key", sa.String(500), nullable=False),
        sa.Column("file_size", sa.BigInteger(), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="ready"),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )

    op.create_table(
        "image_messages",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "image_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("images.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("role", sa.String(20), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )

    op.create_index(
        "idx_image_messages_image_id_created_at",
        "image_messages",
        ["image_id", "created_at"],
    )


def downgrade() -> None:
    op.drop_index("idx_image_messages_image_id_created_at", table_name="image_messages")
    op.drop_table("image_messages")
    op.drop_table("images")
