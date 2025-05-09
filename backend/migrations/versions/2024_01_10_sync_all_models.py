from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect
from sqlalchemy.dialects.postgresql import ENUM

revision = '2024_01_10_08'
down_revision = '2024_01_10_07'
branch_labels = None
depends_on = None

def has_table(table_name):
    conn = op.get_bind()
    insp = inspect(conn)
    return table_name in insp.get_table_names()

def has_column(table_name, column_name):
    conn = op.get_bind()
    insp = inspect(conn)
    if has_table(table_name):
        columns = [c['name'] for c in insp.get_columns(table_name)]
        return column_name in columns
    return False

def upgrade():
    # Create enum type if needed
    try:
        op.execute("CREATE TYPE productstatus AS ENUM ('active', 'discontinued')")
    except:
        pass

    # Create product_variants table if it doesn't exist
    if not has_table('product_variants'):
        op.create_table(
            'product_variants',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('product_id', sa.Integer(), nullable=True),
            sa.Column('sku', sa.String(), nullable=True),
            sa.Column('attributes', sa.JSON(), nullable=True),
            sa.Column('price_adjustment', sa.Float(), default=0.0),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.Column('is_deleted', sa.Boolean(), default=False),
            sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
            sa.PrimaryKeyConstraint('id'),
        )

    # Add or update columns in existing tables
    if not has_column('products', 'brand'):
        op.add_column('products', sa.Column('brand', sa.String(100), nullable=True))
    if not has_column('products', 'discount_percentage'):
        op.add_column('products', sa.Column('discount_percentage', sa.Float(), server_default='0.0'))
    if not has_column('products', 'tax_rate'):
        op.add_column('products', sa.Column('tax_rate', sa.Float(), server_default='0.0'))

def downgrade():
    # Drop columns and tables in reverse order
    for column in ['brand', 'discount_percentage', 'tax_rate']:
        if has_column('products', column):
            op.drop_column('products', column)
    
    if has_table('product_variants'):
        op.drop_table('product_variants')
    
    try:
        op.execute('DROP TYPE productstatus')
    except:
        pass
