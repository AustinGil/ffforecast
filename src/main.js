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
          }`;
          })
          .join('')}
        .b-1 {
          border: 1px solid;
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
        <h1 class="mb-8">Friendly, Fast Forecast</h1>

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
                <span class="h1">${weatherData.current.temp}℉</span>
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
                <td>${weatherData.current.feels_like}℉</td>
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
                <td>${weatherData.current.clouds}%</td>
              </tr>
            </table>
          </section>

          <section class="card mb-32">
            <h3 class="h6 mb-8">Hourly</h3>
            <div class="flex o-auto">
              ${weatherData.hourly
      .map((hour) => {
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
                <img src="http://openweathermap.org/img/wn/${hour.weather[0].icon
          }@2x.png" alt="${hour.weather[0].description}" width="64"/>
                <br>
                <span>${hour.temp}℉</span>
              </div>`;
      })
      .join('')}
            </div>
            <div style="max-block-size: 50vh; overflow: auto;">
              <table>
              ${weatherData.hourly
                .map(
                  (hour) => `
                  <tr>
                    <th align="left">${formatDate(hour.dt * 1000, {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}</th>
                <td>${hour.temp}℉</td>
                  </tr>
                  `
                )
                .join('')}
              </table>
            </div>
          </section>
          
          <section class="card mb-32">
            <h3 class="mb-8">Daily</h3>
            <div style="max-block-size: 50vh; overflow: auto;">
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th align="left">1/1/2000</th>
                    <th align="left">1/2/2000</th>
                  <tr>
                </thead>
                <tbody>
                  <tr>
                    <th align="left">Temp</th>
                    <td>123</td>
                    <td>123</td>
                  </tr>
                  <tr>
                    <th align="left">Min</th>
                    <td>123</td>
                    <td>123</td>
                  </tr>
                  <tr>
                    <th align="left">Max</th>
                    <td>123</td>
                    <td>123</td>
                  </tr>
                </tbody>
              </table>

              <table>${weatherData.daily
                .map((day) => {
                  return `<tr>
                  <th align="left">${formatDate(day.dt * 1000, {
                    dateStyle: 'short',
                  })}</th>
              <td>Min: ${day.temp.min}℉</td>
              <td>Max: ${day.temp.max}℉</td>
                </tr>`;
                })
                .join('')}
              </table>
            </div>
            `
        }
        </section>
      </main>
    </body>
  </html>`;
}
