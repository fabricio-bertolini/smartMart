# Import necessary libraries
import pandas as pd
from sqlalchemy import create_engine
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection setup using environment variables
DATABASE_URL = f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
engine = create_engine(DATABASE_URL)

# Path to the CSV file  
csv_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'Downloads', 'sales.csv')

try:
    # Read the CSV file
    df = pd.read_csv(csv_path)

    # Always ignore the 'id' column if present
    if 'id' in df.columns:
        df = df.drop(columns=['id'])

    # Ensure required columns exist
    required_columns = ['product_id', 'quantity', 'total_price', 'date']
    for col in required_columns:
        if col not in df.columns:
            raise ValueError(f"Missing required column: {col}")

    # Drop any extra columns except the required ones
    df = df[required_columns]

    # Drop rows with any missing values
    df = df.dropna(subset=required_columns)

    # Convert types
    df['product_id'] = df['product_id'].astype(int)
    df['quantity'] = df['quantity'].astype(int)
    df['total_price'] = df['total_price'].astype(float)
    df['date'] = pd.to_datetime(df['date']).dt.strftime('%Y-%m-%d')

    print("Prepared DataFrame to import:")
    print(df.head())

    df.to_sql('sales', engine, if_exists='append', index=False, method='multi')
    print(f"Successfully imported {len(df)} sales records")

except FileNotFoundError:
    print(f"Error: Could not find file {csv_path}")
except ValueError as ve:
    print(f"Error with CSV format: {ve}")
except Exception as e:
    print(f"Error importing sales data: {e}")