import createApi from './create-api.js';

/**
 * @param {Date|number|string} date
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 */
function formatDate(date, options) {
  date = new Date(date);
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * @param {EW.IngressClientRequest} request
 */
export async function responseProvider(request) {
  const OPENWEATHER_API_KEY = request.getVariable('PMUSER_OPENWEATHER_API_KEY');
  const GEOAPIFY_API_KEY = request.getVariable('PMUSER_GEOAPIFY_API_KEY');
  const api = createApi({
    openWeatherApiKey: OPENWEATHER_API_KEY,
    geoapifyApiKey: GEOAPIFY_API_KEY,
  });

  const city = request.userLocation.city;

  const geolocation = await api.getGeolocation(city);

  let weatherData;
  if (geolocation.features?.length > 0) {
    const { lat, lon } = geolocation.features[0].properties;
    weatherData = await api.oneCall({ lat, lon });
  }

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>Fast Friendly Forecast</title>
      <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><text x='0' y='14'>🌦</text></svg>">
      <link rel="stylesheet" type="text/css" href="https://unpkg.com/bedrocss">
    </head>
  
    <body>
      <main>
        <h1>Friendly, Fast Forecast</h1>

        <pre>${JSON.stringify(weatherData, undefined, 2)}</pre>
        ${
    !weatherData
      ? `<p>No weather data for: ${city}</p>`
      : `<h2>Current weather for ${city} ${formatDate(
              weatherData.current.dt * 1000
            )}</h2>
        <p>
            <img src="http://openweathermap.org/img/wn/${
    weatherData.current.weather[0].icon
    }@2x.png" alt="${weatherData.current.weather[0].description}"/>
            ${weatherData.current.weather[0].description} | ${weatherData.current.temp
              }℉
          </p>
          <table>
            <tr>
              <th align="left">Feels Like</th>
              <td>${weatherData.current.feels_like}℉</td>
            </tr>
            <tr>
              <th align="left">Min</th>
              <td>${weatherData.current.temp_min}℉</td>
            </tr>
            <tr>
              <th align="left">Max</th>
              <td>${weatherData.current.temp_max}℉</td>
            </tr>
            <tr>
              <th align="left">Wind Speed</th>
              <td>${weatherData.current.wind_speed} mph</td>
            </tr>
            <tr>
              <th align="left">Wind Direction</th>
              <td>${weatherData.current.wind_deg}°</td>
            </tr>
            <tr>
              <th align="left">Cloudiness</th>
              <td>${weatherData.current.clouds.all}%</td>
            </tr>
            <tr>
              <th align="left">Sunrise</th>
              <td>${formatDate(weatherData.current.sunrise * 1000, {
                timeStyle: 'short',
              })}</td>
            </tr>
            <tr>
              <th align="left">Sunset</th>
              <td>${formatDate(weatherData.current.sunset * 1000, {
                timeStyle: 'short',
              })}</td>
            </tr>
          </table>

          <h2>Hourly forecast</h2>
          <div style="max-block-size: 50vh; overflow: auto;">
            <table>
            ${weatherData.hourly.map(
              (hour) => `
                <tr>
                  <th align="left">${formatDate(hour.dt * 1000, {
                dateStyle: 'short',
                timeStyle: 'short',
              })}</th>
              <td>${hour.temp}℉</td>
                </tr>
                `
            )}
            </table>
          </div>
          
          <h2>Daily forecast</h2>
          <div style="max-block-size: 50vh; overflow: auto;">
            <table>
            ${weatherData.daily.map(
              (day) => `
                <tr>
                  <th align="left">${formatDate(day.dt * 1000, {
                dateStyle: 'short',
              })}</th>
              <td>Min: ${day.temp.min}℉</td>
              <td>Max: ${day.temp.max}℉</td>
                </tr>
                `
            )}
            </table>
          </div>
          `
        }
      </main>
    </body>
  </html>`;
}
