
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

async function geocodeCity(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search`;
  const res = await axios.get(url, { params: { name: city, count: 1 }});
  if (!res.data || !res.data.results || res.data.results.length === 0) {
    const e = new Error('City not found');
    e.status = 404;
    throw e;
  }
  return res.data.results[0];
}

async function getWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast`;
  const res = await axios.get(url, {
    params: {
      latitude: lat,
      longitude: lon,
      current_weather: true,
      timezone: 'UTC'
    }
  });
  return res.data;
}

const weatherCodeText = {
  0: 'Clear',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Drizzle: Light',
  53: 'Drizzle: Moderate',
  55: 'Drizzle: Dense',
  56: 'Freezing Drizzle',
  57: 'Freezing Drizzle (dense)',
  61: 'Rain: Slight',
  63: 'Rain: Moderate',
  65: 'Rain: Heavy',
  66: 'Freezing Rain',
  67: 'Freezing Rain (heavy)',
  71: 'Snow: Slight',
  73: 'Snow: Moderate',
  75: 'Snow: Heavy',
  77: 'Snow grains',
  80: 'Rain showers: Slight',
  81: 'Rain showers: Moderate',
  82: 'Rain showers: Violent',
  85: 'Snow showers: Slight',
  86: 'Snow showers: Heavy',
  95: 'Thunderstorm: Slight or moderate',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail'
};

app.get('/api/weather', async (req, res) => {
  try {
    const city = req.query.city;
    if (!city) return res.status(400).json({ error: 'city query param required' });

    const geo = await geocodeCity(city);
    const w = await getWeather(geo.latitude, geo.longitude);

    const cw = w.current_weather || {};
    const response = {
      city: geo.name,
      country: geo.country,
      latitude: geo.latitude,
      longitude: geo.longitude,
      current: {
        temperature: cw.temperature,
        windspeed: cw.windspeed,
        winddirection: cw.winddirection,
        weather_code: cw.weathercode,
        weather_text: weatherCodeText[cw.weathercode] || 'Unknown'
      }
    };

    return res.json(response);
  } catch (err) {
    console.error(err.message || err);
    if (err.status) return res.status(err.status).json({ error: err.message });
    res.status(500).json({ error: 'internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Free Open-Meteo proxy running on http://localhost:${PORT}`);
});
