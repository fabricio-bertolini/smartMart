-- Create database (run this separately if needed)
-- CREATE DATABASE smartmart;

-- Create sequences for auto-incrementing IDs
CREATE SEQUENCE IF NOT EXISTS categories_id_seq;
CREATE SEQUENCE IF NOT EXISTS products_id_seq;
CREATE SEQUENCE IF NOT EXISTS sales_id_seq;

-- Create Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY DEFAULT nextval('categories_id_seq'),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Products table
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY DEFAULT nextval('products_id_seq'),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER DEFAULT 0,
    category_id INTEGER REFERENCES categories(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Sales table
CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY DEFAULT nextval('sales_id_seq'),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    profit DECIMAL(10,2) NOT NULL,
    transaction_date DATE NOT NULL
);

-- Insert sample data
INSERT INTO categories (name) VALUES 
    ('Electronics'),
    ('Groceries'),
    ('Clothing'),
    ('Home & Garden');

INSERT INTO products (name, description, price, stock, category_id) VALUES 
    ('Smartphone', 'Latest model smartphone', 699.99, 50, 1),
    ('Laptop', 'Business laptop', 999.99, 30, 1),
    ('Bread', 'Fresh whole wheat bread', 3.99, 100, 2),
    ('T-Shirt', 'Cotton T-Shirt', 19.99, 200, 3);

-- Insert sample sales data
INSERT INTO sales (product_id, quantity, profit, transaction_date) VALUES 
    (1, 5, 500.00, '2023-01-15'),
    (2, 3, 600.00, '2023-01-16'),
    (3, 50, 100.00, '2023-01-17'),
    (4, 20, 200.00, '2023-01-18');
