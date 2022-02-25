/**
 * @param {string | ReadableStream} body
 * @param {{
 * status: HTTPStatusCode,
 * headers: import("http").OutgoingHttpHeader,
 * deny_reason: string,
 * }} options
 */
export function createResponse(body, options) {
  options = {
    body: body,
    status: 200,
    headers: {},
    deny_reason: '',
    ...options,
  };
  return options;
}
