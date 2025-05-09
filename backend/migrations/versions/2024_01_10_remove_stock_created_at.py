from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

revision = '2024_01_10_01'
down_revision = None
branch_labels = None
depends_on = None

def has_table(conn, table_name):
    return inspect(conn).has_table(table_name)

def has_column(conn, table_name, column_name):
    if not has_table(conn, table_name):
        return False
    insp = inspect(conn)
    columns = [c['name'] for c in insp.get_columns(table_name)]
    return column_name in columns

def upgrade():
    conn = op.get_bind()

    # Create tables if they don't exist
    if not has_table(conn, 'categories'):
        op.create_table(
            'categories',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('name', sa.String(100), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.Column('is_deleted', sa.Boolean(), default=False),
            sa.PrimaryKeyConstraint('id')
        )

    if not has_table(conn, 'products'):
        op.create_table(
            'products',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('name', sa.String(200), nullable=False),
            sa.Column('description', sa.String(), nullable=True),
            sa.Column('price', sa.Float(), nullable=False),
            sa.Column('category_id', sa.Integer(), nullable=True),
            sa.Column('status', sa.Enum('active', 'discontinued', name='productstatus'), nullable=True),
            sa.Column('discount_percentage', sa.Float(), nullable=True),
            sa.Column('tax_rate', sa.Float(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.Column('is_deleted', sa.Boolean(), default=False),
            sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ),
            sa.PrimaryKeyConstraint('id')
        )

    # Drop columns if they exist
    if has_column(conn, 'products', 'stock'):
        op.drop_column('products', 'stock')
    if has_column(conn, 'products', 'created_at'):
        op.drop_column('products', 'created_at')
    if has_column(conn, 'categories', 'created_at'):
        op.drop_column('categories', 'created_at')

def downgrade():
    conn = op.get_bind()
    
    # Add columns back
    if has_table(conn, 'products'):
        op.add_column('products', sa.Column('stock', sa.Integer(), nullable=True, server_default='0'))
        op.add_column('products', sa.Column('created_at', sa.DateTime(), nullable=True))
    if has_table(conn, 'categories'):
        op.add_column('categories', sa.Column('created_at', sa.DateTime(), nullable=True))
