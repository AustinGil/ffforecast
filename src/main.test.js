import { vi, beforeEach, describe, it, expect } from 'vitest';
import { faker } from '@faker-js/faker';
import fetch from 'node-fetch';
import { formatDate, getWindDirection, responseProvider } from './main.js';

var fakeWeatherData;

vi.mock('node-fetch', () => {
  const fakeDate = 1646956114212;
  fakeWeatherData = {
    current: {
      dt: fakeDate,
      temp: {
        date: undefined,
      },
      weather: [
        {
          description: undefined,
          icon: undefined,
        },
      ],
      feels_like: undefined,
      wind_speed: undefined,
      wind_deg: undefined,
      clouds: undefined,
      uvi: undefined,
    },
    hourly: [
      {
        dt: fakeDate,
        temp: {
          date: undefined,
        },
        weather: [
          {
            description: undefined,
            icon: undefined,
          },
        ],
        clouds: undefined,
        pop: undefined,
        humidity: undefined,
        uvi: undefined,
      },
    ],
    daily: [
      {
        dt: fakeDate,
        temp: {
          date: undefined,
        },
        weather: [
          {
            description: undefined,
            icon: undefined,
          },
        ],
        clouds: undefined,
        pop: undefined,
        uvi: undefined,
      },
    ],
  };
  return {
    default: vi
      .fn()
      .mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue({
          features: [{ properties: { lat: 0, lon: 0 } }],
        }),
      })
      .mockResolvedValue({
        json: vi.fn().mockResolvedValue(fakeWeatherData),
      }),
  };
});

beforeEach(() => {
  fetch.mockClear();
});

describe.concurrent('formatDate', () => {
  const randomDate = faker.date.recent();

  it('returns a date in M/D/YYYY', () => {
    const formatted = formatDate(randomDate);
    expect(formatted).toBe(randomDate.toLocaleDateString());
  });
  it('accepts a Date, number, or string', () => {
    const dateDate = new Date(randomDate);
    expect(formatDate(dateDate)).toBe(randomDate.toLocaleDateString());
    const numberDate = Number(randomDate);
    expect(formatDate(numberDate)).toBe(randomDate.toLocaleDateString());
    const stringDate = String(randomDate);
    expect(formatDate(stringDate)).toBe(randomDate.toLocaleDateString());
  });
  it('works with Intl.DateTimeFormatOptions', () => {
    /** @type {Intl.DateTimeFormatOptions} */
    const options = {
      dateStyle: 'short',
      timeStyle: 'short',
    };
    const formatted = formatDate(randomDate, options);
    expect(formatted).toBe(
      new Intl.DateTimeFormat('en-US', options).format(randomDate)
    );
  });
});

describe.concurrent('getWindDirection', () => {
  it('returns NE for North-East degree range', () => {
    expect(getWindDirection(23)).toBe('NE');
    expect(getWindDirection(67)).toBe('NE');
  });
  it('returns E for East degree range', () => {
    expect(getWindDirection(68)).toBe('E');
    expect(getWindDirection(112)).toBe('E');
  });
  it('returns SE for South-East degree range', () => {
    expect(getWindDirection(113)).toBe('SE');
    expect(getWindDirection(157)).toBe('SE');
  });
  it('returns S for South degree range', () => {
    expect(getWindDirection(158)).toBe('S');
    expect(getWindDirection(202)).toBe('S');
  });
  it('returns SW for South-West degree range', () => {
    expect(getWindDirection(203)).toBe('SW');
    expect(getWindDirection(247)).toBe('SW');
  });
  it('returns W for West degree range', () => {
    expect(getWindDirection(248)).toBe('W');
    expect(getWindDirection(292)).toBe('W');
  });
  it('returns NW for North-West degree range', () => {
    expect(getWindDirection(293)).toBe('NW');
    expect(getWindDirection(337)).toBe('NW');
  });
  it('returns N for North degree range', () => {
    expect(getWindDirection(338)).toBe('N');
    expect(getWindDirection(22)).toBe('N');
  });
});

describe('responseProvider', () => {
  /** @type {EW.IngressClientRequest} */
  // @ts-ignore
  const fakeRequestObject = {
    getVariable: vi.fn((key) => key),
    query: undefined,
    getHeader: vi.fn(),
    userLocation: {
      continent: undefined,
      country: faker.address.country(),
      region: faker.address.state(),
      city: faker.address.city(),
      zipCode: faker.address.zipCode(),
    },
  };

  it('gets the API keys from the env variables', async () => {
    await responseProvider(fakeRequestObject);
    expect(fakeRequestObject.getVariable).toBeCalledWith(
      'PMUSER_OPENWEATHER_API_KEY'
    );
    expect(fakeRequestObject.getVariable).toBeCalledWith(
      'PMUSER_GEOAPIFY_API_KEY'
    );
  });
  it('gets the geolocation from geoappify', async () => {
    await responseProvider(fakeRequestObject);

    const mockedVariableResults = fakeRequestObject.getVariable.mock.results;
    const GEOAPIFY_API_KEY = mockedVariableResults[1].value;
    const { city, region, country } = fakeRequestObject.userLocation;

    const query = new URLSearchParams({
      text: `${city}, ${region}, ${country}`,
      apiKey: GEOAPIFY_API_KEY,
    });
    expect(fetch).toBeCalledWith(
      `https://api.geoapify.com/v1/geocode/search?${query.toString()}`
    );
  });
  it('gets the weather data if we have a geolocation', async () => {
    const latLon = { lat: '', lon: '' };
    fetch.mockResolvedValueOnce({
      async json() {
        return {
          features: [{ properties: latLon }],
        };
      },
    });

    await responseProvider(fakeRequestObject);

    const mockedVariableResults = fakeRequestObject.getVariable.mock.results;
    const PMUSER_OPENWEATHER_API_KEY = mockedVariableResults[0].value;

    const query = new URLSearchParams({
      units: 'imperial',
      lat: latLon.lat,
      lon: latLon.lon,
      appid: PMUSER_OPENWEATHER_API_KEY,
    });
    expect(fetch).toBeCalledWith(
      `https://api.openweathermap.org/data/2.5/onecall?${query.toString()}`
    );
  });
  it('returns a valid response object', async () => {
    const response = await responseProvider(fakeRequestObject);
    expect(typeof response.body).toBe('string');
    expect(response).toMatchObject({
      status: 200,
      headers: {},
      deny_reason: '',
    });
  });
  it('UI without weather data matches snapshot', async () => {
    fetch.mockResolvedValueOnce({
      json: vi.fn().mockResolvedValue({}),
    });
    const response = await responseProvider({
      ...fakeRequestObject,
      userLocation: {
        country: 'Gameboydia',
        region: 'Hoenn',
        city: 'Pallet Town',
        zipCode: '12345',
        continent: 'Kanto',
      },
    });
    expect(response).toMatchSnapshot();
  });
  it.only('default UI matches snapshot', async () => {
    const response = await responseProvider({
      ...fakeRequestObject,
      userLocation: {
        country: 'Gameboydia',
        region: 'Hoenn',
        city: 'Pallet Town',
        zipCode: '12345',
        continent: 'Kanto',
      },
    });
    expect(response).toMatchSnapshot();
  });
});
