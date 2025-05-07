# SmartMart

A full-stack inventory management system built with FastAPI and React.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- Python (v3.10 or v3.11)
- pip package manager

## Features

- 📊 Sales dashboard with interactive charts
- 📦 Product management with CSV import/export
- 🏷️ Category management
- 📈 Sales tracking and reporting
- 💹 Profit analysis

## Technology Stack

- **Frontend**: React + Vite, TypeScript, Tailwind CSS, Ant Design
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL
- **Data**: Pandas for CSV processing
- **Charts**: Chart.js/React-Chartjs-2

## Setting up the Project
## Backend Setup

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
# Update pip first
python -m pip install --upgrade pip
pip install --upgrade setuptools wheel

# Clean environment and cache
pip cache purge

# Install packages
pip install -r requirements.txt
```

4. Run the server:
```bash
uvicorn main:app --reload
```

## Frontend Setup

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

Visit `http://localhost:3000` to access the application.

## Running the Project

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. In a new terminal, start the frontend development server:
```bash
cd frontend
npm run dev
```
3. Open your browser and navigate to `http://localhost:3000`

## API Documentation

The API documentation is available at `http://localhost:8000/docs` when the backend server is running.

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

## Development

To set up the development environment:

1. Install backend dependencies and start the server
2. Install frontend dependencies and start the development server
3. Access the application at http://localhost:3000

## Testing

### Backend Tests
```bash
cd backend
pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## Deployment

### Docker Deployment
```bash
docker-compose up -d
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Environment Variables

Create `.env` files in both backend and frontend directories:

```env
# Backend (.env)
DATABASE_URL=sqlite:///./smartmart.db
JWT_SECRET=your-secret-key
CORS_ORIGINS=http://localhost:3000

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Security

### Rate Limiting
The API implements rate limiting of 100 requests per minute per IP address.

### Authentication
JWT-based authentication is required for all protected endpoints.

### Best Practices
- Keep JWT_SECRET secure and unique per environment
- Rotate secrets regularly
- Use HTTPS in production
- Implement proper input validation

## Performance

### Optimization Tips
1. Database Indexing
   - Index frequently queried fields
   - Use composite indexes for common query patterns

2. Caching Strategy
   - Redis cache for frequently accessed data
   - Browser caching for static assets

3. API Optimization
   - Use pagination for large datasets
   - Implement query optimization
   - Enable compression

## Monitoring

Access monitoring endpoints at:
- `/metrics` - System metrics
- `/health` - System health status
- `/stats` - API usage statistics

## Troubleshooting

Common issues and solutions:

1. Database Connection Issues
   - Verify database URL in `.env`
   - Check database permissions

2. CORS Errors
   - Ensure frontend URL is listed in CORS_ORIGINS
   - Check API URL in frontend environment

3. CSV Import Failures
   - Verify CSV column names match expected format
   - Check file encoding (UTF-8 required)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT License - See LICENSE file for details