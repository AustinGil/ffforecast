import { vi, beforeEach, describe, test, expect } from 'vitest';
import { faker } from '@faker-js/faker';
import fetch from 'node-fetch';
import createApi from './create-api.js';

vi.mock('node-fetch', () => {
  return {
    default: vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        favoriteAnimal: faker.animal.dog(),
      }),
    }),
  };
});

const openWeatherApiKey = faker.lorem.word();
const geoapifyApiKey = faker.lorem.word();
const api = createApi({ openWeatherApiKey, geoapifyApiKey });

beforeEach(() => {
  fetch.mockClear();
});

describe('create-api', () => {
  test.concurrent('it returns an object with API methods', async () => {
    expect(api).toBeInstanceOf(Object);
    expect(typeof api.oneCall).toBe('function');
    expect(typeof api.getGeolocation).toBe('function');
  });

  describe('api.oneCall()', () => {
    test('it passes default parameters to openweather API', async () => {
      await api.oneCall();
      const query = new URLSearchParams({
        units: 'imperial',
        appid: openWeatherApiKey,
      });
      expect(fetch).toBeCalledWith(
        `https://api.openweathermap.org/data/2.5/onecall?${query.toString()}`
      );
    });
    test('it passes custom parameters to openweather API', async () => {
      const parameters = {
        lat: faker.datatype.number(),
        lon: faker.datatype.number(),
        units: faker.random.arrayElement(['metric', 'imperial', 'standard']),
        exclude: faker.random.arrayElement([
          'current',
          'minutely',
          'hourly',
          'daily',
          'alerts',
        ]),
        lang: faker.lorem.word(),
      };

      await api.oneCall(parameters);

      const query = new URLSearchParams({
        units: parameters.units,
        ...parameters,
        appid: openWeatherApiKey,
      });
      expect(fetch).toBeCalledWith(
        `https://api.openweathermap.org/data/2.5/onecall?${query.toString()}`
      );
    });
    test('it returns the response from openweather API', async () => {
      const response = await api.oneCall();
      const { value } = fetch.mock.results.at(-1);
      const fetchResults = await value.json();
      // @ts-ignore
      expect(response).toEqual(fetchResults);
    });
  });

  describe('api.getGeolocation()', () => {
    const randomString = faker.lorem.word();

    test('it passes parameter to geoapify API', async () => {
      await api.getGeolocation(randomString);
      const query = new URLSearchParams({
        text: randomString,
        apiKey: geoapifyApiKey,
      });
      expect(fetch).toBeCalledWith(
        `https://api.geoapify.com/v1/geocode/search?${query.toString()}`
      );
    });
    test('it returns the response from openweather API', async () => {
      const response = await api.getGeolocation(randomString);
      const { value } = fetch.mock.results.at(-1);
      const fetchResults = await value.json();
      // @ts-ignore
      expect(response).toEqual(fetchResults);
    });
  });
});
