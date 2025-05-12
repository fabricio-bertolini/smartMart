# SmartMart

A full-stack inventory and sales management system built with FastAPI (Python) and Next.js (React).

---

## Features

- 📊 **Dashboard:** Interactive charts for sales and profit by month/year.
- 📦 **Product Management:** Add, edit, filter, and import/export products (CSV).
- 🏷️ **Category Management:** Add, list, and import categories.
- 🧾 **Sales Management:** View, edit, and import/export sales data.
- 🗂️ **CSV Import/Export:** Products, categories, and sales.
- 🖱️ **Inline Editing:** Edit sales data directly in the UI.
- 🎨 **Modern UI:** Responsive, accessible, and styled with Tailwind CSS and Ant Design.
- 🛡️ **Error Handling:** User-friendly feedback for errors and actions.

---

## Technology Stack

- **Frontend:** Next.js (React), TypeScript, Tailwind CSS, Ant Design, Chart.js
- **Backend:** FastAPI, SQLAlchemy, PostgreSQL (or SQLite), Pandas
- **DevOps:** Docker Compose, Alembic (migrations)

---

## Setup Instructions

### Prerequisites

- Python 3.10+
- Node.js 18+
- Docker & Docker Compose (recommended for local setup)
- (Optional) SQLite (default), or configure for another DB

---

## Backend (API)

### 1. Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
```

### 2. Database

- By default, uses SQLite (`smartmart.db`).
- To initialize tables and seed data:
  ```bash
  python scripts/seed_database.py
  ```
- To run migrations (if needed):
  ```bash
  alembic upgrade head
  ```

### 3. Run the API

```bash
uvicorn main:app --reload
```
- The API will be available at `http://localhost:8000`

### 4. API Endpoints

- `POST /products` — Insert a new product
- `GET /products` — List products (with sales and profit)
- `GET /categories` — List categories
- `POST /products/csv` — Insert products from a CSV file
- `GET /sales` — List sales (with profit)
- `POST /categories` — Insert a new category
- `GET /products/export` — Download products as CSV
- `GET /sales/export` — Download sales as CSV

---

## Frontend

### 1. Setup

```bash
cd frontend
npm install
```

### 2. Run the Frontend

```bash
npm run dev
```
- The app will be available at `http://localhost:3000`

### 3. Features

- Dashboard with sales and profit charts (bar/line)
- Product registration form
- CSV upload for products, categories, and sales
- Filter products by category
- Edit sales and prices per month (if implemented)
- Add new categories
- Download CSV for products/sales
- Dark mode toggle

---

## Docker (Recommended)

To run both backend and frontend with Docker:

```bash
docker-compose up --build
```
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`

---

## Environment Variables

Create `.env` files in both backend and frontend directories:

**Backend (.env):**
```
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smartmart
CORS_ORIGINS=http://localhost:3000
```

**Frontend (.env):**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## CSV Formats

- **Products:**  `name,description,price,category_id,brand`
- **Categories:**  `name`
- **Sales:**  `product_id,quantity,total_price,date`

---

## Project Structure

```
SmartMart/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── routes/
│   │   └── database.py
│   ├── requirements.txt
│   └── main.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── styles/
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

---

## Troubleshooting

- **Dashboard not showing data:**  Ensure both backend and frontend are running. Check browser console/network tab. Make sure `/api/sales/stats` returns data.
- **CORS errors:**  Confirm `CORS_ORIGINS` in backend `.env` matches your frontend URL.
- **CSV Import Fails:**  Ensure your CSV columns match the expected format.

---

## Questions

1. **First improvements with more time:**  
   - Add authentication/authorization (JWT, OAuth)
   - Implement pagination and search for product/sales lists
   - Add unit and integration tests
   - Improve error handling and validation
   - Add user roles (admin, staff, viewer)
   - Enhance dashboard with more analytics (e.g., top products, trends)

2. **Approach for price history:**  
   - Create a `price_history` table with product_id, price, and timestamp.
   - On price update, insert a new record.
   - For dashboard charts, query price changes over time and join with sales data.

3. **Supporting category discount percentage:**  
   - Add a `discount_percentage` field to the `categories` table.
   - On update, recalculate product prices in that category (or apply discount dynamically in queries/views).
   - Optionally, store both original and discounted prices for each product.

---

## License

MIT License

---

## Public URL

*If deployed, add your public URL here.*

## Contact

For any questions, please contact fabricio.v.bertolini@gmail.com.