let cityInput = document.querySelector("#city_input");
let searchBtn = document.querySelector("#searchBtn");
let locationBtn = document.querySelector("#locationBtn");
const api_key = "ecd4d65c51342a50084d18e2490a1df5";

let days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
let months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") getCityCoordinates();
});

const getWeatherDetails = (name, lat, lon, country, state) => {
  let forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_key}`;
  let weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}`;
  let airPollutionApiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${api_key}`;

  const weatherData = async () => {
    try {
      const response = await fetch(weatherApiUrl);
      const data = await response.json();
      let d = new Date();
      document.querySelector("#tempInC").innerHTML = `${(
        data.main.temp - 273.15
      ).toFixed(2)} &deg;C `;
      document.querySelector(
        "#description"
      ).innerHTML = `${data.weather[0].description}`;
      document.querySelector(
        ".weather-icon"
      ).innerHTML = `<img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="">`;
      document.querySelector("#showDate").innerHTML = ` ${d.toDateString()}`;
      document.querySelector(
        "#showLocation"
      ).innerHTML = ` ${name}, ${country}`;

      let { humidity, pressure, feels_like } = data.main;
      let speed = data.wind.speed;
      let visibility = data.visibility;
      let statsMap = {
        humidity: `${humidity} %`,
        pressure: `${pressure} hPa`,
        feels_like: `${(feels_like - 273.15).toFixed(2)} &deg;C`,
        speed: `${speed} m/s`,
        visibility: `${visibility / 1000} km`,
      };
      let weatherStats = document.querySelectorAll(".item-val");
      weatherStats.forEach((weatherStat) => {
        let key = weatherStat.dataset.name;
        weatherStat.innerHTML = statsMap[key] || "N/A";
      });

      // SUNRISE AND SUNSET :
      let timeZoneOffset = data.timezone;
      function formatTime(unixTime, offset) {
        let localTime = new Date((unixTime + offset) * 1000);
        return localTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "UTC",
        });
      }
      document.querySelector("#sunriseText").textContent = formatTime(
        data.sys.sunrise,
        timeZoneOffset
      );
      document.querySelector("#sunsetText").textContent = formatTime(
        data.sys.sunset,
        timeZoneOffset
      );
    } catch {
      alert("Failed to fetch weather data.");
    }
  };
  weatherData();

  const forecastData = async () => {
    try {
      const response = await fetch(forecastApiUrl);
      const data = await response.json();
      const today = new Date().getDate();
      let fiveDaysForecast = [];
      let uniqueForecastDays = [];
      data.list.forEach((forecast, index, arr) => {
        let date = new Date(forecast.dt_txt);
        let forecastDay = date.getDate();
        let forecastHours = date.getHours();
        if (forecastDay === today) return;
        if (!uniqueForecastDays.includes(forecastDay)) {
          let sameDayForecasts = arr.filter((f) => {
            let d = new Date(f.dt_txt);
            return d.getDate() === forecastDay;
          });
          let target = sameDayForecasts.find(
            (f) => new Date(f.dt_txt).getHours() === 12
          );
          if (!target) target = sameDayForecasts[sameDayForecasts.length - 1];
          fiveDaysForecast.push(target);
          uniqueForecastDays.push(forecastDay);
        }
      });
      let forecastItems = document.querySelectorAll(".forecast-item");
      forecastItems.forEach((item, index) => {
        let forecast = fiveDaysForecast[index];
        if (!forecast) return;
        let d = new Date(forecast.dt_txt);
        let iconImg = item.querySelector("img");
        iconImg.src = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`;
        let tempInC = item.querySelector("span");
        tempInC.innerHTML = `${(forecast.main.temp - 273.15).toFixed(2)}&deg;C`;
        let dateAndMonth = item.querySelector(".date-and-month");
        dateAndMonth.innerHTML = `${d.getDate()} ${months[d.getMonth()]}`;
        let forecastDay = item.querySelector(".forecast-day");
        forecastDay.innerHTML = `${days[d.getDay()]}`;
      });

      // HOURLY FORECAST :
      let hourlyForecast = data.list;
      let forecastHours = document.querySelectorAll(".forecast-hour");
      for (let i = 0; i < forecastHours.length; i++) {
        let hrForecastDate = new Date(hourlyForecast[i].dt_txt);
        let hr = hrForecastDate.getHours();
        let a = "PM";
        if (hr < 12) a = "AM";
        if (hr == 0) hr = 12;
        if (hr > 12) hr = hr - 12;
        forecastHours[i].innerHTML = `${hr} ${a}`;
      }
      let forecastImg = document.querySelectorAll(".forecast-img");
      forecastImg.forEach((img, index) => {
        img.src = `https://openweathermap.org/img/wn/${hourlyForecast[index].weather[0].icon}.png`;
      });
      let forecastDeg = document.querySelectorAll(".forecast-deg");
      forecastDeg.forEach((deg, index) => {
        deg.innerHTML = `${(hourlyForecast[index].main.temp - 273.15).toFixed(
          2
        )} &deg;C`;
      });
    } catch (err) {
      alert(`Failed to fetch forecast data.`);
    }
  };
  forecastData();

  const airPollutionData = async () => {
    try {
      const response = await fetch(airPollutionApiUrl);
      const data = await response.json();
      let aqiList = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];
      let aqiVal = data.list[0].main.aqi;
      let aqiDescription = aqiList[aqiVal - 1];
      let aqiElement = document.querySelector(".air-index");
      aqiElement.textContent = aqiDescription;
      aqiElement.className = `air-index aqi-${aqiVal}`;
      let gases = document.querySelectorAll(".gas h2");
      let gasNames = ["pm2_5", "pm10", "so2", "co", "no", "no2", "nh3", "o3"];
      gases.forEach((gas, index) => {
        let key = gasNames[index];
        let value = data.list[0].components[key];
        gas.innerHTML = `${value}`;
      });
    } catch {
      alert("Failed fetching air quality index!");
    }
  };
  airPollutionData();
};

const getCityCoordinates = async () => {
  let cityName = cityInput.value.trim();
  cityInput.value = "";
  if (!cityName) return alert("Please enter valid city name");
  let geocodingApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName},&limit=1&appid=${api_key}`;
  try {
    const response = await fetch(geocodingApiUrl);
    const data = await response.json();
    let { name, lat, lon, country, state } = data[0];
    getWeatherDetails(name, lat, lon, country, state);
  } catch {
    alert(`Failed to get coordinates of ${cityName}`);
  }
};

const getUserCoordinates = async () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      let { latitude, longitude, accuracy } = position.coords;
      let reverseGeocodingUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${api_key}`;
      const reverseGeocode = async () => {
        const response = await fetch(reverseGeocodingUrl);
        const data = await response.json();
        let { country, state, name } = data[0];
        getWeatherDetails(name, latitude, longitude, country, state);
      };
      reverseGeocode();
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED)
        alert("Please allow the request for geolocation.");
      else if (error.code === error.POSITION_UNAVAILABLE)
        alert("Location information is unavailable.");
      else if (error.code === error.TIMEOUT)
        alert("The request to get location timed out.");
      else alert("An unknown error occured");
    },
    { enableHighAccuracy: true }
  );
};

searchBtn.addEventListener("click", getCityCoordinates);
locationBtn.addEventListener("click", getUserCoordinates);
window.addEventListener("load", getUserCoordinates);
