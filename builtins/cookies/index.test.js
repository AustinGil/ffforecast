import { describe, test, expect } from 'vitest';
import { faker } from '@faker-js/faker';
import { Cookies, SetCookie } from './index.js';

const name1 = faker.random.word();
const value1 = faker.random.word();
const name2 = faker.random.word();
const value2 = faker.random.word();
const cookieString = `${name1}=${value1}; ${name2}=${value2};`;
const randomDomain = faker.internet.domainName();
const randomPath = `/${faker.internet.domainWord()}`;
const randomExpires = faker.date.future();
const randomMaxAge = faker.datatype.number();
const randomSameSite = faker.helpers.randomize(['Strict', 'Lax', 'None']);

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
      const cookie = new SetCookie({
        name: name1,
        value: value1,
        path: randomPath,
      });
      expect(cookie.toHeader()).toBe(`${name1}=${value1}; Path=${randomPath};`);
    });
    test.concurrent('sets the cookie expires', () => {
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
      const cookie1 = new SetCookie({
        name: name1,
        value: value1,
        // @ts-ignore
        sameSite: randomSameSite,
      });
      expect(cookie1.toHeader()).toBe(
        `${name1}=${value1}; SameSite=${randomSameSite};`
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
    test.concurrent('sets the domain from the cookie string', () => {
      const cookie = new SetCookie(
        `${name1}=${value1};Domain=${randomDomain};`
      );
      expect(cookie.toHeader()).toBe(
        `${name1}=${value1}; Domain=${randomDomain};`
      );
    });
    test.concurrent('sets the path from the cookie string', () => {
      const cookie = new SetCookie(`${name1}=${value1};Path=${randomPath};`);
      expect(cookie.toHeader()).toBe(`${name1}=${value1}; Path=${randomPath};`);
    });
    test.concurrent('sets the expires from the cookie string', () => {
      const cookie = new SetCookie(
        `${name1}=${value1};Expires=${randomExpires};`
      );
      expect(cookie.toHeader()).toBe(
        `${name1}=${value1}; Expires=${randomExpires.toUTCString()};`
      );
    });
    test.concurrent('sets the max-age from the cookie string', () => {
      const cookie = new SetCookie(
        `${name1}=${value1};Max-Age=${randomMaxAge};`
      );
      expect(cookie.toHeader()).toBe(
        `${name1}=${value1}; Max-Age=${randomMaxAge};`
      );
    });
    test.concurrent('sets the httpOnly from the cookie string', () => {
      const cookie = new SetCookie(`${name1}=${value1};HttpOnly;`);
      expect(cookie.toHeader()).toBe(`${name1}=${value1}; HttpOnly;`);
    });
    test.concurrent('sets the Secure from the cookie string', () => {
      const cookie = new SetCookie(`${name1}=${value1};Secure;`);
      expect(cookie.toHeader()).toBe(`${name1}=${value1}; Secure;`);
    });
    test.concurrent('sets the SameSite from the cookie string', () => {
      const cookie = new SetCookie(
        `${name1}=${value1};SameSite=${randomSameSite};`
      );
      expect(cookie.toHeader()).toBe(
        `${name1}=${value1}; SameSite=${randomSameSite};`
      );
    });
  });
  describe('SetCookie.toHeader()', () => {
    test.concurrent('prints the cookie string', () => {
      const cookie = new SetCookie();
      cookie.name = name1;
      cookie.value = value1;
      cookie.domain = randomDomain;
      cookie.path = randomPath;
      cookie.expires = randomExpires;
      cookie.maxAge = randomMaxAge;
      cookie.httpOnly = true;
      cookie.secure = true;
      // @ts-ignore
      cookie.sameSite = randomSameSite;
      expect(cookie.toHeader()).toBe(
        `${name1}=${value1}; Domain=${randomDomain}; Path=${randomPath}; Expires=${randomExpires.toUTCString()}; Max-Age=${randomMaxAge}; HttpOnly; Secure; SameSite=${randomSameSite};`
      );
    });
    test.concurrent(
      'returns an empty string if there is no name or value',
      () => {
        const cookie1 = new SetCookie();
        cookie1.domain = randomDomain;
        cookie1.path = randomPath;
        cookie1.expires = randomExpires;
        cookie1.maxAge = randomMaxAge;
        cookie1.httpOnly = true;
        cookie1.secure = true;
        // @ts-ignore
        cookie1.sameSite = randomSameSite;
        expect(cookie1.toHeader()).toBe('');

        const cookie2 = new SetCookie();
        cookie2.name = name1;
        expect(cookie2.toHeader()).toBe('');

        const cookie3 = new SetCookie();
        cookie3.value = value1;
        expect(cookie3.toHeader()).toBe('');

        const cookie4 = new SetCookie();
        cookie4.name = name1;
        cookie4.value = value1;
        expect(cookie4.toHeader()).toBe(`${name1}=${value1};`);
      }
    );
  });
});
