from alembic import op

revision = '2024_01_10_03'
down_revision = '2024_01_10_02'
branch_labels = None
depends_on = None

def upgrade():
    # We don't actually need to do anything since 'profit' was just a property
    pass

def downgrade():
    pass
