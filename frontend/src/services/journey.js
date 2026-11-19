import { accountRequest, jsonRequest } from './auth.js';

export function getJourney() {
  return accountRequest('/api/journey');
}

export function checkStepAccess(stepId, options) {
  return jsonRequest(`/api/journey/steps/${encodeURIComponent(stepId)}/access`, options);
}

export function updateStepProgress(stepId, action) {
  return accountRequest(`/api/journey/steps/${encodeURIComponent(stepId)}`, {
    method: 'POST',
    body: { action },
  });
}
