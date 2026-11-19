// Server progress only advances (active -> skipped/completed -> completed).
// A slow GET must not replace a more recent completion with an older snapshot.
export function newestJourney(current, incoming) {
  if (!incoming || !Array.isArray(incoming.steps)) throw new Error('Respons progres tidak valid.');
  if (!current) return incoming;
  const nextSteps = new Map(incoming.steps.map((step) => [step.id, step.status]));
  const regresses = current.steps.some((step) =>
    (step.status === 'completed' && nextSteps.get(step.id) !== 'completed')
    || (step.status === 'skipped' && !['skipped', 'completed'].includes(nextSteps.get(step.id)))
  );
  return regresses ? current : incoming;
}
