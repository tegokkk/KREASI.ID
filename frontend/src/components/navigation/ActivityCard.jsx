import { Link } from 'react-router';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  FastForward,
  Lightbulb,
  ListChecks,
  Lock,
  Sparkles,
  Sprout,
  Target,
} from 'lucide-react';
import styles from './ActivityCard.module.css';

const ACTIVITY_ICONS = {
  Compass,
  Lightbulb,
  Sprout,
  ListChecks,
  BookOpen,
  Target,
};

const STATUS_META = {
  active: { label: 'Langkah Aktif', Icon: Sparkles },
  completed: { label: 'Selesai', Icon: CheckCircle2 },
  skipped: { label: 'Dilewati', Icon: FastForward },
  locked: { label: 'Belum Terbuka', Icon: Lock },
};

export function StepStatusBadge({ status, size = 'md' }) {
  const meta = STATUS_META[status];
  if (!meta) return null;
  const Icon = meta.Icon;

  return (
    <span
      className={[
        styles.statusBadge,
        styles[`badge_${status}`] || '',
        size === 'sm' ? styles.statusBadgeCompact : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Icon size={size === 'sm' ? 14 : 15} aria-hidden="true" />
      <span>{meta.label}</span>
    </span>
  );
}

export function ActivityCard({ activity, journeyStep, variant = 'default', onSelect }) {
  const Icon = ACTIVITY_ICONS[activity.iconName] || Compass;
  const status = journeyStep?.status || null;
  const isLocked = status === 'locked';
  const isCompact = variant === 'compact';

  let actionLabel = activity.ctaLabel;
  if (status === 'completed') {
    actionLabel = 'Buka Lagi';
  } else if (status === 'skipped') {
    actionLabel = 'Kerjakan Kembali';
  } else if (status === 'active') {
    actionLabel = activity.step === 1 ? 'Mulai Kegiatan' : 'Lanjutkan';
  }

  const prerequisite = journeyStep?.prerequisiteStep;
  const lockExplanation = prerequisite
    ? `Selesaikan Langkah ${prerequisite.step}: ${prerequisite.title} terlebih dahulu.`
    : 'Selesaikan langkah sebelumnya terlebih dahulu.';

  const cardClasses = [
    styles.card,
    isCompact ? styles.compact : '',
    isLocked ? styles.cardLocked : styles[activity.colorToken] || styles.blue,
    status === 'active' ? styles.cardActive : '',
    status === 'completed' ? styles.cardCompleted : '',
    status === 'skipped' ? styles.cardSkipped : '',
  ]
    .filter(Boolean)
    .join(' ');

  const content = isCompact ? (
    <>
      <span className={styles.compactIcon} aria-hidden="true">
        {isLocked ? <Lock size={18} strokeWidth={2.2} /> : <Icon size={18} strokeWidth={2.2} />}
      </span>
      <span className={styles.compactText}>
        <span className={styles.compactTitleRow}>
          <span className={styles.compactTitle}>
            {activity.step}. {activity.title}
          </span>
          {status && <StepStatusBadge status={status} size="sm" />}
        </span>
        <span className={styles.compactSub}>
          {isLocked ? lockExplanation : status === 'skipped' ? 'Klik untuk kerjakan kembali' : activity.description}
        </span>
      </span>
      {!isLocked && (
        <span className={styles.compactArrow} aria-hidden="true">
          <ArrowRight size={16} />
        </span>
      )}
    </>
  ) : (
    <>
      <div className={styles.topRow}>
        <div className={styles.chipsRow}>
          <span className={styles.stepChip}>Langkah {activity.step}</span>
          {status && <StepStatusBadge status={status} />}
        </div>
        <span className={styles.iconCircle} aria-hidden="true">
          {isLocked ? <Lock size={22} strokeWidth={2.2} /> : <Icon size={24} strokeWidth={2.2} />}
        </span>
      </div>

      <div className={styles.textBlock}>
        <div className={styles.mobileHeaderRow}>
          <span className={styles.mobileStepLabel}>Langkah {activity.step}</span>
          {status && <StepStatusBadge status={status} size="sm" />}
        </div>
        <h3 className={styles.title}>{activity.title}</h3>
        <p className={styles.description}>{isLocked ? lockExplanation : activity.description}</p>
      </div>

      {!isLocked ? (
        <div className={styles.footerRow}>
          <span className={styles.ctaText}>{actionLabel}</span>
          <span className={styles.arrowCircle} aria-hidden="true">
            <ArrowRight size={18} />
          </span>
        </div>
      ) : (
        <div className={styles.lockedFooter}>
          <Lock size={15} aria-hidden="true" />
          <span>Terkunci</span>
        </div>
      )}
    </>
  );

  if (isLocked) {
    return (
      <div
        className={cardClasses}
        aria-disabled="true"
        data-step-id={activity.id}
        data-step-status="locked"
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      to={activity.path}
      onClick={onSelect}
      className={cardClasses}
      data-step-id={activity.id}
      data-step-status={status || 'public'}
    >
      {content}
    </Link>
  );
}
