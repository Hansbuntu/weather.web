const apiKey = 'bbbff497244e7e65a8e6b910f85e0593'; // OpenWeatherMap API key
const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('city');
const locationElem = document.getElementById('location');
const temperatureElem = document.getElementById('temperature');
const descriptionElem = document.getElementById('description');
const forecastContainer = document.getElementById('forecast-cards');

// Ensure map container exists
let map;
document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        map = L.map('map').setView([20, 0], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    }
});

async function getWeather(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
        );
        
        if (!response.ok) {
            throw new Error('City not found');
        }
        
        const data = await response.json();
        
        // Update location details
        locationElem.textContent = `${data.name}, ${data.sys.country}`;
        temperatureElem.textContent = `Temperature: ${data.main.temp}°C`;
        descriptionElem.textContent = `Condition: ${data.weather[0].description}`;
        
        // Center map and add marker
        const { lat, lon } = data.coord;
        
        // Clear previous markers
        if (map) {
            map.eachLayer((layer) => {
                if (layer instanceof L.Marker) {
                    map.removeLayer(layer);
                }
            });
            
            map.setView([lat, lon], 10);
            L.marker([lat, lon]).addTo(map)
                .bindPopup(`${data.name}, ${data.sys.country}`)
                .openPopup();
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert('Could not find weather for this location');
    }
}

async function getForecast(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
        );
        const data = await response.json();
        forecastContainer.innerHTML = '';
        const forecasts = data.list.filter((item) => item.dt_txt.includes('12:00:00'));
        forecasts.forEach((forecast) => {
            const card = document.createElement('div');
            card.classList.add('forecast-card');
            card.innerHTML = `
                <p>${new Date(forecast.dt_txt).toLocaleDateString()}</p>
                <p>Temp: ${forecast.main.temp}°C</p>
                <p>${forecast.weather[0].description}</p>
            `;
            forecastContainer.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching forecast data:', error);
    }
}

// Search event listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value;
    if (city) {
        getWeather(city);
        getForecast(city);
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value;
        if (city) {
            getWeather(city);
            getForecast(city);
        }
    }
});

// Geolocation on page load
function centerMapOnUserLocation() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
                );
                const data = await response.json();
                
                // Update location details
                locationElem.textContent = `${data.name}, ${data.sys.country}`;
                temperatureElem.textContent = `Temperature: ${data.main.temp}°C`;
                descriptionElem.textContent = `Condition: ${data.weather[0].description}`;
                
                // Center map
                if (map) {
                    map.setView([latitude, longitude], 10);
                    L.marker([latitude, longitude])
                        .addTo(map)
                        .bindPopup(`Your Location: ${data.name}`)
                        .openPopup();
                }
            } catch (error) {
                console.error('Error fetching location weather:', error);
            }
        },
        (error) => {
            console.error('Geolocation error:', error);
            alert('Unable to retrieve your location.');
        }
    );
}

// Trigger geolocation on page load
window.addEventListener('load', centerMapOnUserLocation);