from alembic import op
import sqlalchemy as sa

revision = '2024_01_10_09'
down_revision = '2024_01_10_08'
branch_labels = None
depends_on = None

def upgrade():
    op.drop_column('products', 'discount_percentage')
    op.drop_column('products', 'tax_rate')

def downgrade():
    op.add_column('products', sa.Column('discount_percentage', sa.Float(), server_default='0.0'))
    op.add_column('products', sa.Column('tax_rate', sa.Float(), server_default='0.0'))
