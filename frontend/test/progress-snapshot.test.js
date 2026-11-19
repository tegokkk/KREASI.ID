import assert from 'node:assert/strict';
import test from 'node:test';
import { newestJourney } from '../src/features/journey/progress-snapshot.js';

test('late progress reads cannot relock completed or skipped steps', () => {
  const snapshot = (statuses) => ({ steps: statuses.map((status, index) => ({ id: String(index), status })) });
  const initial = snapshot(['active', 'locked', 'locked']);
  const skipped = snapshot(['skipped', 'active', 'locked']);
  const complete = snapshot(['completed', 'completed', 'active']);
  assert.equal(newestJourney(null, initial), initial);
  assert.equal(newestJourney(skipped, initial), skipped);
  assert.equal(newestJourney(complete, skipped), complete);
  assert.equal(newestJourney(skipped, complete), complete);
  assert.throws(() => newestJourney(initial, {}), /Respons progres tidak valid/);
});
