import { describe, test, expect } from 'vitest';
import { faker } from '@faker-js/faker';
import { createResponse } from './index.js';

const randomBody = faker.random.word();
const randomStatus = faker.random.arrayElement([200, 400, 500]);
const randomHeaderKey = faker.random.word();
const randomHeaderValue = faker.random.word();
const randomDenyReason = faker.random.words();

describe('createResponse', () => {
  test.concurrent('generates default values', () => {
    // @ts-ignore
    const result = createResponse();
    expect(result).toMatchObject({
      body: undefined,
      status: 200,
      headers: {},
      deny_reason: '',
    });
  });
  test.concurrent('adds body to response', () => {
    const result = createResponse(randomBody);
    expect(result).toMatchObject({
      body: randomBody,
      status: 200,
      headers: {},
      deny_reason: '',
    });
  });
  test.concurrent('adds status to response', () => {
    const result = createResponse(randomBody, { status: randomStatus });
    expect(result).toMatchObject({
      body: randomBody,
      status: randomStatus,
      headers: {},
      deny_reason: '',
    });
  });
  test.concurrent('adds headers to response', () => {
    const result = createResponse(randomBody, {
      headers: { [`X-${randomHeaderKey}`]: randomHeaderValue },
    });
    expect(result).toMatchObject({
      body: randomBody,
      status: 200,
      headers: { [`X-${randomHeaderKey}`]: randomHeaderValue },
      deny_reason: '',
    });
  });
  test.concurrent('adds deny_reason to response', () => {
    const result = createResponse(randomBody, {
      deny_reason: randomDenyReason,
    });
    expect(result).toMatchObject({
      body: randomBody,
      status: 200,
      headers: {},
      deny_reason: randomDenyReason,
    });
  });
});
