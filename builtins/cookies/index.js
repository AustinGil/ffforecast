export class Cookies {
  constructor(cookiesHeader, options) { }

  _cookies = {};

  /**
   * @param {string} name
   * @param {string} value
   */
  add(name, value) { }

  /**
   * @param {string} name
   */
  get(name) {
    return '';
  }

  /**
   * @param {string} name
   */
  getAll(name) {
    return [''];
  }

  names() {
    return [''];
  }

  /** @param {string} name */
  delete(name) { }

  /**
   * @param {{
   * encode: (s:string) => string
   * }} options
   */
  toHeader(options) {
    return '';
  }
}

export const SetCookie = () => { };
