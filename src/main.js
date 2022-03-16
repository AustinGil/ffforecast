import URLSearchParams from 'url-search-params';
import { createResponse } from 'create-response';
import { Cookies, SetCookie } from 'cookies';
import createApi from './create-api.js';

/**
 * @param {Date|number|string} date
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 */
export function formatDate(date, options) {
  date = new Date(date);
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * @param {number} degree
 */
export function getWindDirection(degree) {
  if (degree >= 337.5 || degree < 22.5) return 'N';
  if (degree < 67.5) return 'NE';
  if (degree < 112.5) return 'E';
  if (degree < 157.5) return 'SE';
  if (degree < 202.5) return 'S';
  if (degree < 247.5) return 'SW';
  if (degree < 292.5) return 'W';
  if (degree < 337.5) return 'NW';
}

/**
 * @param {string} text
 */
export function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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
  const headers = {};
  const query = new URLSearchParams(request.query);
  const cookies = new Cookies(request.getHeader('Cookie'));

  let location = cookies.get('location');
  // If user requests new location, update location and cookies
  if (query.has('location')) {
    location = query.get('location');
    headers['Set-Cookie'] = new SetCookie({
      name: 'location',
      value: location,
    }).toHeader();
  }
  // Fallback to server location if no location is set
  if (!location) {
    const { city, region, country } = request.userLocation;
    location = `${city}, ${region}, ${country}`;
  }
  location = escapeHtml(location);

  const geolocation = await api.getGeolocation(location);

  let weatherData;
  if (geolocation.features?.length > 0) {
    const { lat, lon } = geolocation.features[0].properties;
    weatherData = await api.oneCall({ lat, lon });
  }

  const body = `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>Freakin' Fast Forecast</title>
      <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><text x='0' y='14'>🌦</text></svg>">
      <link rel="stylesheet" type="text/css" href="https://unpkg.com/bedrocss@0.0.19/bedrocss.min.css">
      <style>
        th, td {
          padding: 0.25rem;
        }
        tr:nth-child(even) {
          background-color: ButtonFace;
        }
        tr:not(:last-child) :is(th, td) {
          border-bottom: 1px solid;
        }
        .relative {
          position: relative;
        }
        .grid {
          display: grid;
        }
        .flex {
          display: flex;
        }
        .flex-grow {
          flex-grow: 1;
        }
        .align-center {
          align-items: center;
        }
        .justify-between {
          justify-content: space-between;
        }
        .min-w-120 {
          min-inline-size: ${120 / 16}rem;
        }
        .max-w-900 {
          max-inline-size: ${900 / 16}rem;
        }
        .o-auto {
          overflow: auto;
        }
        .mi-auto {
          margin-inline: auto;
        }
        ${[0, 4, 8, 12, 16, 32]
          .map((space) => {
            return `
          .gap-${space} {
            gap: ${space / 16}rem;
          }
          .m-${space} {
            margin: ${space / 16}rem;
          }
          .mt-${space} {
            margin-block-start: ${space / 16}rem;
          }
          .mb-${space} {
            margin-block-end: ${space / 16}rem;
          }
          .p-${space} {
            padding: ${space / 16}rem;
          }
          .pb-${space} {
            padding-bottom: ${space / 16}rem;
          }`;
          })
          .join('')}
        .b-1 {
          border: 1px solid;
        }
        ${[64, 96]
    .map((size) => {
      return `.size-${size} {
            font-size: ${size / 16}rem;
          }`;
          })
    .join('')}
        .rotate {
          --rotate: 0;
          transform: rotate(var(--rotate));
        }
        .visually-hidden {
          clip: rect(0 0 0 0);
          clip-path: inset(50%);
          height: 1px;
          overflow: hidden;
          position: absolute;
          white-space: nowrap;
          width: 1px;
        }
        .icon {
          display: inline-block;
          width: 1em;
          height: 1em;
          stroke-width: 0;
          stroke: currentColor;
          fill: currentColor;
        }
        .card {
          position: relative;
          border: 1px solid;
          border-radius: 0.5rem;
          padding: .75rem;
          overflow: hidden;
        }
        .card:before {
          content: '';
          position: absolute;
          z-index: -1;
          inset: 0;
          opacity: 0.1;
          background-color: CanvasText;
        }
      </style>
    </head>
  
    <body>
      <main class="max-w-900 mi-auto p-8">
        <h1 class="mb-8">Freakin' Fast Forecast</h1>

        <form class="mb-16">
          <label for="location">Search Location</label>
          <div class="flex gap-8">
            <input id="location" name="location" />
            <button type="submit">Submit</button>
          </div>
        </form>

        ${
          !weatherData
    ? `<p>No weather data for: ${location}</p>`
    : `<h2 class="grid mb-32">Weather for ${location} <br><span class="h6">${formatDate(
      weatherData.current.dt * 1000,
      { dateStyle: 'short', timeStyle: 'short' }
    )}</span></h2>

            <section class="card mb-32">
              <h3 class="h6 mb-8">Current</h3>
              <p class="flex align-center justify-between m-0">
              <span>
                <span class="h1">${weatherData.current.temp}°F</span>
                <br>
                <span>${weatherData.current.weather[0].description}</span>
              </span>
              <svg class="icon size-96 ${
                weatherData.current.weather[0].icon
    }" aria-label="${weatherData.current.weather[0].description
    }"><use xlink:href="#${weatherData.current.weather[0].icon
              }"></use></svg>
            </p>
            <table role="table" class="mt-0">
              <tbody role="rowgroup">
                <tr role="row">
                  <th scope="row" role="rowheader" align="left"><span aria-hidden="true">🌡</span> Feels Like</th>
                  <td role="cell">${weatherData.current.feels_like}°F</td>
                </tr>
                <tr role="row">
                  <th scope="row" role="rowheader" align="left"><span aria-hidden="true">🌬</span> Wind</th>
                  <td role="cell">
                  ${weatherData.current.wind_speed} mph
                  
                  <svg class="icon icon-arrow-long-up rotate" style="--rotate: ${
    weatherData.current.wind_deg
                  }deg;" aria-hidden="true" alt=""><use xlink:href="#icon-arrow-long-up"></use></svg>

                    ${getWindDirection(weatherData.current.wind_deg)}
                  </td>
                </tr>
                <tr role="row">
                  <th scope="row" role="rowheader" align="left"><span aria-hidden="true">☁</span> Cloudiness</th>
                  <td role="cell">${weatherData.current.clouds}%</td>
                </tr>
                <tr role="row">
                  <th scope="row" role="rowheader" align="left"><span aria-hidden="true">🕶</span> UV Index</th>
                  <td role="cell">${weatherData.current.uvi}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section class="card mb-32">
            <h3 class="h6 mb-8">Hourly</h3>
            <div class="flex gap-8 o-auto pb-8">
              ${weatherData.hourly
      .map((hour, index) => {
        return `
              <div class="min-w-120">
                <small>
                ${formatDate(hour.dt * 1000, {
                  dateStyle: 'short',
                })}
                </small>
                <br>
                <h4><b>${formatDate(hour.dt * 1000, {
                  timeStyle: 'short',
                })}</b></h4>
                
                <p class="h5 flex justify-between align-center mt-0">
                  <b>${Math.round(hour.temp)}°F</b>
                  <svg class="icon size-64 ${
                    hour.weather[0].icon
                    }" aria-label="${hour.weather[0].description
                    }"><use xlink:href="#${hour.weather[0].icon}"></use></svg>
                </p>

                <table role="table" class="mt-0">
                  <tbody role="rowgroup">
                    <tr role="row">
                      <th scope="row" role="rowheader" align="left">
                        <span aria-hidden="true" title="Cloudiness">☁</span>
                        <span class="visually-hidden">Cloudiness</span>
                      </th>
                      <td role="cell">${hour.clouds}%</td>
                    </tr>
                    <tr role="row">
                      <th scope="row" role="rowheader" align="left">
                        <span aria-hidden="true" title="Precipitation">🌧</span>
                        <span class="visually-hidden">Precipitation</span>
                      </th>
                      <td role="cell">${hour.pop}%</td>
                    </tr>
                    <tr role="row">
                      <th scope="row" role="rowheader" align="left">
                        <span aria-hidden="true" title="Humidity">🥵</span>
                        <span class="visually-hidden">Humidity</span>
                      </th>
                      <td role="cell">${hour.humidity}%</td>
                    </tr>
                    <tr role="row">
                      <th scope="row" role="rowheader" align="left">
                        <span aria-hidden="true" title="UV Index">🕶</span>
                        <span class="visually-hidden">UV Index</span>
                      </th>
                      <td role="cell">${hour.uvi}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>`;
                })
      .join('')}
            </div>
          </section>

          <section class="card mb-32">
            <h3 class="h6 mb-8">Daily</h3>
            <div class="flex gap-8 o-auto pb-8">
              ${weatherData.daily
      .map((day, index) => {
                  return `<div class="flex-grow min-w-120">
                          <h4><b>${formatDate(day.dt * 1000, {
                            dateStyle: 'short',
                          })}</b></h4>

                          <p class="h5 flex justify-between align-center mt-0">
                            <b>${Math.round(day.temp.day)}°F</b>
                            <svg class="icon size-64 ${
                    day.weather[0].icon
                    }" aria-label="${day.weather[0].description
                    }"><use xlink:href="#${day.weather[0].icon}"></use></svg>
                          </p>
                          <table role="table" class="mt-0">
                            <tbody role="rowgroup">
                              <tr role="row">
                                <th scope="row" role="rowheader" align="left">
                                  <span aria-hidden="true" title="High">🔺</span>
                                  <span class="visually-hidden">High</span>
                                </th>
                                <td role="cell">${day.temp.max}°F</td>
                              </tr>
                              <tr role="row">
                                <th scope="row" role="rowheader" align="left">
                                  <span aria-hidden="true" title="Low">🔻</span>
                                  <span class="visually-hidden">Low</span>
                                </th>
                                <td role="cell">${day.temp.min}°F</td>
                              </tr>
                              <tr role="row">
                                <th scope="row" role="rowheader" align="left">
                                  <span aria-hidden="true" title="Cloudiness">☁</span>
                                  <span class="visually-hidden">Cloudiness</span>
                                </th>
                                <td role="cell">${day.clouds}%</td>
                              </tr>
                              <tr role="row">
                                <th scope="row" role="rowheader" align="left">
                                  <span aria-hidden="true" title="Precipitation">🌧</span>
                                  <span class="visually-hidden">Precipitation</span>
                                </th>
                                <td role="cell">${day.pop}%</td>
                              </tr>
                              <tr role="row">
                                <th scope="row" role="rowheader" align="left">
                                  <span aria-hidden="true" title="UV Index">🕶</span>
                                  <span class="visually-hidden">UV Index</span>
                                </th>
                                <td role="cell">${day.uvi}°F</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>`;
                })
      .join('')}
            </div>
            `
        }
        </section>
      </main>
      <svg aria-hidden="true" style="position: absolute; width: 0; height: 0; overflow: hidden;" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs>
          <symbol id="icon-arrow-long-up" viewBox="0 0 20 20">
          <path d="M10 0.75l5.5 5.25h-3.5v13h-4v-13h-3.5l5.5-5.25z"></path>
          </symbol>

          <!-- 01d clear day -->
          <symbol id="01d" viewBox="0 0 100 100"><path d="m46 27-3 1c-9 1-18 14-17 25 1 7 9 19 11 17l1 1c0 1 8 4 12 4 5 0 11-2 10-3h1c3 0 9-6 12-11 3-7 3-14 0-20s-6-9-12-12c-4-2-15-4-15-2zm11 2-2 1v-1h2z" fill="#F63"/></symbol>
          
          <!-- 01n clear night -->
          <symbol id="01n" viewBox="0 0 100 100"><path d="M43 28c-5 1-10 5-9 6l-1 1c-2-1-6 8-7 13 0 6 2 14 7 19l4 3 1 1c0 2 8 4 14 4 14-1 24-13 23-26-1-6-4-14-7-14v-1c0-1-5-5-10-6-5-2-10-2-15 0z" fill="#333"/></symbol>

          <symbol id="02d" viewBox="0 0 100 100"><path d="M59 31c-7 3-7 4-5 9l2 4v1h1c2-1 7-1 10 1l1 4c0 2 1 3 3 4l4 3c5 6 10-9 6-18-2-4-4-6-9-8s-9-2-13 0z" fill="#F63"/><path d="M39 35c-4 1-8 7-8 11s0 4-3 4c-7 0-12 10-9 16s5 6 31 6h23l2-3 3-6c0-4-4-8-8-8-3 0-3 0-3-2 1-2 0-3-1-5-2-3-3-3-6-3-4 1-5 1-6-3-3-6-8-9-15-7z" fill="#FFF"/><path d="M60 45h2l-2-1v1z" fill="#FC9"/></symbol>

          <symbol id="02n" viewBox="0 0 100 100"><path d="M59 31c-6 2-8 4-6 6v2l1 1c1 1 2 2 1 3l1 1v1h2c1-2 2-2 4-1h2c2 1 4 4 4 6s1 4 5 4l2 2 2 2c3 0 5-5 5-6v-1c2 1 1-8-1-12s-5-7-10-9c-5-1-8-1-13 1zm19 20c1 0 1 1 0 0l-1-1c0-2 1-1 1 1z" fill="#333"/><path d="M39 35c-4 1-8 7-8 11s0 4-3 4-7 2-9 6v10c3 6 6 6 31 6h23l2-3 3-6c0-4-4-8-8-8-3 0-3 0-3-2 2-6-6-10-11-7h-2c2-4-4-11-8-10l-2-1h-5zm0 33h-1l-1-1c1-1 2-1 2 1z" fill="#FFF"/><path d="m51 36 2 2c1 1 1 1 0 0l-2-2z"/><path d="M60 45h2l-2-1v1z" fill="#999"/></symbol>

          <symbol id="03d" viewBox="0 0 100 100"><path d="M40 34c-4 2-7 7-7 11l-1 2c-5 1-7 2-10 6v10c3 5 5 6 30 6h23l2-3c5-5 2-14-4-14-3 0-3-1-3-3l-2-5c-3-2-7-3-9-1l-2-3c-2-4-7-8-11-8l-6 2z" fill="#FFF"/></symbol>

          <symbol id="03n" viewBox="0 0 100 100"><path d="M40 34c-4 2-7 7-7 11l-1 2c-5 1-7 2-10 6v10c3 5 5 6 30 6h23l2-3c5-5 2-14-4-14-3 0-3-1-3-3l-2-5c-3-2-7-3-9-1l-2-3c-2-4-7-8-11-8l-6 2z" fill="#FFF"/></symbol>
          
          <!-- 04d Cloudy -->
          <symbol id="04d" viewBox="0 0 100 100"><path d="M53.5 30c.3.5 0 .7-.9.4-1.9-.7-5.8 3.2-5.4 5.4.2.9 1.3 1.8 2.5 2 1.5.2 2 .8 1.6 1.9-.5 1.2-.3 1.4.7.8 1-.6 1.2-.4.7.8-.3 1-.2 1.7.4 1.7.6 0 .8.4.4.9-.3.5-.1 1.2.5 1.6.5.3 1 .2 1-.3 0-1.3 7.3-.7 7.8.7.2.6.8 1.1 1.3 1.1.6 0 .7-.5.3-1.2-.4-.7-.3-.8.5-.4.6.4.9 1.2.5 1.7-.9 1.4 1.6 6.9 3.1 6.9.7 0 2.7 1.3 4.5 3 3.9 3.6 6.9 3.8 9.8.7 2.6-2.7 3.1-8.3.7-7.3-.8.3-1.5.1-1.5-.4 0-.6.6-1 1.3-1 1.9-.1-2.5-3-4.5-3-1.1 0-1.8-.7-1.8-1.8 0-2.6-3-6.4-4.6-5.8-.8.3-1.4.2-1.4-.3 0-.4-1.1-.6-2.5-.3-1.7.3-2.5 0-2.5-.9-.1-1.8-3-5.3-5.7-6.8-2.7-1.4-7.7-1.5-6.8-.1z" fill="#333"/><path d="M37.3 36.6c-.4 1-.8 1.2-1.3.5-1.2-2-5.9 3.5-7.2 8.2-1 3.9-1.6 4.5-4.7 5.3-4.1 1-8.1 6.2-8.1 10.3 0 3.6 3.5 9 6.6 10.2 1.6.5 12.2.9 24.9.9 18-.1 22.7-.4 24.4-1.6 1.2-.9 1.9-1.9 1.6-2.4-.3-.5-.1-1.1.5-1.5 1.7-1.1 1.1-6-1.1-8.4-1.1-1.2-3.4-2.4-5-2.8-2.3-.4-2.9-1.1-2.9-3.3 0-4.5-5.1-7.7-9.5-6-1.7.6-2.5.6-2.5-.1 0-.6-.5-.7-1.2-.3-.7.4-.8.3-.4-.5 1.3-2-.3-4.8-4.2-7.5-4.3-2.9-8.9-3.4-9.9-1z" fill="#FFF"/><path d="M65 54c0 .6.7 1 1.5 1s1.5-.2 1.5-.4-.7-.6-1.5-1c-.8-.3-1.5-.1-1.5.4z" fill="#666"/></symbol>
          
          <!-- 04n Cloudy -->
          <symbol id="04n" viewBox="0 0 100 100"><path d="M53.5 30c.3.5 0 .7-.9.4-1.9-.7-5.8 3.2-5.4 5.4.2.9 1.3 1.8 2.5 2 1.5.2 2 .8 1.6 1.9-.5 1.2-.3 1.4.7.8 1-.6 1.2-.4.7.8-.3 1-.2 1.7.4 1.7.6 0 .8.4.4.9-.3.5-.1 1.2.5 1.6.5.3 1 .2 1-.3 0-1.3 7.3-.7 7.8.7.2.6.8 1.1 1.3 1.1.6 0 .7-.5.3-1.2-.4-.7-.3-.8.5-.4.6.4.9 1.2.5 1.7-.9 1.4 1.6 6.9 3.1 6.9.7 0 2.7 1.3 4.5 3 3.9 3.6 6.9 3.8 9.8.7 2.6-2.7 3.1-8.3.7-7.3-.8.3-1.5.1-1.5-.4 0-.6.6-1 1.3-1 1.9-.1-2.5-3-4.5-3-1.1 0-1.8-.7-1.8-1.8 0-2.6-3-6.4-4.6-5.8-.8.3-1.4.2-1.4-.3 0-.4-1.1-.6-2.5-.3-1.7.3-2.5 0-2.5-.9-.1-1.8-3-5.3-5.7-6.8-2.7-1.4-7.7-1.5-6.8-.1z" fill="#333"/><path d="M37.3 36.6c-.4 1-.8 1.2-1.3.5-1.2-2-5.9 3.5-7.2 8.2-1 3.9-1.6 4.5-4.7 5.3-4.1 1-8.1 6.2-8.1 10.3 0 3.6 3.5 9 6.6 10.2 1.6.5 12.2.9 24.9.9 18-.1 22.7-.4 24.4-1.6 1.2-.9 1.9-1.9 1.6-2.4-.3-.5-.1-1.1.5-1.5 1.7-1.1 1.1-6-1.1-8.4-1.1-1.2-3.4-2.4-5-2.8-2.3-.4-2.9-1.1-2.9-3.3 0-4.5-5.1-7.7-9.5-6-1.7.6-2.5.6-2.5-.1 0-.6-.5-.7-1.2-.3-.7.4-.8.3-.4-.5 1.3-2-.3-4.8-4.2-7.5-4.3-2.9-8.9-3.4-9.9-1z" fill="#FFF"/><path d="M65 54c0 .6.7 1 1.5 1s1.5-.2 1.5-.4-.7-.6-1.5-1c-.8-.3-1.5-.1-1.5.4z" fill="#666"/></symbol>

          <symbol id="10d" viewBox="0 0 100 100"><path d="M56 26.7c-2.6 1.4-3.5 2.5-3.6 4.5-.1 1.5.2 2.5.7 2.3.4-.3 1.2.7 1.7 2.2.6 1.6 1.1 2.2 1.1 1.5.1-.6 1-1.2 2.1-1.2s2 .6 2.1 1.2c0 .7.4.4.9-.7.7-1.6.9-1.7.9-.3.1.9.8 2.4 1.7 3.2.8.9 1.3 2 .9 2.5-.3.6.5 1.5 1.7 2.2 1.3.7 2.8 1.9 3.4 2.7 1.5 2 4.2.9 5.4-2.3 4.5-11.9-7.9-23.5-19-17.8z" fill="#F63"/><path d="M37.7 32c-1.5 1.2-2.9 3.5-3.3 5.5-.5 2.8-1.3 3.6-4 4.5-3.5 1.2-6.4 5.2-6.4 8.9 0 1.1 1.2 3.3 2.6 5 2.1 2.5 3.3 3.1 6.5 3.1 2.2 0 4.8-.6 5.9-1.3 1.7-.9 2.2-.9 2.8 0 1.1 1.7 18.5 1.7 17.6 0-.5-.8-.2-.7.7 0 1.7 1.7 8.4 1.6 9.8 0 1.7-2.1 2.6-7.7 1.2-7.7-.7 0-1-.4-.6-.9.8-1.4-2.5-3.1-6.1-3.1-1.1 0-1.4-.5-1-1.6.4-.9-.1-2.8-1-4.2-1.4-2.1-2.2-2.4-5.5-1.9-2.1.3-3.7.2-3.4-.3.2-.4-.6-2.3-1.8-4.1-1.9-2.9-2.9-3.4-6.8-3.7-3.4-.2-5.2.2-7.2 1.8z" fill="#FFF"/><path d="M53 34c.6 1.1 1.3 2 1.6 2 .2 0 0-.9-.6-2s-1.3-2-1.6-2c-.2 0 0 .9.6 2zm3.8 2.7c.6.2 1.8.2 2.5 0 .6-.3.1-.5-1.3-.5-1.4 0-1.9.2-1.2.5z" fill="#F33"/><path d="M39 60c0 .5.5 1 1 1 .6 0 1-.5 1-1 0-.6-.4-1-1-1-.5 0-1 .4-1 1zm14.6 2.9c-.3.5 0 1.1.8 1.4 1.5.6 2.6-.1 2.6-1.5 0-1.1-2.7-1-3.4.1zm-9 1.7c-1 2.5-.7 4.6.6 4.2 1.8-.6 2.9-4.6 1.3-5.2-.7-.2-1.6.2-1.9 1zm-8.5 1.2c-1.5 2.8-1.4 4.2.3 4.2 1.8 0 3.1-3.9 1.8-5.2-.7-.7-1.4-.3-2.1 1zm14.4 6.3c-.4 1.1-.4 2.4 0 2.7.9.9 3.6-2.8 2.9-3.9-.9-1.5-2.2-1-2.9 1.2zm-8.5.5c0 .9.5 1.4 1.2 1.2 1.8-.6 2.1-2.8.4-2.8-.9 0-1.6.7-1.6 1.6z" fill="#333"/><path d="M48.3 59.7c.9.2 2.3.2 3 0 .6-.3-.1-.5-1.8-.5-1.6 0-2.2.2-1.2.5zm11 0c.9.2 2.5.2 3.5 0 .9-.3.1-.5-1.8-.5-1.9 0-2.7.2-1.7.5z" fill="#F1F1F1" fill-opacity=".44"/><path d="M54.8 59.7c.7.3 1.6.2 1.9-.1.4-.3-.2-.6-1.3-.5-1.1 0-1.4.3-.6.6z" fill="#FFF" fill-opacity=".44"/></symbol>

          <symbol id="10n" viewBox="0 0 100 100"><path d="M56.4 26.5c-4.8 2.2-5.4 3.5-3.6 7.7 1.4 3.1 2 3.6 3.9 3.2 3-.8 7.3 2 7.3 4.6 0 1.2 1 2.4 2.3 2.9 1.3.5 2.9 1.6 3.6 2.5 1.7 2 3.1 2.1 3.1.2 0-.8.5-1.6 1.1-1.8.6-.2 1.3-2.6 1.6-5.3.5-5.6-1.7-10.1-6.1-13a15.3 15.3 0 0 0-13.2-1zM39 60c0 .5.5 1 1 1 .6 0 1-.5 1-1 0-.6-.4-1-1-1a1 1 0 0 0-1 1zm14.4 3.1c-.2.4 0 1 .6 1.4 1.1.7 3-.2 3-1.4 0-1-2.9-1-3.6 0zm-9 2.5c-.8 3.3.4 4.4 2.2 2 1.8-2.5 1.8-3.2-.1-4-1-.3-1.7.3-2.1 2zm-8.3.2c-1.5 2.8-1.4 4.2.3 4.2 1.8 0 3.1-3.9 1.8-5.2-.7-.7-1.4-.3-2.1 1zm14.4 6.3c-.4 1.1-.4 2.3-.1 2.7.8.7 3.6-3 3-4-.9-1.4-2.3-.8-2.9 1.3zm-8.5.4c0 .8.4 1.5.9 1.5s1.1-.7 1.5-1.5c.3-.9 0-1.5-.9-1.5-.8 0-1.5.7-1.5 1.5z" fill="#333"/><path d="M37.7 32a10.8 10.8 0 0 0-3.3 5.5c-.3 1.9-1 3.5-1.4 3.5-.4 0-1.2 1-1.9 2.2-.7 1.5-1 1.6-.6.4.4-1.4.1-1.7-1.1-1.2l-2 .6c-.8 0-3.4 6-3.4 7.9 0 1.1 1.2 3.3 2.6 5 2.1 2.5 3.3 3.1 6.5 3.1 2.2 0 4.9-.6 6-1.3 1.7-1 2.3-1 2.6 0 .3 1 4 1.3 13.8 1.3 12.7 0 13.5-.1 14.9-2.2a8.8 8.8 0 0 0 1.6-4.3c0-2.2-4-6.7-5.6-6.4-2.5.4-3.6-.2-3-1.7.4-.9 0-2.7-.9-4-1.3-2-2.2-2.3-5.5-2-3.3.3-4 .1-4-1.4 0-.9-.9-2.9-2.1-4.4-2.6-3.4-9.3-3.7-13.2-.6z" fill="#FFF"/><path d="M48.3 59.7c.9.2 2.3.2 3 0 .6-.3-.1-.5-1.8-.5-1.6 0-2.2.2-1.2.5zm11 0c.9.2 2.3.2 3 0 .6-.3-.1-.5-1.8-.5-1.6 0-2.2.2-1.2.5z" fill="#F1F1F1" fill-opacity=".4"/><path d="M54.8 59.7c.7.3 1.6.2 1.9-.1.4-.3-.2-.6-1.3-.5-1.1 0-1.4.3-.6.6z" fill="#FFF" fill-opacity=".4"/></symbol>
        </defs>
      </svg>
    </body>
  </html>`;

  return createResponse(body, {
    status: 200,
    headers: headers,
  });
}
