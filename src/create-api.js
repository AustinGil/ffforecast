import { httpRequest } from 'http-request';
import URLSearchParams from 'url-search-params';
/**
 * @typedef {import ('./types').OpenWeatherOneCall} OpenWeatherOneCall
 */

/**
 * @param {{
 * openWeatherApiKey: string
 * geoapifyApiKey: string
 * }} apiKeys
 */
function createApi({ openWeatherApiKey, geoapifyApiKey }) {
  if (process.env.NODE_ENV === 'test') {
    return {
      async oneCall() {
        return {
          current: {
            dt: 1647383388,
            temp: 41.09,
            feels_like: 37.49,
            pressure: 1030,
            humidity: 76,
            uvi: 0,
            clouds: 30,
            wind_speed: 5.37,
            wind_deg: 226,
            wind_gust: 5.01,
            weather: [
              {
                id: 501,
                main: 'Rain',
                description: 'moderate rain',
                icon: '10d',
              },
            ],
          },
          hourly: [
            {
              dt: 1647381600,
              temp: 41.09,
              feels_like: 37.49,
              humidity: 76,
              uvi: 0,
              clouds: 30,
              weather: [
                {
                  dt: 1647381600,
                  temp: 79.11,
                  feels_like: 79.11,
                  pressure: 1012,
                  humidity: 78,
                  dew_point: 71.65,
                  uvi: 10.53,
                  clouds: 12,
                  visibility: 10000,
                  wind_speed: 19.33,
                  wind_deg: 314,
                  wind_gust: 21.14,
                  weather: [
                    {
                      id: 501,
                      main: 'Rain',
                      description: 'moderate rain',
                      icon: '10d',
                    },
                  ],
                  pop: 0.98,
                  rain: { '1h': 1.6 },
                },
              ],
              pop: 0,
            },
          ],
          daily: [
            {
              dt: 1647374400,
              sunrise: 1647354893,
              sunset: 1647398969,
              moonrise: 1647394800,
              moonset: 1647345840,
              moon_phase: 0.42,
              temp: {
                day: 78.84,
                min: 78.1,
                max: 79.16,
                night: 78.28,
                eve: 79.03,
                morn: 78.1,
              },
              feels_like: { day: 78.84, night: 79.66, eve: 79.03, morn: 79.27 },
              pressure: 1013,
              humidity: 78,
              dew_point: 71.4,
              wind_speed: 19.33,
              wind_deg: 314,
              wind_gust: 21.94,
              weather: [
                {
                  id: 501,
                  main: 'Rain',
                  description: 'moderate rain',
                  icon: '10d',
                },
              ],
              clouds: 10,
              pop: 0.98,
              rain: 26.79,
              uvi: 12.23,
            },
          ],
        };
      },

      async getGeolocation() {
        return {
          features: [
            {
              properties: [
                {
                  lat: '37.7749',
                  lon: '-122.4194',
                },
              ],
            },
          ],
        };
      },
    };
  }
  return {
    /**
     * @param {object} [parameters]
     * @param {number} [parameters.lat] Latitude
     * @param {number} [parameters.lon] Longitude
     * @param {'metric'|'imperial'|'standard'} [parameters.units]
     * @param {'current'|'minutely'|'hourly'|'daily'|'alerts'} [parameters.exclude]
     * @param {string} [parameters.lang] Language
     */
    oneCall: async function (parameters) {
      const query = new URLSearchParams({
        units: 'imperial',
        ...parameters,
        // @ts-ignore
        appid: openWeatherApiKey,
      });
      const response = await httpRequest(
        `https://api.openweathermap.org/data/2.5/onecall?${query.toString()}`
      );
      /**
       * @type {OpenWeatherOneCall}
       */
      const json = await response.json();
      return json;
    },

    /**
     * @param {string} text
     */
    getGeolocation: async function (text) {
      const query = new URLSearchParams({
        // @ts-ignore
        text: text,
        apiKey: geoapifyApiKey,
      });
      // https://locationiq.com/
      // https://geocodify.com/
      // https://rapidapi.com/GeocodeSupport/api/forward-reverse-geocoding/pricing
      // fetch(`https://photon.komoot.io/api/?q=${text}`)
      const response = await httpRequest(
        `https://api.geoapify.com/v1/geocode/search?${query.toString()}`
      );
      const json = await response.json();
      return json;
    },
  };
}
export default createApi;
