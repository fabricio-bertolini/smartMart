from alembic import op
import sqlalchemy as sa
from datetime import date

revision = '2024_01_10_06'
down_revision = '2024_01_10_05'
branch_labels = None
depends_on = None

def upgrade():
    # Move date column to be last by recreating it
    op.drop_column('sales', 'date')
    op.add_column('sales', sa.Column('date', sa.Date(), nullable=False, server_default=sa.text("NOW()")))

def downgrade():
    pass  # No need to restore original order
