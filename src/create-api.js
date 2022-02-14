import { httpRequest } from 'http-request';
/**
 * @typedef {import ('./types').OpenWeatherMapResponse} OpenWeatherMapResponse
 */

/**
 * @param {string} apiKey
 */
function createApi(apiKey) {
  return {
    /**
     * @param {object} parameters
     * @param {string} [parameters.q] The name of the city to query
     * @param {number} [parameters.lat] Latitude
     * @param {number} [parameters.lon] Longitude
     * @param {'metric'|'imperial'|'standard'} [parameters.units]
     * @param {'json'|'xml'|'html'} [parameters.mode]
     * @param {string} [parameters.lang] Language
     */
    currentWeather: async function (parameters) {
      // @ts-ignore
      const query = new URLSearchParams({
        units: 'imperial',
        ...parameters,
        appid: apiKey,
      });
      const response = await httpRequest(
        `https://api.openweathermap.org/data/2.5/weather?${query.toString()}`
      );
      /** @type {OpenWeatherMapResponse} */
      const json = await response.json();
      return json;
    },

    /**
     * @param {object} parameters
     * @param {string} [parameters.q] The name of the city to query
     * @param {number} [parameters.lat] Latitude
     * @param {number} [parameters.lon] Longitude
     * @param {'metric'|'imperial'|'standard'} [parameters.units]
     * @param {'json'|'xml'|'html'} [parameters.mode]
     * @param {string} [parameters.lang] Language
     * @param {number} [parameters.cnt]
     */
    forecast: async function (parameters) {
      // @ts-ignore
      const query = new URLSearchParams({
        units: 'imperial',
        ...parameters,
        appid: apiKey,
      });
      const response = await httpRequest(
        `https://api.openweathermap.org/data/2.5/forecast?${query.toString()}`
      );
      /**
       * @type {Pick<OpenWeatherMapResponse, 'cod'|'message'> & {
       * cnt: number,
       * list: OpenWeatherMapResponse[]
       * }}
       */
      const json = await response.json();
      return json;
    },

    // /**
    //  * @param {object} parameters
    //  * @param {number} [parameters.lat] Latitude
    //  * @param {number} [parameters.lon] Longitude
    //  * @param {'metric'|'imperial'|'standard'} [parameters.units]
    //  * @param {'current'|'minutely'|'hourly'|'daily'|'alerts'} [parameters.exclude]
    //  * @param {string} [parameters.lang] Language
    //  */
    // oneCall: async function (parameters) {
    //   // @ts-ignore
    //   const query = new URLSearchParams({
    //     units: 'imperial',
    //     ...parameters,
    //     appid: apiKey,
    //   });
    //   const response = await httpRequest(
    //     `https://api.openweathermap.org/data/2.5/onecall?${query.toString()}`
    //   );
    //   /** @type {OpenWeatherMapResponse} */
    //   const json = await response.json();
    //   return json;
    // },
  };
}
export default createApi;
