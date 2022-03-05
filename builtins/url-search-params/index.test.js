import { vi, describe, test, expect } from 'vitest';
import { faker } from '@faker-js/faker';
import URLSearchParameters from './index.js';

vi.mock('node-fetch', () => {
  return {
    default: vi.fn(),
  };
});

describe('http-request', () => {
  test('httpRequest', async () => {
    const myInput = '';
    const query = new URLSearchParameters(myInput);

    // const firstCallArguments = nodeFetch.calls[0];
    // expect(firstCallArguments[0]).toEqual(url);
  });
});
