import { describe, test, expect } from 'vitest';
import { faker } from '@faker-js/faker';
import { Cookies, SetCookie } from './index.js';

// const randomKey = faker.random.word();
// const randomValue = faker.random.word();
// const randomStatus = faker.helpers.randomize([200, 400, 500]);
// const randomHeaderKey = faker.random.word();
// const randomHeaderValue = faker.random.word();
// const randomDenyReason = faker.random.words();

describe('Cookies', () => {
  const name1 = faker.random.word();
  const value1 = faker.random.word();
  const name2 = faker.random.word();
  const value2 = faker.random.word();
  const cookieString = `${name1}=${value1}; ${name2}=${value2};`;

  describe('Cookies.toHeader()', () => {
    test.concurrent('prints string of cookies', () => {
      const cookies = new Cookies(cookieString);
      expect(cookies.toHeader()).toBe(cookieString);
    });
    test.concurrent('handles trailing semicolons', () => {
      const cookies = new Cookies(cookieString + ';');
      expect(cookies.toHeader()).toBe(cookieString);
    });
    test.concurrent('handles cookies without spaces', () => {
      const cookies = new Cookies(cookieString.split('; ').join(';'));
      expect(cookies.toHeader()).toBe(cookieString);
    });
  });

  describe('Cookies.add()', () => {
    test.concurrent('does nothing if theres no name or value', () => {
      const name = faker.random.word();
      const value = faker.random.word();
      const cookies = new Cookies(cookieString);
      cookies.add();
      expect(cookies.toHeader()).toBe(cookieString);
      cookies.add('', '');
      expect(cookies.toHeader()).toBe(cookieString);
      cookies.add(name, '');
      expect(cookies.toHeader()).toBe(cookieString);
      cookies.add('', value);
      expect(cookies.toHeader()).toBe(cookieString);
    });
    test.concurrent('adds the name and value to a cookie string', () => {
      const name = faker.random.word();
      const value = faker.random.word();
      const cookies = new Cookies(cookieString);
      cookies.add(name, value);
      expect(cookies.toHeader().includes(`${name}=${value}`)).toBe(true);
    });
  });

  describe('Cookies.get()', () => {
    test.concurrent('returns cookie value', () => {
      const cookies = new Cookies(cookieString);
      expect(cookies.get(name1)).toBe(value1);
      expect(cookies.get(name2)).toBe(value2);
    });
  });

  describe('Cookies.getAll()', () => {
    test.concurrent('returns all values for cookies with same name', () => {
      const cookies = new Cookies(cookieString);
      expect(cookies.get(name1)).toBe(value1);
      expect(cookies.get(name2)).toBe(value2);
    });
  });
});
