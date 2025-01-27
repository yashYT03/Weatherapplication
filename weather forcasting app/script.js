
    const apiKey = "5adf665071e6831bb7929d59ebf22d14"; // Replace with your weather API key
    const searchBtn = document.getElementById('searchBtn');
    const currentLocationBtn = document.getElementById('currentLocationBtn');
    const cityInput = document.getElementById('cityInput');
    const recentDropdown = document.getElementById('recentDropdown');
    const weatherDisplay = document.getElementById('weatherDisplay');
    const cityName = document.getElementById('cityName');
    const currentWeather = document.getElementById('currentWeather');
    const forecast = document.getElementById('forecast');
    const errorDisplay = document.getElementById('errorDisplay');

    let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];

    function updateRecentDropdown() {
      recentDropdown.innerHTML = recentCities.length ? '' : '<option value="" selected disabled>No cities searched yet</option>';
      recentCities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        recentDropdown.appendChild(option);
      });
    }

    async function fetchWeatherData(query) {
      try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${query}&units=metric&appid=${apiKey}`);
        if (!response.ok) throw new Error('City not found');
        const data = await response.json();
        displayWeatherData(data);
      } catch (error) {
        showError(error.message);
      }
    }

    async function fetchForecastData(lat, lon) {
      try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
        if (!response.ok) throw new Error('Forecast not available');
        const data = await response.json();
        displayForecastData(data.list);
      } catch (error) {
        showError(error.message);
      }
    }

    function displayWeatherData(data) {
      errorDisplay.classList.add('hidden');
      weatherDisplay.classList.remove('hidden');
      cityName.textContent = data.name;
      currentWeather.innerHTML = `
        <p>Temperature: ${data.main.temp}&#8451;</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed} m/s</p>
        <p>${data.weather[0].description}</p>
      `;
      fetchForecastData(data.coord.lat, data.coord.lon);
    }

    function displayForecastData(list) {
      forecast.innerHTML = '';
      const days = list.filter(item => item.dt_txt.includes('12:00:00'));
      days.forEach(day => {
        const date = new Date(day.dt_txt).toLocaleDateString();
        forecast.innerHTML += `
          <div class="p-4 bg-white shadow rounded-md">
            <p>${date}</p>
            <p>Temp: ${day.main.temp}&#8451;</p>
            <p>Humidity: ${day.main.humidity}%</p>
            <p>Wind: ${day.wind.speed} m/s</p>
          </div>
        `;
      });
    }

    function showError(message) {
      errorDisplay.textContent = message;
      errorDisplay.classList.remove('hidden');
      weatherDisplay.classList.add('hidden');
    }

    searchBtn.addEventListener('click', () => {
      const city = cityInput.value.trim();
      if (!city) {
        showError('Please enter a city name');
        return;
      }
      fetchWeatherData(city);
      if (!recentCities.includes(city)) {
        recentCities.push(city);
        if (recentCities.length > 5) recentCities.shift();
        localStorage.setItem('recentCities', JSON.stringify(recentCities));
        updateRecentDropdown();
      }
    });

    currentLocationBtn.addEventListener('click', () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
          const { latitude, longitude } = position.coords;
          fetchWeatherData(`${latitude},${longitude}`);
        }, () => showError('Unable to get current location'));
      } else {
        showError('Geolocation is not supported by this browser');
      }
    });

    recentDropdown.addEventListener('change', () => {
      const city = recentDropdown.value;
      if (city) fetchWeatherData(city);
    });

    updateRecentDropdown();
  