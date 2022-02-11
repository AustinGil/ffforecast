import { httpRequest } from 'http-request';

/**
 * @typedef {{
 * cod: number
 * coord?: {
 *  lon: number,
 *  lat: number
 * },
 * weather?: Array<{
 *  id: number,
 *  main: string,
 *  description: string,
 *  icon: string
 * }>,
 * base?: string,
 * main?: {
 *  temp: number,
 *  feels_like: number,
 *  temp_min: number,
 *  temp_max: number,
 *  pressure: number,
 *  humidity: number
 * },
 * visibility?: number,
 * wind?: {
 *  speed: number,
 *  deg: number
 * },
 * clouds?: {
 *  all: number
 * },
 * dt?: number,
 * sys?: {
 *  type: number,
 *  id: number,
 *  country: string,
 *  sunrise: number,
 *  sunset: number
 * },
 * timezone?: number,
 * id?: number,
 * name?: string,
 * message?: string
 * }} OpenWeatherMapResponse
 */

/**
 * @param {string} city
 * @returns {Promise<OpenWeatherMapResponse>}
 */
async function getWeatherForCity(city) {
  const OPENWEATHER_API_KEY = process.env.PMUSER_OPENWEATHER_API_KEY;
  const response = await httpRequest(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=imperial`
  );
  const json = await response.json();
  return json;
}

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
  const weather = await getWeatherForCity(city);

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
    weather.cod !== 200
      ? `<p>${weather.message}: ${city}</p>`
      : `<h2>Current weather for ${city} ${formatDate(
        weather.dt * 1000
      )}</h2>
        <p>
            <img src="http://openweathermap.org/img/wn/${
    weather.weather[0].icon
    }@2x.png" alt="${weather.weather[0].description}"/>
            ${weather.weather[0].description} | ${weather.main.temp}℉
          </p>
          <table>
            <tr>
              <th align="left">Feels Like</th>
              <td>${weather.main.feels_like}℉</td>
            </tr>
            <tr>
              <th align="left">Min</th>
              <td>${weather.main.temp_min}℉</td>
            </tr>
            <tr>
              <th align="left">Max</th>
              <td>${weather.main.temp_max}℉</td>
            </tr>
            <tr>
              <th align="left">Wind Speed</th>
              <td>${weather.wind.speed} mph</td>
            </tr>
            <tr>
              <th align="left">Wind Direction</th>
              <td>${weather.wind.deg}°</td>
            </tr>
            <tr>
              <th align="left">Cloudiness</th>
              <td>${weather.clouds.all}%</td>
            </tr>
            <tr>
              <th align="left">Sunrise</th>
              <td>${formatDate(weather.sys.sunrise * 1000, {
                timeStyle: 'short',
              })}</td>
            </tr>
            <tr>
              <th align="left">Sunset</th>
              <td>${formatDate(weather.sys.sunset * 1000, {
                timeStyle: 'short',
              })}</td>
            </tr>
          </table>`
        }
      </main>
    </body>
  </html>`;
}
