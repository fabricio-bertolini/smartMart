# SmartMart

A full-stack inventory management system built with FastAPI and React.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- Python (v3.10 or v3.11)
- pip package manager
- PostgreSQL

## Features

- 📊 Sales dashboard with interactive charts
- 📦 Product management with CSV import/export
- 🏷️ Category management (add, list)
- 📈 Sales tracking and reporting
- 💹 Profit analysis

## Technology Stack

- **Frontend**: React + Next.js, TypeScript, Tailwind CSS, Ant Design
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL
- **Data**: Pandas for CSV processing
- **Charts**: Chart.js/React-Chartjs-2

## Setting up the Project

### Backend Setup

1. Navigate to the backend directory:
    ```bash
    cd backend
    ```

2. Create a virtual environment:
    ```bash
    # On Windows:
    python -m venv venv
    .\venv\Scripts\activate

    # On macOS/Linux:
    python3 -m venv venv
    source venv/bin/activate
    ```

3. Install prerequisites and dependencies:
    ```bash
    python -m pip install --upgrade pip
    pip install --upgrade setuptools wheel
    pip cache purge
    pip install -r requirements.txt
    ```

4. Run the server:
    ```bash
    uvicorn main:app --reload
    ```
    The backend will be available at [http://localhost:8000](http://localhost:8000).

### Frontend Setup

1. Navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Run the development server:
    ```bash
    npm run dev
    ```
    The frontend will be available at [http://localhost:3000](http://localhost:3000).

**Note:**  
The frontend (Next.js) is configured to proxy API requests starting with `/api` to the backend (`http://localhost:8000`).  
Make sure both servers are running for full functionality.

## Running the Project

1. Start the backend server:
    ```bash
    cd backend
    uvicorn main:app --reload
    ```

2. In a new terminal, start the frontend development server:
    ```bash
    cd frontend
    npm run dev
    ```

3. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## API Documentation

The API documentation is available at [http://localhost:8000/docs](http://localhost:8000/docs) when the backend server is running.

## Project Structure

```
SmartMart/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   └── models.py
│   │   ├── routes/
│   │   │   ├── products.py
│   │   │   ├── categories.py
│   │   │   └── sales.py
│   │   └── database.py
│   ├── requirements.txt
│   └── main.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   ├── ProductList.tsx
│   │   │   ├── CsvUpload.tsx
│   │   │   └── SalesEditor.tsx
│   │   └── pages/
│   │       └── App.tsx
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## Environment Variables

Create `.env` files in both backend and frontend directories:

```env
# Backend (.env)
DATABASE_URL=postgresql://user:password@localhost:5432/smartmart
JWT_SECRET=your-secret-key
CORS_ORIGINS=http://localhost:3000

# Frontend (.env)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## CSV Import

- **Products:**  
  POST `/api/products/csv` with a CSV file containing columns: `name`, `price`, `category_id`, etc.

- **Categories:**  
  POST `/api/categories/csv` with a CSV file containing at least the column: `name`.

  Example CSV:
  ```
  name
  Electronics
  Groceries
  Clothing
  ```

## Troubleshooting

- **Dashboard not showing data:**  
  Ensure both backend and frontend are running.  
  Check browser console and network tab for errors.  
  Make sure `/api/sales/stats` returns data from the backend.

- **CORS errors:**  
  Confirm `CORS_ORIGINS` in backend `.env` matches your frontend URL.

- **CSV Import Fails:**  
  Ensure your CSV columns match the expected format (`name`, `price`, `category_id`, etc).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT License - See LICENSE file for details