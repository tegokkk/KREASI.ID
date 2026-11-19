import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import Ajv from 'ajv-draft-04';
import { getTransformedRoutes } from '@vercel/routing-utils';

test('deployment config passes the official Vercel schema and route validation', () => {
  const config = JSON.parse(fs.readFileSync(new URL('../../vercel.json', import.meta.url)));
  const schema = JSON.parse(fs.readFileSync(new URL('./fixtures/vercel-schema.json', import.meta.url)));
  // The official draft-04 schema contains newer numeric bounds in experimental
  // trigger definitions. Convert those bounds to equivalent draft-04 keywords.
  function normalizeBounds(value) {
    if (!value || typeof value !== 'object') return;
    for (const [exclusive, inclusive] of [['exclusiveMinimum', 'minimum'], ['exclusiveMaximum', 'maximum']]) {
      if (typeof value[exclusive] === 'number') {
        value[inclusive] = value[exclusive]; value[exclusive] = true;
      }
    }
    Object.values(value).forEach(normalizeBounds);
  }
  normalizeBounds(schema);
  const validate = new Ajv({ strict: false, allErrors: true, validateFormats: false }).compile(schema);
  assert.equal(validate(config), true, JSON.stringify(validate.errors));
  const result = getTransformedRoutes(config);
  assert.equal(result.error, null, JSON.stringify(result.error));
});
