const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');

const { createApp } = require('../../src/server');

const app = createApp();

function sendRequest(url) {
  return new Promise((resolve, reject) => {
    const req = new EventEmitter();
    req.method = 'GET';
    req.url = url;
    req.headers = {};
    req.connection = { remoteAddress: '127.0.0.1' };
    req.socket = req.connection;

    const res = new EventEmitter();
    const chunks = [];

    res.statusCode = 200;
    res.headers = {};
    res.setHeader = (name, value) => {
      res.headers[name.toLowerCase()] = value;
    };
    res.getHeader = (name) => res.headers[name.toLowerCase()];
    res.removeHeader = (name) => {
      delete res.headers[name.toLowerCase()];
    };
    res.writeHead = (statusCode, headers = {}) => {
      res.statusCode = statusCode;
      for (const [name, value] of Object.entries(headers)) {
        res.setHeader(name, value);
      }
    };
    res.write = (chunk) => {
      if (chunk) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
    };
    res.end = (chunk) => {
      if (chunk) {
        res.write(chunk);
      }

      resolve({
        statusCode: res.statusCode,
        body: Buffer.concat(chunks).toString('utf8')
      });
    };

    try {
      app.handle(req, res, reject);
    } catch (error) {
      reject(error);
    }
  });
}

test('GET /health returns application status', async () => {
  const response = await sendRequest('/health');
  const body = JSON.parse(response.body);

  assert.equal(response.statusCode, 200);
  assert.equal(body.status, 'ok');
});

test('unknown routes return a JSON 404 response', async () => {
  const response = await sendRequest('/missing');
  const body = JSON.parse(response.body);

  assert.equal(response.statusCode, 404);
  assert.equal(body.error, 'Route not found');
});
