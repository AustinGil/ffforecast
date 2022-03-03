import { describe, test, expect } from 'vitest';
import { faker } from '@faker-js/faker';
import { Cookies, SetCookie } from './index.js';

const name1 = faker.random.word();
const value1 = faker.random.word();
const name2 = faker.random.word();
const value2 = faker.random.word();
const cookieString = `${name1}=${value1}; ${name2}=${value2};`;

describe('Cookies', () => {
  describe('Cookies.toHeader()', () => {
    test.concurrent('prints string of cookies', () => {
      const cookies = new Cookies(cookieString);
      expect(cookies.toHeader()).toBe(cookieString);
    });
    test.concurrent('handles no trailing semicolons', () => {
      const cookies = new Cookies(cookieString.slice(0, -1));
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
      // @ts-ignore
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
    test.concurrent('returns undefined if not matching name is found', () => {
      const cookies = new Cookies('foo=bar');
      expect(cookies.get('notFoo')).toBeUndefined();
    });
  });

  describe('Cookies.getAll()', () => {
    test.concurrent('returns all values for cookies with same name', () => {
      const cookies = new Cookies(`${cookieString}; ${name2}=${value1};`);
      expect(cookies.getAll(name1)).toEqual([value1]);
      expect(cookies.getAll(name2)).toEqual([value2, value1]);
    });
    test.concurrent('returns empty array if no matching name is found', () => {
      const cookies = new Cookies('foo=bar');
      expect(cookies.getAll('notFoo')).toEqual([]);
    });
  });

  describe('Cookies.names()', () => {
    test.concurrent('returns all cookie names', () => {
      const cookies = new Cookies(cookieString);
      expect(cookies.names()).toEqual([name1, name2]);
    });
    test.concurrent('returns only unique names', () => {
      const cookies = new Cookies(`${cookieString}; ${name2}=${value1};`);
      expect(cookies.names()).toEqual([name1, name2]);
    });
  });

  describe('Cookies.delete()', () => {
    test.concurrent(
      'removes the name and value of the given cookie name',
      () => {
        const cookies = new Cookies(cookieString);
        cookies.delete(name1);
        expect(cookies.toHeader()).toBe(`${name2}=${value2};`);
      }
    );
  });
});

describe('SetCookie', () => {
  describe('SetCookie constructor', () => {
    test.concurrent('creates a new cookie from an object', () => {
      const cookie = new SetCookie({
        name: name1,
        value: value1,
      });
      expect(cookie.toHeader()).toBe(`${name1}=${value1};`);
    });
    test.concurrent('sets the cookie domain', () => {
      const randomDomain = faker.internet.domainName();
      const cookie = new SetCookie({
        name: name1,
        value: value1,
        domain: randomDomain,
      });
      expect(cookie.toHeader()).toBe(
        `${name1}=${value1}; Domain=${randomDomain};`
      );
    });
    test.concurrent('sets the cookie path', () => {
      const randomPath = faker.internet.url();
      const cookie = new SetCookie({
        name: name1,
        value: value1,
        path: randomPath,
      });
      expect(cookie.toHeader()).toBe(`${name1}=${value1}; Path=${randomPath};`);
    });
    test.concurrent('sets the cookie expires', () => {
      const randomExpires = faker.date.future();
      const cookie = new SetCookie({
        name: name1,
        value: value1,
        expires: randomExpires,
      });
      expect(cookie.toHeader()).toBe(
        `${name1}=${value1}; Expires=${randomExpires.toUTCString()};`
      );
    });
    test.concurrent('sets the cookie max-age', () => {
      const randomMaxAge = faker.datatype.number();
      const cookie = new SetCookie({
        name: name1,
        value: value1,
        maxAge: randomMaxAge,
      });
      expect(cookie.toHeader()).toBe(
        `${name1}=${value1}; Max-Age=${randomMaxAge};`
      );
    });
    test.concurrent('sets the cookie http-only', () => {
      const cookie1 = new SetCookie({
        name: name1,
        value: value1,
        httpOnly: true,
      });
      expect(cookie1.toHeader()).toBe(`${name1}=${value1}; HttpOnly;`);
      const cookie2 = new SetCookie({
        name: name1,
        value: value1,
        httpOnly: false,
      });
      expect(cookie2.toHeader()).toBe(`${name1}=${value1};`);
    });
    test.concurrent('sets the cookie secure', () => {
      const cookie1 = new SetCookie({
        name: name1,
        value: value1,
        secure: true,
      });
      expect(cookie1.toHeader()).toBe(`${name1}=${value1}; Secure;`);
      const cookie2 = new SetCookie({
        name: name1,
        value: value1,
        secure: false,
      });
      expect(cookie2.toHeader()).toBe(`${name1}=${value1};`);
    });
    test.concurrent('sets the cookie same-site', () => {
      const sameSite = faker.helpers.randomize(['Strict', 'Lax', 'None']);
      const cookie1 = new SetCookie({
        name: name1,
        value: value1,
        sameSite: sameSite,
      });
      expect(cookie1.toHeader()).toBe(
        `${name1}=${value1}; SameSite=${sameSite};`
      );
    });
    test.concurrent('decodes the value on creation', () => {
      const value = faker.internet.url();
      const cookie = new SetCookie(
        {
          name: name1,
          value: encodeURIComponent(value),
        },
        {
          decode: decodeURIComponent,
        }
      );
      expect(cookie.toHeader()).toBe(`${name1}=${value};`);
    });
    test.concurrent('creates a new cookie from a string', () => {
      const cookie = new SetCookie(`${name1}=${value1};`);
      expect(cookie.toHeader()).toBe(`${name1}=${value1};`);
    });
    test.concurrent(
      "works if the cookie string doesn't have trailing semicolon",
      () => {
        const cookie = new SetCookie(`${name1}=${value1}`);
        expect(cookie.toHeader()).toBe(`${name1}=${value1};`);
      }
    );
    test.concurrent(
      'works if the cookie string has extra trailing space',
      () => {
        const cookie = new SetCookie(`${name1}=${value1}; `);
        expect(cookie.toHeader()).toBe(`${name1}=${value1};`);
      }
    );
    // path = '';
    // /** @type {Date} */
    // expires;
    // /** @type {number} in seconds */
    // maxAge;
    // httpOnly = false;
    // secure = false;
    // /** @type {'Strict'|'Lax'|'None'} */
    // sameSite;
    test.concurrent('sets the domain from the cookie string', () => {
      const randomDomain = faker.internet.domainName();
      const cookie = new SetCookie(
        `${name1}=${value1};Domain=${randomDomain};`
      );
      expect(cookie.toHeader()).toBe(
        `${name1}=${value1}; Domain=${randomDomain};`
      );
    });
  });
  // describe('SetCookie.toHeader()', () => {
  //   test.concurrent('prints string of cookie', () => {
  //     const name = faker.random.word();
  //     const value = faker.random.word();
  //     const cookie = new SetCookie(name, value);
  //     expect(cookie.toHeader()).toBe(`${name}=${value}`);
  //   });
  // });
});
