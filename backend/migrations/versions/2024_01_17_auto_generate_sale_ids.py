"""auto generate sale ids

Revision ID: 2024_01_17_01
Revises: None
Create Date: 2024-01-17 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '2024_01_17_01'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create a temporary table with the desired column order
    op.execute('''
        CREATE TABLE sales_new (
            id SERIAL PRIMARY KEY,
            product_id INTEGER REFERENCES products(id),
            quantity INTEGER NOT NULL,
            total_price FLOAT NOT NULL,
            date DATE NOT NULL
        )
    ''')
    
    # Copy data from old table to new table, including id
    op.execute('''
        INSERT INTO sales_new (id, product_id, quantity, total_price, date)
        SELECT id, product_id, quantity, total_price, date FROM sales
    ''')
    
    # Drop old table and rename new table
    op.execute('DROP TABLE sales')
    op.execute('ALTER TABLE sales_new RENAME TO sales')

def downgrade():
    # Create a temporary table with the old structure
    op.execute('''
        CREATE TABLE sales_new (
            product_id INTEGER REFERENCES products(id),
            quantity INTEGER NOT NULL,
            total_price FLOAT NOT NULL,
            date DATE NOT NULL,
            id INTEGER PRIMARY KEY
        )
    ''')
    
    # Copy data back
    op.execute('''
        INSERT INTO sales_new (id, product_id, quantity, total_price, date)
        SELECT id, product_id, quantity, total_price, date FROM sales
    ''')
    
    # Drop old table and rename new table
    op.execute('DROP TABLE sales')
    op.execute('ALTER TABLE sales_new RENAME TO sales')
