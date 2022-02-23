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
 * @param {number} degree
 */
function getWindDirection(degree) {
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
      <title>Freakin' Fast Forecast</title>
      <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><text x='0' y='14'>🌦</text></svg>">
      <link rel="stylesheet" type="text/css" href="https://unpkg.com/bedrocss">
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
        .flex {
          display: flex;
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
        .o-auto {
          overflow: auto;
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
        .rotate {
          --rotate: 0;
          transform: rotate(var(--rotate));
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
      <main class="p-8">
        <h1 class="mb-8">Freakin' Fast Forecast</h1>

        ${
          // <pre>${JSON.stringify(weatherData, undefined, 2)}</pre>
          !weatherData
            ? `<p>No weather data for: ${city}</p>`
            : `<h2 class="mb-32">${city} ${formatDate(
              weatherData.current.dt * 1000,
              { dateStyle: 'short', timeStyle: 'short' }
              )}</h2>
            
            <section class="card mb-32">
              <h3 class="h6 mb-8">Current</h3>
            <p class="flex align-center justify-between m-0">
              <span>
                <span class="h1">${weatherData.current.temp}°F</span>
                <br>
                <span>${weatherData.current.weather[0].description}</span>
              </span>
              <img src="http://openweathermap.org/img/wn/${
                weatherData.current.weather[0].icon
    }@2x.png" alt="${weatherData.current.weather[0].description}"/>
            </p>
            <table>
              <tr>
                <th align="left">Feels Like</th>
                <td>${weatherData.current.feels_like}°F</td>
              </tr>
              <tr>
                <th align="left">Wind</th>
                <td>
                ${weatherData.current.wind_speed} mph
                
                <svg class="icon icon-arrow-long-up rotate" style="--rotate: ${weatherData.current.wind_deg
    }deg;" aria-hidden><use xlink:href="#icon-arrow-long-up"></use></svg>
                  
                  ${getWindDirection(weatherData.current.wind_deg)}
                </td>
              </tr>
              <tr>
                <th align="left">Cloudiness</th>
                <td>${weatherData.current.clouds}%</td>
              </tr>
              <tr>
                <th align="left">UV Index</th>
                <td>${weatherData.current.uvi}</td>
              </tr>
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
                <span class="h4"><b>${formatDate(hour.dt * 1000, {
                  timeStyle: 'short',
                })}</b></span>
                <br>
                <span class="h5 flex justify-between align-center">
                  <b>${Math.round(hour.temp)}°F</b>
                  <img
                    src="http://openweathermap.org/img/wn/${hour.weather[0].icon
                    }@2x.png"
                    alt="${hour.weather[0].description}"
                    loading="${index < 3 ? 'eager' : 'lazy'}"
                    width="64"
                    height="64"
                  />
                </span>

                <table>
                  <tr>
                    <th align="left">☁</th>
                    <td>${hour.clouds}%</td>
                  </tr>
                  <tr>
                    <th align="left">🌧</th>
                    <td>${hour.pop}%</td>
                  </tr>
                  <tr>
                    <th align="left">💦</th>
                    <td>${hour.humidity}%</td>
                  </tr>
                  <tr>
                    <th align="left">🕶</th>
                    <td>${hour.uvi}%</td>
                  </tr>
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
        return `<div class="min-w-120">
                          <span class="h4">
                          <b>
                            ${formatDate(day.dt * 1000, {
          dateStyle: 'short',
        })}
                          </b>
                          </span>

                          <span class="h5 flex justify-between align-center">
                            <b>${Math.round(day.temp.day)}°F</b>
                            <img
                              src="http://openweathermap.org/img/wn/${day.weather[0].icon
          }@2x.png"
                              alt="${day.weather[0].description}"
                              loading="${index < 3 ? 'eager' : 'lazy'}"
                              width="64"
                              height="64"
                            />
                          </span>
                          <table>
                            <tr>
                              <th align="left">🔺</th>
                              <td>${day.temp.max}°F</td>
                            </tr>
                            <tr>
                              <th align="left">🔻</th>
                              <td>${day.temp.min}°F</td>
                            </tr>
                            <tr>
                              <th align="left">☁</th>
                              <td>${day.clouds}%</td>
                            </tr>
                            <tr>
                              <th align="left">🌧</th>
                              <td>${day.pop}%</td>
                            </tr>
                            <tr>
                              <th align="left">🕶</th>
                              <td>${day.uvi}°F</td>
                            </tr>
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
      </defs>
      </svg>
    </body>
  </html>`;
}
