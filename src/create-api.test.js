import { vi, beforeEach, describe, test, expect } from 'vitest';
import { faker } from '@faker-js/faker';
import createApi from './create-api.js';
import fetch from 'node-fetch';

vi.mock('node-fetch', () => {
  return {
    default: vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        favoriteAnimal: randomDog,
      }),
    }),
  };
});

var randomDog = faker.animal.dog();
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
    test.concurrent(
      'it passes default parameters to openweather API',
      async () => {
        await api.oneCall();
        const query = new URLSearchParams({
          units: 'imperial',
          appid: openWeatherApiKey,
        });
        expect(fetch).toBeCalledWith(
          `https://api.openweathermap.org/data/2.5/onecall?${query.toString()}`
        );
      }
    );
    test.concurrent(
      'it passes custom parameters to openweather API',
      async () => {
        const parameters = {
          lat: faker.datatype.number(),
          lon: faker.datatype.number(),
          units: faker.helpers.randomize(['metric', 'imperial', 'standard']),
          exclude: faker.helpers.randomize([
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
      }
    );
  });
});
