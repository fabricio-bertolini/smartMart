-- Drop and recreate schema to remove all objects
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Drop tables in correct order (child tables first)
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Drop sequences
DROP SEQUENCE IF EXISTS sales_id_seq CASCADE;
DROP SEQUENCE IF EXISTS products_id_seq CASCADE;
DROP SEQUENCE IF EXISTS categories_id_seq CASCADE;

-- Create database (run this separately if needed)
-- CREATE DATABASE smartmart;

-- Create sequences for auto-incrementing IDs
CREATE SEQUENCE IF NOT EXISTS categories_id_seq;
CREATE SEQUENCE IF NOT EXISTS products_id_seq;
CREATE SEQUENCE IF NOT EXISTS sales_id_seq;

-- Create Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY DEFAULT nextval('categories_id_seq'),
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Create Products table
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY DEFAULT nextval('products_id_seq'),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price FLOAT NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    brand VARCHAR(100) NOT NULL
);

-- Create Sales table
CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY DEFAULT nextval('sales_id_seq'),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    total_price FLOAT NOT NULL,
    date DATE NOT NULL
);

-- Insert sample categories
INSERT INTO categories (name) VALUES 
    ('Electronics'),
    ('Groceries'),
    ('Clothing'),
    ('Home & Garden')
ON CONFLICT (name) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, price, category_id, brand) VALUES 
    ('Smartphone', 'Latest model smartphone', 699.99, 1, 'TechBrand'),
    ('Laptop', 'Business laptop', 999.99, 1, 'ComputerCo'),
    ('Bread', 'Fresh whole wheat bread', 3.99, 2, 'BakeryCo'),
    ('T-Shirt', 'Cotton T-Shirt', 19.99, 3, 'FashionBrand')
ON CONFLICT (name) DO NOTHING;

-- Insert sample sales data
INSERT INTO sales (product_id, quantity, total_price, date) VALUES 
    (1, 5, 3499.95, '2023-01-15'),
    (2, 3, 2999.97, '2023-01-16'),
    (3, 50, 199.50, '2023-01-17'),
    (4, 20, 399.80, '2023-01-18');
