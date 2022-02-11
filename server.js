import * as http from 'node:http';
import * as dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import * as worker from './src/main.js';
dotenv.config();

const notImplemented = () => {
  throw new Error('Not implemented');
};

/** @type {http.RequestListener} */
const app = async (request, response) => {
  // Transform node request object into EdgeWorker request object
  /** @type {EW.IngressClientRequest} */
  const ewRequest = {
    addHeader: notImplemented,
    cacheKey: {
      excludeQueryString: notImplemented,
      includeCookie: notImplemented,
      includeHeader: notImplemented,
      includeQueryArgument: notImplemented,
      includeQueryString: notImplemented,
      includeVariable: notImplemented,
    },
    cpCode: faker.datatype.number(),
    device: {
      acceptsThirdPartyCookie: faker.datatype.boolean(),
      brandName: faker.random.word(),
      hasAjaxSupport: faker.datatype.boolean(),
      hasFlashSupport: faker.datatype.boolean(),
      hasCookieSupport: faker.datatype.boolean(),
      isMobile: faker.datatype.boolean(),
      isTablet: faker.datatype.boolean(),
      isWireless: faker.datatype.boolean(),
      marketingName: faker.random.word(),
      mobileBrowser: faker.random.word(),
      mobileBrowserVersion: faker.datatype.number().toString(),
      os: faker.helpers.randomize([
        'Android',
        'iOS',
        'Windows Phone',
        'Windows',
        'Mac OS X',
        'Linux',
      ]),
      osVersion: faker.datatype.number().toString(),
      modelName: faker.random.word(),
      physicalScreenHeight: faker.datatype.number(),
      physicalScreenWidth: faker.datatype.number(),
      resolutionHeight: faker.datatype.number(),
      resolutionWidth: faker.datatype.number(),
      xhtmlSupportLevel: faker.datatype.number(),
    },
    getHeader: (headerKey) => {
      const header = response.getHeader(headerKey).toString();
      return Array.isArray(header) ? header : [header];
    },
    getVariable: (variableKey) => process.env[variableKey],
    host: request.headers.host,
    method: request.method,
    path: request.url.split('?')[0],
    query: request.url.split('?')[1],
    removeHeader: notImplemented,
    respondWith: notImplemented,
    setHeader: response.setHeader,
    route: notImplemented,
    // @ts-ignore
    scheme: request.socket.encrypted ? 'https' : 'http',
    setVariable: notImplemented,
    url: request.url,
    userLocation: {
      continent: undefined,
      country: faker.address.country(),
      region: faker.address.state(),
      city: faker.address.city(),
      zipCode: faker.address.zipCode(),
    },
  };

  if (worker.responseProvider) {
    let result = worker.responseProvider(ewRequest);
    if (result instanceof Promise) {
      result = await result;
    }
    response.end(result);
    return;
  }

  // response.writeHead(200, { 'Content-Type': 'text/html' });
  // response.end();
};

http.createServer(app).listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
