import { vi, describe, test, expect } from 'vitest';
import { faker } from '@faker-js/faker';
import fetch from 'node-fetch';
import { httpRequest } from './index.js';

vi.mock('node-fetch', () => {
  return {
    default: vi.fn(),
  };
});

describe('http-request', () => {
  test('httpRequest', async () => {
    const url = faker.internet.url();
    await httpRequest(url);
    const firstCallArguments = fetch.calls[0];
    expect(firstCallArguments[0]).toEqual(url);
  });
});
