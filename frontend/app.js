const API_BASE = "https://multi-city-wheather.onrender.com";
const citiesContainer = document.getElementById('citiesContainer');
const addCityForm = document.getElementById('addCityForm');
const cityInput = document.getElementById('cityInput');
const refreshAllBtn = document.getElementById('refreshAllBtn');

let cities = [];

const iconMap = {
  "0": "sunny.png",
  "1": "partly-cloudy.png",
  "2": "cloudy.png",
  "3": "cloudy.png",
  "45": "fog.png",
  "48": "fog.png",
  "51": "light-rain.png",
  "53": "light-rain.png",
  "55": "light-rain.png",
  "56": "hail.png",
  "57": "hail.png",
  "61": "rain.png",
  "63": "rain.png",
  "65": "heavy-rain.png",
  "66": "hail.png",
  "67": "hail.png",
  "71": "snow.png",
  "73": "snow.png",
  "75": "snow.png",
  "77": "snow.png",
  "80": "rain-showers.png",
  "81": "rain-showers.png",
  "82": "rain-showers.png",
  "85": "snow-showers.png",
  "86": "snow-showers.png",
  "95": "thunder.png",
  "96": "thunder-hail.png",
  "99": "thunder-hail.png"
};

function loadState(){
  const s = localStorage.getItem('multiWeather.cities');
  if(s) cities = JSON.parse(s);
}
function saveState(){ localStorage.setItem('multiWeather.cities', JSON.stringify(cities)); }

async function fetchWeather(city){
  const res = await fetch(`${API_BASE}/weather?city=${encodeURIComponent(city)}`);
  if(!res.ok) throw new Error('City not found');
  return await res.json();
}

function createCard(data){
  const card = document.createElement('div');
  card.className = 'card';

  const code = data.current.weather_code;
  const file = iconMap[code] || 'sunny.png';
  const iconUrl = `assets/weather-icons/${file}`;

  card.innerHTML = `
    <div class="card-header">
      <div class="city">${data.city}, ${data.country || ''}</div>
      <div class="temp">${Math.round(data.current.temperature)}°C</div>
    </div>
    <img class="weather-icon" src="${iconUrl}" alt="icon">
    <div class="card-details">
      <div>${data.current.weather_text || ''}</div>
      <div>Wind: ${data.current.windspeed ?? '—'}</div>
    </div>
    <button class="remove-btn">Remove</button>
  `;

  card.querySelector('.remove-btn').onclick = () => {
    cities = cities.filter(c => c.toLowerCase() !== data.city.toLowerCase());
    saveState();
    renderAll();
  };

  return card;
}

async function renderAll(){
  citiesContainer.innerHTML = '';
  if(cities.length === 0){
    citiesContainer.innerHTML = '<p style="color:rgba(255,255,255,0.7);padding:14px">No cities added. Add a city above.</p>';
    return;
  }
  for(const city of cities){
    const placeholder = document.createElement('div');
    placeholder.className = 'card';
    placeholder.textContent = `Loading ${city}...`;
    citiesContainer.appendChild(placeholder);

    try{
      const data = await fetchWeather(city);
      const card = createCard(data);
      citiesContainer.replaceChild(card, placeholder);
    }catch(err){
      placeholder.textContent = `${city} — Not found`;
    }
  }
}

addCityForm.addEventListener('submit', e => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if(!city) return;
  if(cities.find(c => c.toLowerCase() === city.toLowerCase())){
    cityInput.value = '';
    return;
  }
  cities.push(city);
  saveState();
  cityInput.value = '';
  renderAll();
});

refreshAllBtn.addEventListener('click', renderAll);

function enableDragCarousel(){
  const carousel = document.querySelector('.carousel');
  let isDown=false, startX, scrollLeft;
  if(!carousel) return;
  carousel.addEventListener('mousedown', (e)=>{ isDown=true; startX = e.pageX - carousel.offsetLeft; scrollLeft = carousel.scrollLeft; carousel.classList.add('active') });
  carousel.addEventListener('mouseleave', ()=>{ isDown=false; carousel.classList.remove('active') });
  carousel.addEventListener('mouseup', ()=>{ isDown=false; carousel.classList.remove('active') });
  carousel.addEventListener('mousemove', (e)=>{ if(!isDown) return; e.preventDefault(); const x = e.pageX - carousel.offsetLeft; const walk = (x - startX) * 2; carousel.scrollLeft = scrollLeft - walk; });
}

loadState();
renderAll();
enableDragCarousel();
