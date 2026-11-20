import { accountRequest, jsonRequest } from './auth.js';

export function getJourney() {
  return accountRequest('/api/journey');
}

export function checkStepAccess(stepId, options) {
  return jsonRequest(`/api/journey/steps/${encodeURIComponent(stepId)}/access`, options);
}

export function updateStepProgress(stepId, action, answers) {
  const body =
    action === 'complete' && Array.isArray(answers) && answers.length > 0
      ? { action, answers }
      : { action };
  return accountRequest(`/api/journey/steps/${encodeURIComponent(stepId)}`, {
    method: 'POST',
    body,
  });
}

export function getStudentRecap(options) {
  return accountRequest('/api/journey/recap', options);
}

export function saveStudentRecap(answers) {
  return accountRequest('/api/journey/recap', {
    method: 'PUT',
    body: { share: true, answers },
  });
}

export function deleteStudentRecap() {
  return accountRequest('/api/journey/recap', {
    method: 'DELETE',
  });
}
