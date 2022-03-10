import { vi, describe, test, expect } from 'vitest';
import { faker } from '@faker-js/faker';
import fetch from 'node-fetch';
import { formatDate, getWindDirection, responseProvider } from './main.js';

vi.mock('node-fetch', () => {
  return {
    default: vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        favoriteAnimal: faker.animal.dog(),
      }),
    }),
  };
});

describe('formatDate', () => {
  const randomDate = faker.date.recent();

  test.concurrent('it returns a date in M/D/YYYY', () => {
    const formatted = formatDate(randomDate);
    expect(formatted).toBe(randomDate.toLocaleDateString());
  });
  test.concurrent('it accepts a Date, number, or string', () => {
    const dateDate = new Date(randomDate);
    expect(formatDate(dateDate)).toBe(randomDate.toLocaleDateString());
    const numberDate = Number(randomDate);
    expect(formatDate(numberDate)).toBe(randomDate.toLocaleDateString());
    const stringDate = String(randomDate);
    expect(formatDate(stringDate)).toBe(randomDate.toLocaleDateString());
  });
  test.concurrent('it works with Intl.DateTimeFormatOptions', () => {
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

describe('getWindDirection', () => {
  test.concurrent('returns NE for North-East degree range', () => {
    expect(getWindDirection(23)).toBe('NE');
    expect(getWindDirection(67)).toBe('NE');
  });
  test.concurrent('returns E for East degree range', () => {
    expect(getWindDirection(68)).toBe('E');
    expect(getWindDirection(112)).toBe('E');
  });
  test.concurrent('returns SE for South-East degree range', () => {
    expect(getWindDirection(113)).toBe('SE');
    expect(getWindDirection(157)).toBe('SE');
  });
  test.concurrent('returns S for South degree range', () => {
    expect(getWindDirection(158)).toBe('S');
    expect(getWindDirection(202)).toBe('S');
  });
  test.concurrent('returns SW for South-West degree range', () => {
    expect(getWindDirection(203)).toBe('SW');
    expect(getWindDirection(247)).toBe('SW');
  });
  test.concurrent('returns W for West degree range', () => {
    expect(getWindDirection(248)).toBe('W');
    expect(getWindDirection(292)).toBe('W');
  });
  test.concurrent('returns NW for North-West degree range', () => {
    expect(getWindDirection(293)).toBe('NW');
    expect(getWindDirection(337)).toBe('NW');
  });
  test.concurrent('returns N for North degree range', () => {
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

  test.concurrent('returns a valid response object', async () => {
    const response = await responseProvider(fakeRequestObject);
    expect(typeof response.body).toBe('string');
    expect(response).toMatchObject({
      status: 200,
      headers: {},
      deny_reason: '',
    });
  });
  test.concurrent('default UI matches snapshot', async () => {
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
