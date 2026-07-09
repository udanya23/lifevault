/**
 * ApiResponse - Standardized JSON response wrapper
 *
 * Every successful API response returns this shape:
 * { success: true, message: "...", data: {...}, meta: {...} }
 *
 * This enforces a consistent contract across all endpoints,
 * making frontend handling predictable and simple.
 */
class ApiResponse {
  /**
   * @param {number}  statusCode  - HTTP status code (200, 201, etc.)
   * @param {string}  message     - Human-readable success message
   * @param {*}       data        - Payload to send to client (object, array, null)
   * @param {object}  meta        - Optional metadata (pagination, totals, etc.)
   */
  constructor(statusCode, message = 'Success', data = null, meta = {}) {
    this.statusCode = statusCode;
    this.success = statusCode < 400; // true for 2xx / 3xx
    this.message = message;
    this.data = data;

    // Only attach meta if it contains properties (avoids empty {} noise)
    if (Object.keys(meta).length > 0) {
      this.meta = meta;
    }
  }

  /**
   * Send the response. Call this from controllers instead of res.json()
   * directly — keeps all responses uniform.
   *
   * @param {import('express').Response} res
   */
  send(res) {
    // Build the response body, always including the core fields
    const body = {
      success: this.success,
      message: this.message,
    };

    // Only attach data if it exists (avoids "data: null" on empty responses)
    if (this.data !== null && this.data !== undefined) {
      body.data = this.data;
    }

    if (this.meta) {
      body.meta = this.meta;
    }

    return res.status(this.statusCode).json(body);
  }
}

module.exports = ApiResponse;
