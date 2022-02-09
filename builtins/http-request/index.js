import nodeFetch from 'node-fetch';

/* global globalThis */
if (!globalThis.fetch) {
  // @ts-ignore
  globalThis.fetch = nodeFetch;
}

export const httpRequest = (url) => fetch(url);
