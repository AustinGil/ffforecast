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
  const city = request.userLocation.city;
  const OPENWEATHER_API_KEY = request.getVariable('PMUSER_OPENWEATHER_API_KEY');
  const api = createApi(OPENWEATHER_API_KEY);

  const currentWeather = await api.currentWeather({
    q: city,
  });
  const forecast = await api.forecast({
    q: city,
  });

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
        ${
    Number(currentWeather.cod) !== 200
      ? `<p>${currentWeather.message}: ${city}</p>`
      : `<h2>Current weather for ${city} ${formatDate(
              currentWeather.dt * 1000
            )}</h2>
        <p>
            <img src="http://openweathermap.org/img/wn/${
    currentWeather.weather[0].icon
    }@2x.png" alt="${currentWeather.weather[0].description}"/>
            ${currentWeather.weather[0].description} | ${currentWeather.main.temp
              }℉
          </p>
          <table>
            <tr>
              <th align="left">Feels Like</th>
              <td>${currentWeather.main.feels_like}℉</td>
            </tr>
            <tr>
              <th align="left">Min</th>
              <td>${currentWeather.main.temp_min}℉</td>
            </tr>
            <tr>
              <th align="left">Max</th>
              <td>${currentWeather.main.temp_max}℉</td>
            </tr>
            <tr>
              <th align="left">Wind Speed</th>
              <td>${currentWeather.wind.speed} mph</td>
            </tr>
            <tr>
              <th align="left">Wind Direction</th>
              <td>${currentWeather.wind.deg}°</td>
            </tr>
            <tr>
              <th align="left">Cloudiness</th>
              <td>${currentWeather.clouds.all}%</td>
            </tr>
            <tr>
              <th align="left">Sunrise</th>
              <td>${formatDate(currentWeather.sys.sunrise * 1000, {
                timeStyle: 'short',
              })}</td>
            </tr>
            <tr>
              <th align="left">Sunset</th>
              <td>${formatDate(currentWeather.sys.sunset * 1000, {
                timeStyle: 'short',
              })}</td>
            </tr>
          </table>`
        }

        ${
    Number(forecast.cod) !== 200
      ? ''
      : `<h2>5 Day Forecast</h2>
        <pre>${JSON.stringify(forecast, undefined, 2)}</pre>
        `
    }
        <pre>${JSON.stringify(forecast, undefined, 2)}</pre>
      </main>
    </body>
  </html>`;
}
