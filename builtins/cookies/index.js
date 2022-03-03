export class SetCookie {
  /**
   * @param {string | Partial<Omit<SetCookie, 'toHeader'>>} [cookieHeader={}]
   * @param {{decode(s:string):string}} [options={decode:v=>v}]
   */
  // eslint-disable-next-line unicorn/no-object-as-default-parameter
  constructor(cookieHeader = {}, options = { decode: (v) => v }) {
    const decode = options.decode || ((v) => v);
    if (typeof cookieHeader === 'string') {
      for (const pair of cookieHeader.split(';')) {
        // Grab each attribute in the cookie string as lowercase without extra spaces
        let [name, value] = pair.split('=');
        name = name.trim();
        value = value ? value.trim() : value;

        // break early in case of trailing semicolon (eg. "foo=bar; ")
        if (!name) continue;

        const key = name.toLowerCase();

        switch (key) {
          case 'max-age': {
            this.maxAge = Number(value);
            break;
          }
          case 'expires': {
            this.expires = new Date(value);
            break;
          }
          case 'httponly': {
            this.httpOnly = true;
            break;
          }
          case 'secure': {
            this.secure = true;
            break;
          }
          case 'samesite': {
            // @ts-ignore
            this.sameSite = value;
            break;
          }
          default:
            if (['domain', 'path'].includes(key)) {
              this[key] = value;
            } else {
              this.name = name;
              this.value = decode(value);
            }
        }
      }
    } else {
      Object.assign(this, cookieHeader);
      this.value = decode(this.value);
    }
  }

  name = '';
  value = '';
  domain = '';
  path = '';
  /** @type {Date} */
  expires;
  /** @type {number} in seconds */
  maxAge;
  httpOnly = false;
  secure = false;
  /** @type {'Strict'|'Lax'|'None'} */
  sameSite;

  toHeader() {
    const {
      name,
      value,
      domain,
      path,
      expires,
      maxAge,
      httpOnly,
      secure,
      sameSite,
    } = this;
    if (!name || !value) return '';
    let cookie = `${name}=${value};`;
    if (domain) cookie += ` Domain=${domain};`;
    if (path) cookie += ` Path=${path};`;
    if (expires) cookie += ` Expires=${new Date(expires).toUTCString()};`;
    if (maxAge) cookie += ` Max-Age=${maxAge};`;
    if (httpOnly) cookie += ` HttpOnly;`;
    if (secure) cookie += ` Secure;`;
    if (sameSite) cookie += ` SameSite=${sameSite};`;
    return cookie;
  }
}

export class Cookies {
  /** @type {Array<Array<string>>} */
  #cookies;

  /**
   * @param {string} [cookiesHeader='']
   * @param {{ decode(v:string):string }} [options={decode:v=>v}]
   */
  constructor(
    cookiesHeader = '',
    // eslint-disable-next-line unicorn/no-object-as-default-parameter
    options = {
      decode: (v) => v,
    }
  ) {
    const cookies = [];
    for (const cookie of cookiesHeader.split(';')) {
      let [name, value] = cookie.split('=');
      name = name.trim();
      value = value ? value.trim() : value;
      if (!name) continue; // in case of trailing semicolon
      cookies.push([name, options.decode(value)]);
    }
    this.#cookies = cookies;
  }

  /**
   * @param {string} name
   * @param {string} value
   */
  add(name, value) {
    if (!name || !value) return;
    this.#cookies.push([name, value]);
  }
  /** @param {string} name */
  get(name) {
    const cookie = this.#cookies.find((cookie) => cookie[0] === name);
    if (!cookie) return;
    return cookie[1];
  }
  /** @param {string} name */
  getAll(name) {
    return this.#cookies
      .filter((cookie) => cookie[0] === name) // Filter out just the cookies with the given name
      .map((cookie) => cookie[1]); // Map to just the values
  }
  names() {
    const allName = this.#cookies.map((cookie) => cookie[0]);
    // Remove duplicates
    return [...new Set(allName)];
  }
  /** @param {string} name */
  delete(name) {
    this.#cookies = this.#cookies.filter((cookie) => {
      return cookie[0] !== name;
    });
  }
  /**
   * @param {{encode(s:string):string}} [options={encode:v=>v}]
   */
  // eslint-disable-next-line unicorn/no-object-as-default-parameter
  toHeader(options = { encode: (v) => v }) {
    const encoded = this.#cookies.map((cookie) => {
      return `${cookie[0]}=${options.encode(cookie[1])}`;
    });
    return encoded.join('; ') + ';';
  }
}
