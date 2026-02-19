import { test, expect } from 'vitest';
import buildApp from '../src/app';

test('GET /health returns 200', async () => {
  const app = buildApp();
  const response = await app.inject({
    method: 'GET',
    url: '/health'
  });
  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual({ status: 'ok' });
});
