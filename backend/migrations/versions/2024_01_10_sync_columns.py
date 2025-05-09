from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

revision = '2024_01_10_04'
down_revision = '2024_01_10_03'
branch_labels = None
depends_on = None

def has_column(table_name, column_name):
    conn = op.get_bind()
    insp = inspect(conn)
    has_table = table_name in insp.get_table_names()
    if has_table:
        columns = [c['name'] for c in insp.get_columns(table_name)]
        return column_name in columns
    return False

def upgrade():
    # Rename transaction_date to date if it exists
    if has_column('sales', 'transaction_date'):
        op.alter_column('sales', 'transaction_date',
                    new_column_name='date',
                    existing_type=sa.Date())
    elif not has_column('sales', 'date'):
        op.add_column('sales', sa.Column('date', sa.Date(), nullable=False))

    # Ensure total_price exists
    if not has_column('sales', 'total_price'):
        op.add_column('sales', sa.Column('total_price', sa.Float(), nullable=False, server_default='0.0'))

    # Ensure cost_at_sale exists
    if not has_column('sales', 'cost_at_sale'):
        op.add_column('sales', sa.Column('cost_at_sale', sa.Float(), nullable=False, server_default='0.0'))

    # Ensure quantity exists
    if not has_column('sales', 'quantity'):
        op.add_column('sales', sa.Column('quantity', sa.Integer(), nullable=False, server_default='0'))

def downgrade():
    # Reverse the changes
    if has_column('sales', 'date'):
        op.alter_column('sales', 'date',
                    new_column_name='transaction_date',
                    existing_type=sa.Date())

    # Remove columns if they were added
    for column in ['cost_at_sale', 'total_price', 'quantity']:
        if has_column('sales', column):
            op.drop_column('sales', column)
