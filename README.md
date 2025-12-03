
# Multi Weather App (Open-Meteo + Local Icons)

Simple multi-city weather app:
- Node/Express backend proxy to Open-Meteo (no API key required)
- Frontend: HTML + CSS + vanilla JS with sliding carousel and local icon pack

## Run locally

### Backend
```bash
cd server
npm install
npm start
# (runs on http://localhost:4000)
```

### Frontend
Open `frontend/index.html` using Live Server or a static server:
```bash
# from project root
cd frontend
npx http-server -p 8080
# open http://localhost:8080
```

## Icons
PNG icons are included in `frontend/assets/weather-icons/` with names matching the app mapping.
