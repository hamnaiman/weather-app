// Replace with your actual OpenWeather API key
const API_KEY = "9b35b483ae8e88fe8374951593c63894";

// Mapping for Pakistani city-specific backgrounds
const cityBackgrounds = {
  karachi: "https://source.unsplash.com/1600x900/?karachi,city",
  lahore: "https://source.unsplash.com/1600x900/?lahore,city",
  islamabad: "https://source.unsplash.com/1600x900/?islamabad,landscape"
};

// Update toggle icons for dark/light mode
function updateToggleIcons() {
  const sunIcon = document.getElementById("sunIcon");
  const moonIcon = document.getElementById("moonIcon");
  if (document.documentElement.classList.contains("dark")) {
    sunIcon.classList.add("opacity-0");
    moonIcon.classList.remove("opacity-0");
    moonIcon.classList.add("opacity-100");
  } else {
    sunIcon.classList.remove("opacity-0");
    moonIcon.classList.add("opacity-0");
    moonIcon.classList.remove("opacity-100");
  }
}

// Change background based on the searched city (if in mapping)
function updateCityBackground(cityName) {
  const container = document.getElementById("backgroundContainer");
  const cityKey = cityName.toLowerCase().trim();
  console.log("Updating background for:", cityKey);
  if (cityBackgrounds[cityKey]) {
    container.style.backgroundImage = `url('${cityBackgrounds[cityKey]}')`;
  } else {
    container.style.backgroundImage = "";
  }
}

// Event listener for the search form
document.getElementById("searchForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const city = document.getElementById("cityInput").value.trim();
  if (city) {
    fetchWeather(city);
    updateCityBackground(city);
  }
});

// Fetch current weather data from OpenWeather
async function fetchWeather(city) {
  try {
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    if (!weatherResponse.ok) {
      throw new Error("City not found. Please try another city.");
    }
    const weatherData = await weatherResponse.json();
    displayWeather(weatherData);
    const { lat, lon } = weatherData.coord;
    fetchHourlyForecast(lat, lon);
  } catch (error) {
    alert(error.message);
  }
}

// Fetch hourly forecast using the One Call API
async function fetchHourlyForecast(lat, lon) {
  try {
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,daily,alerts&appid=${API_KEY}&units=metric`
    );
    const forecastData = await forecastResponse.json();
    displayHourlyForecast(forecastData.hourly);
  } catch (error) {
    console.error("Error fetching hourly forecast", error);
  }
}

// Display current weather information in the weather card
function displayWeather(data) {
  const weatherDiv = document.getElementById("weatherDisplay");
  weatherDiv.innerHTML = `
    <div class="bg-white dark:bg-gray-800 p-6 rounded shadow-lg transition transform duration-500 hover:scale-105">
      <h2 class="text-3xl font-bold">${data.name}, ${data.sys.country}</h2>
      <div class="flex flex-col sm:flex-row items-center mt-4">
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}" class="w-20 h-20"/>
        <div class="ml-0 sm:ml-6 text-center sm:text-left">
          <p class="text-4xl font-semibold">${Math.round(data.main.temp)}°C</p>
          <p class="capitalize text-xl">${data.weather[0].description}</p>
        </div>
      </div>
    </div>
  `;
}

// Display hourly forecast (next 12 hours) with responsive grid layout
function displayHourlyForecast(hourlyData) {
  const hourlyDiv = document.getElementById("hourlyForecast");
  let htmlContent = '<h3 class="text-2xl font-bold mb-4">Hourly Forecast</h3>';
  htmlContent += '<div class="grid grid-cols-2 md:grid-cols-4 gap-4">';
  hourlyData.slice(0, 12).forEach((hour) => {
    const date = new Date(hour.dt * 1000);
    const hours = date.getHours();
    const formattedHour = hours < 10 ? "0" + hours : hours;
    htmlContent += `
      <div class="bg-white dark:bg-gray-800 p-4 rounded shadow-md text-center transition transform duration-300 hover:scale-105">
        <p class="font-bold">${formattedHour}:00</p>
        <img src="https://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png" alt="${hour.weather[0].description}" class="mx-auto w-16 h-16"/>
        <p class="text-xl">${Math.round(hour.temp)}°C</p>
      </div>
    `;
  });
  htmlContent += "</div>";
  hourlyDiv.innerHTML = htmlContent;
}

// Dark mode toggle functionality
const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
  themeToggle.classList.add("animate-toggle");
  updateToggleIcons();
  setTimeout(() => {
    themeToggle.classList.remove("animate-toggle");
  }, 500);
});

// Set initial state for toggle icons on page load
updateToggleIcons();
