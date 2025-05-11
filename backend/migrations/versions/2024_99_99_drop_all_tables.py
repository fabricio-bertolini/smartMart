"""drop all tables

Revision ID: 2024_99_99_drop_all
Revises: 2024_01_17_01
Create Date: 2024-99-99 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '2024_99_99_drop_all'
down_revision = '2024_01_17_01'
branch_labels = None
depends_on = None

def upgrade():
    # Drop all tables with raw SQL and CASCADE
    op.execute('DROP TABLE IF EXISTS product_variants CASCADE')
    op.execute('DROP TABLE IF EXISTS sales CASCADE')  
    op.execute('DROP TABLE IF EXISTS products CASCADE')
    op.execute('DROP TABLE IF EXISTS categories CASCADE')
    op.execute('DROP SEQUENCE IF EXISTS categories_id_seq CASCADE')
    op.execute('DROP SEQUENCE IF EXISTS products_id_seq CASCADE') 
    op.execute('DROP SEQUENCE IF EXISTS sales_id_seq CASCADE')

def downgrade():
    pass
