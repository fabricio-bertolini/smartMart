"""remove created_at columns

Revision ID: 2024_99_98_remove
Revises: 2024_99_99_drop_all
Create Date: 2024-99-99 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '2024_99_98_remove'
down_revision = '2024_99_99_drop_all'
branch_labels = None
depends_on = None

def upgrade():
    # Drop created_at columns from all tables that have it
    op.execute('ALTER TABLE IF EXISTS categories DROP COLUMN IF EXISTS created_at')
    op.execute('ALTER TABLE IF EXISTS products DROP COLUMN IF EXISTS created_at')

def downgrade():
    # Add back created_at columns if needed to rollback
    op.execute('ALTER TABLE categories ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP')
    op.execute('ALTER TABLE products ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP')
