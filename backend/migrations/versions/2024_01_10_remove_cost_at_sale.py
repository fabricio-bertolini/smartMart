from alembic import op
import sqlalchemy as sa

revision = '2024_01_10_05'
down_revision = '2024_01_10_04'
branch_labels = None
depends_on = None

def upgrade():
    op.drop_column('sales', 'cost_at_sale')

def downgrade():
    op.add_column('sales', sa.Column('cost_at_sale', sa.Float(), nullable=False, server_default='0.0'))
