from alembic import op
import sqlalchemy as sa

revision = '2024_01_10_07'
down_revision = '2024_01_10_06'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('products', sa.Column('brand', sa.String(100), nullable=True))

def downgrade():
    op.drop_column('products', 'brand')
