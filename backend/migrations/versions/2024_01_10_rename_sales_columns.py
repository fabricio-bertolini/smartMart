from alembic import op

revision = '2024_01_10_02'
down_revision = '2024_01_10_01'
branch_labels = None
depends_on = None

def upgrade():
    op.alter_column('sales', 'transaction_date', new_column_name='date')

def downgrade():
    op.alter_column('sales', 'date', new_column_name='transaction_date')
