import { ArrowRight, CheckCircle2, Compass, FastForward, Loader2, Sparkles } from 'lucide-react';
import { ACTIVITIES } from '../../content/activities';
import { ActivityCard } from '../../components/navigation/ActivityCard';
import { Button } from '../../components/ui/Button';
import { InfoPanel } from '../../components/ui/InfoPanel';
import { useJourney } from './JourneyProvider';
import { useAuth } from '../auth/AuthProvider';
import styles from './JourneySection.module.css';

const ACTIVITY_BY_ID = Object.fromEntries(ACTIVITIES.map((item) => [item.id, item]));

export function JourneySection({ id = 'jelajahi' }) {
  const { journey, stepsById, loading, error, refreshJourney } = useJourney();
  const { user } = useAuth();

  const summary = journey?.summary ?? {
    totalSteps: 6,
    completedCount: 0,
    skippedCount: 0,
    hasStarted: false,
    isAllCompleted: false,
    currentStepId: 'self-check',
  };

  const currentActivity = ACTIVITY_BY_ID[summary.currentStepId] || ACTIVITIES[0];
  let primaryLabel = 'Mulai Perjalanan';
  if (summary.isAllCompleted) {
    primaryLabel = 'Tinjau Action Plan';
  } else if (summary.hasStarted) {
    primaryLabel = 'Lanjutkan Kegiatan';
  }

  return (
    <section
      id={id}
      tabIndex={-1}
      className={styles.section}
      aria-labelledby="journey-heading"
    >
      <div className={styles.heroPanel}>
        <div className={styles.heroLeft}>
          <span className={styles.eyebrow}>
            <Compass size={16} aria-hidden="true" />
            <span>Alur Terpandu Siswa SMP</span>
          </span>
          <h1 id="journey-heading" className="page-title">
            Perjalanan Potensimu
          </h1>
          <p className={styles.heroLead}>
            {summary.isAllCompleted
              ? 'Selamat! Keenam langkah eksplorasi sudah selesai. Kamu bisa meninjau kembali materi atau rencanamu kapan saja.'
              : 'Ikuti enam langkah secara berurutan dari Self-check sampai Action Plan. Langkah yang dilewati tetap bisa kamu kerjakan kembali nanti.'}
          </p>

          <div className={styles.countsRow} aria-label="Ringkasan progres perjalanan">
            <span className={styles.countPillCompleted}>
              <CheckCircle2 size={16} aria-hidden="true" />
              <span>
                <strong>{summary.completedCount}</strong> dari {summary.totalSteps} selesai
              </span>
            </span>

            <span className={styles.countPillSkipped}>
              <FastForward size={16} aria-hidden="true" />
              <span>
                <strong>{summary.skippedCount}</strong> dilewati
              </span>
            </span>

            {summary.isAllCompleted && (
              <span className={styles.countPillDone}>
                <Sparkles size={16} aria-hidden="true" />
                <span>Perjalanan tuntas!</span>
              </span>
            )}
          </div>

          <div className={styles.progressTrack} aria-hidden="true">
            {ACTIVITIES.map((activity) => {
              const stepStatus = stepsById[activity.id]?.status || 'locked';
              return (
                <span
                  key={activity.id}
                  className={[
                    styles.progressSegment,
                    styles[`segment_${stepStatus}`] || '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                />
              );
            })}
          </div>
        </div>

        <div className={styles.heroRight}>
          <div className={styles.nextStepBox}>
            <span className={styles.nextLabel}>
              {summary.isAllCompleted ? 'Semua langkah selesai' : 'Langkah berikutnya'}
            </span>
            <p className={styles.nextTitle}>
              Langkah {currentActivity.step}: {currentActivity.title}
            </p>
            <Button to={currentActivity.path} variant="onHero" onDark fullWidth>
              <span>{primaryLabel}</span>
              <ArrowRight size={18} aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      {summary.isAllCompleted && user?.role === 'user' && <Button to="/rekap" variant="secondary">Buka Rekap Jawaban</Button>}

      {error && (
        <InfoPanel tone="error" icon="warning" role="alert" title="Progres perjalanan belum dapat dimuat">
          <p>{error}</p>
          <div className={styles.retryWrap}>
            <Button variant="secondary" size="sm" onClick={refreshJourney}>
              Coba Lagi
            </Button>
          </div>
        </InfoPanel>
      )}

      {loading && !journey ? (
        <div className={styles.loadingCard} role="status">
          <Loader2 size={22} aria-hidden="true" className={styles.spinner} />
          <span>Memuat rangkaian enam kegiatanmu…</span>
        </div>
      ) : (
        <ol className={styles.journeyTrack} aria-label="Enam langkah Perjalanan Potensimu">
          {ACTIVITIES.map((activity) => {
            const journeyStep = stepsById[activity.id] || {
              id: activity.id,
              step: activity.step,
              status: activity.step === 1 ? 'active' : 'locked',
              accessible: activity.step === 1,
              prerequisiteStep:
                activity.step > 1
                  ? {
                      id: ACTIVITIES[activity.step - 2].id,
                      step: ACTIVITIES[activity.step - 2].step,
                      title: ACTIVITIES[activity.step - 2].title,
                    }
                  : null,
            };

            return (
              <li key={activity.id} className={styles.journeyNode}>
                <span
                  className={[
                    styles.nodeMarker,
                    styles[`marker_${journeyStep.status}`] || '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-hidden="true"
                >
                  {activity.step}
                </span>
                <div className={styles.nodeCard}>
                  <ActivityCard
                    activity={activity}
                    journeyStep={journeyStep}
                    variant="journey"
                  />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
