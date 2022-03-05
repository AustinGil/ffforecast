import nodeFetch from 'node-fetch';

/* global globalThis */
if (!globalThis.fetch) {
  // @ts-ignore
  globalThis.fetch = nodeFetch;
}

/**
 * @param {string} url
 * @param {{
 * method: "POST" | "GET" | "PUT" | "DELETE" | "HEAD" | "OPTIONS" | "PATCH" | "TRACE" | "CONNECT",
 * headers: Record<string, string>,
 * body: string,
 * }} options
 */
export const httpRequest = (url, options) => fetch(url);
