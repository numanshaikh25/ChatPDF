"""Reconcile missing DB head revision

This is a no-op stub that bridges the gap between the revision recorded
in alembic_version (b2c3d4e5f6a7) and the last committed migration
(a1b2c3d4e5f6). The file was never committed to the repo, so Alembic
could not locate it on startup.

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-04-21 00:01:00.000000

"""

from typing import Sequence, Union

# revision identifiers, used by Alembic.
revision: str = "b2c3d4e5f6a7"
down_revision: Union[str, None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
