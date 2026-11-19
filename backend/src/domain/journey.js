export const JOURNEY_STEPS = [
  {
    id: 'self-check',
    step: 1,
    path: '/self-check',
    title: 'Self-check',
    allowSkip: true,
  },
  {
    id: 'kenali-potensi',
    step: 2,
    path: '/kenali-potensi',
    title: 'Kenali Potensi',
    allowSkip: false,
  },
  {
    id: 'mengembangkan-potensi',
    step: 3,
    path: '/mengembangkan-potensi',
    title: 'Mengembangkan Potensi',
    allowSkip: false,
  },
  {
    id: 'kuis',
    step: 4,
    path: '/kuis',
    title: 'Kuis',
    allowSkip: false,
  },
  {
    id: 'refleksi',
    step: 5,
    path: '/refleksi',
    title: 'Refleksi',
    allowSkip: true,
  },
  {
    id: 'action-plan',
    step: 6,
    path: '/action-plan',
    title: 'Action Plan',
    allowSkip: false,
  },
];

const STEP_INDEX_BY_ID = new Map(JOURNEY_STEPS.map((step, index) => [step.id, index]));

export function buildJourneyState(rows = []) {
  const rowByStepId = new Map(rows.map((row) => [row.step_id, row]));

  let previousAllUnlocked = true;
  let activeAssigned = false;
  let completedCount = 0;
  let skippedCount = 0;
  let unlockedCount = 0;
  let firstActiveId = null;
  let firstSkippedId = null;

  const steps = JOURNEY_STEPS.map((meta, index) => {
    const saved = rowByStepId.get(meta.id);
    const prerequisite = index > 0 ? JOURNEY_STEPS[index - 1] : null;
    const accessible = index === 0 || previousAllUnlocked;

    let status;
    let completedAt = null;

    if (!accessible) {
      status = 'locked';
    } else if (saved?.status === 'completed') {
      status = 'completed';
      completedAt = saved.completed_at ?? null;
      completedCount += 1;
      unlockedCount += 1;
    } else if (saved?.status === 'skipped') {
      status = 'skipped';
      skippedCount += 1;
      unlockedCount += 1;
      if (!firstSkippedId) firstSkippedId = meta.id;
    } else if (!activeAssigned) {
      status = 'active';
      activeAssigned = true;
      unlockedCount += 1;
      firstActiveId = meta.id;
    } else {
      status = 'locked';
    }

    previousAllUnlocked = Boolean(
      accessible && (saved?.status === 'completed' || saved?.status === 'skipped')
    );

    return {
      id: meta.id,
      step: meta.step,
      path: meta.path,
      title: meta.title,
      allowSkip: meta.allowSkip,
      status,
      accessible: status !== 'locked',
      completedAt,
      prerequisiteStep:
        status === 'locked' && prerequisite
          ? { id: prerequisite.id, step: prerequisite.step, title: prerequisite.title }
          : null,
    };
  });

  const currentStepId =
    firstActiveId ?? firstSkippedId ?? JOURNEY_STEPS[JOURNEY_STEPS.length - 1].id;

  return {
    steps,
    summary: {
      totalSteps: JOURNEY_STEPS.length,
      completedCount,
      skippedCount,
      unlockedCount,
      hasStarted: completedCount > 0 || skippedCount > 0,
      isAllCompleted: completedCount === JOURNEY_STEPS.length,
      currentStepId,
    },
  };
}


