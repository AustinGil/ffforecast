/**
 * @param {string | ReadableStream} body
 * @param {{
 * status: number,
 * headers: { [key: string]: string },
 * deny_reason: string,
 * }} options
 */
export function createResponse(body, options) {
  const response = {
    body: body,
    status: 200,
    headers: {},
    deny_reason: '',
    ...options,
  };
  return response;
}
