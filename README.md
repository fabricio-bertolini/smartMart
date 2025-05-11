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
- **Backend:** FastAPI, SQLAlchemy, PostgreSQL, Pandas
- **DevOps:** Docker Compose, Alembic (migrations)

---

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Python (v3.10+)
- pip
- PostgreSQL

### Backend Setup

```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

# Set up your .env file (see below)
# Run migrations or initialize DB as needed

uvicorn main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Docker Compose (optional)

```bash
docker-compose up --build
```

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

## API Endpoints

- **Products**
  - `POST /api/products` — Add a new product
  - `GET /api/products` — List products (supports `category_id` filter, returns an array)
  - `POST /api/import/csv` — Import products from CSV (`type=products`)
  - `GET /api/products/export-csv` — Export products as CSV

- **Categories**
  - `POST /api/categories` — Add a new category
  - `GET /api/categories` — List categories
  - `POST /api/import/csv` — Import categories from CSV (`type=categories`)

- **Sales**
  - `GET /api/sales/` — List sales
  - `PUT /api/sales/{sale_id}` — Edit a sale
  - `POST /api/import/csv` — Import sales from CSV (`type=sales`)
  - `GET /api/sales/export-csv` — Export sales as CSV
  - `GET /api/sales/stats` — Get sales and profit stats (for dashboard)

---

## Usage

1. **Dashboard:**  
   View sales and profit charts, filter by year and category.  
   **Note:** The year filter in the dashboard is fully functional and will update the charts and counters based on the selected year.

2. **Products:**  
   - Register new products via form.
   - Filter products by category.
   - Import/export products via CSV.
   - **API returns products as a plain array, not wrapped in a `data` key.**

3. **Categories:**  
   - Add new categories.
   - Import categories via CSV.

4. **Sales:**  
   - View and edit sales data inline.
   - Import/export sales via CSV.

---

## CSV Formats

- **Products:**  
  `name,description,price,category_id,brand`

- **Categories:**  
  `name`

- **Sales:**  
  `product_id,quantity,total_price,date`

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

- **Dashboard not showing data:**  
  Ensure both backend and frontend are running. Check browser console/network tab. Make sure `/api/sales/stats` returns data.  
  **If the dashboard charts/counters are empty, ensure you have selected a year with data using the year filter.**

- **CORS errors:**  
  Confirm `CORS_ORIGINS` in backend `.env` matches your frontend URL.

- **CSV Import Fails:**  
  Ensure your CSV columns match the expected format.

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

## License

MIT License

---

## Public URL

*If deployed, add your public URL here.*