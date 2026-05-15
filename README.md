# Weather App (Full Stack)

Brief full-stack weather application with CRUD history, date-range weather retrieval, exports, and PM Accelerator info section.

## What Was Implemented

- Full CRUD weather records (`create`, `read`, `update`, `delete`)
- Date-range support with validation (`startDate <= endDate`)
- Location resolution/validation endpoint (`GET /api/geo`)
- Current weather + forecast + recent historical support
- Resilient geocoding with retries and fallback providers
- Export support (JSON, CSV, XML, PDF, Markdown)
- Responsive frontend including:
  - Weather history cards
  - Date-range editing modal
  - PM Accelerator information section (with presenter name)

## Project Structure

- `backend/` - Express + MongoDB API
- `frontend/` - React + Vite client

## Prerequisites

- Node.js 18+ (recommended Node 20+)
- npm 9+
- MongoDB Atlas URI or local MongoDB

## Environment Variables (`backend/.env`)

Required:

- `MONGODB_URI`
- `PORT` (example: `5000`)
- `WEATHER_API_KEY`

Optional:

- `WEATHER_API_TIMEOUT_MS` (example: `15000`)
- `GOOGLE_MAPS_API_KEY`
- `YOUTUBE_API_KEY`
- `NODE_ENV`

## Run Locally

### 1) Install backend dependencies

```bash
cd backend
npm install
```

### 2) Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 3) Start backend

```bash
cd ../backend
npm start
```

### 4) Start frontend

```bash
cd ../frontend
npm run dev
```

Frontend runs on Vite dev URL (usually `http://localhost:5173`).
Backend runs on `http://localhost:5000` (unless changed by `PORT`).

## API Endpoints

- `POST /api/weather` - Create weather record
- `GET /api/weather` - Get all weather records
- `GET /api/weather/:id` - Get weather record by ID
- `GET /api/weather/location/:name` - Get weather by location
- `GET /api/geo` - Resolve/validate location
- `PUT /api/weather/:id` - Update weather record
- `DELETE /api/weather/:id` - Delete weather record
- `GET /api/export/weather` - Export weather data

## Notes

- If geocoding is slow, increase `WEATHER_API_TIMEOUT_MS`.
- Geocoding includes retry + fallback logic for better reliability.
- If Atlas DNS issues occur, use local MongoDB temporarily.
