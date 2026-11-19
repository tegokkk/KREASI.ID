import assert from 'node:assert/strict';
import test from 'node:test';
import { readAuthConfig } from '../src/auth-config.js';

const production = {
  NODE_ENV: 'production',
  BETTER_AUTH_URL: 'https://kreasi.example',
  AUTH_TRUSTED_ORIGINS: 'https://kreasi.example',
  BETTER_AUTH_SECRET: 'test-only-secret-with-at-least-thirty-two-characters',
};

test('production auth rejects missing values, weak secrets, insecure and mismatched origins', () => {
  for (const key of ['BETTER_AUTH_URL', 'AUTH_TRUSTED_ORIGINS', 'BETTER_AUTH_SECRET']) {
    assert.throws(() => readAuthConfig({}, { ...production, [key]: '' }), /wajib/);
  }
  assert.throws(() => readAuthConfig({}, { ...production, BETTER_AUTH_SECRET: 'short' }), /32/);
  for (const value of ['http://localhost:3001', 'https://kreasi.example/path', 'https://user:password@kreasi.example']) {
    assert.throws(() => readAuthConfig({}, { ...production, BETTER_AUTH_URL: value }), /HTTPS/);
  }
  assert.throws(() => readAuthConfig({}, { ...production, AUTH_TRUSTED_ORIGINS: 'https://other.example' }), /mencakup/);
  assert.equal(readAuthConfig({}, production).baseURL, 'https://kreasi.example');
});

test('Vercel uses HTTPS production config and preview URL without trusting request headers', () => {
  assert.equal(readAuthConfig({}, { ...production, VERCEL: '1' }).production, true);
  assert.equal(readAuthConfig({}, { VERCEL: '1', VERCEL_ENV: 'preview', VERCEL_URL: 'kreasi-preview.vercel.app', BETTER_AUTH_SECRET: production.BETTER_AUTH_SECRET }).baseURL, 'https://kreasi-preview.vercel.app');
  assert.equal(readAuthConfig({}, { VERCEL: '1', VERCEL_ENV: 'production', VERCEL_PROJECT_PRODUCTION_URL: 'kreasi-production.vercel.app', BETTER_AUTH_SECRET: production.BETTER_AUTH_SECRET }).baseURL, 'https://kreasi-production.vercel.app');
  assert.equal(readAuthConfig({}, {}).baseURL, 'http://localhost:3001');
});
