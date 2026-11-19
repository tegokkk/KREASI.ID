import { TOTAL_STEPS } from '../../content/activities';
import { StepStatusBadge } from './ActivityCard';
import styles from './StepIndicator.module.css';

export function StepIndicator({ currentStep, label, status, steps }) {
  const segments = Array.from({ length: TOTAL_STEPS }, (_, idx) => {
    const stepNum = idx + 1;
    const stepObj = steps?.[idx];
    let stateClass = '';
    if (stepObj) {
      if (stepObj.status === 'completed') stateClass = styles.segmentCompleted;
      else if (stepObj.status === 'skipped') stateClass = styles.segmentSkipped;
      else if (stepNum === currentStep || stepObj.status === 'active') stateClass = styles.segmentActive;
    } else if (stepNum <= currentStep) {
      stateClass = styles.segmentActive;
    }
    return { stepNum, stateClass };
  });

  return (
    <div className={styles.wrapper} aria-label={`${label}, Langkah ${currentStep} dari ${TOTAL_STEPS}`}>
      <div className={styles.topRow}>
        <span className={styles.stepPill}>
          {label} · Langkah {currentStep} dari {TOTAL_STEPS}
        </span>
        {status && <StepStatusBadge status={status} />}
      </div>
      <div className={styles.segments} aria-hidden="true">
        {segments.map(({ stepNum, stateClass }) => (
          <span
            key={stepNum}
            className={[styles.segment, stateClass].filter(Boolean).join(' ')}
          />
        ))}
      </div>
    </div>
  );
}
