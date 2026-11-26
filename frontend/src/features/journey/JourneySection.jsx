import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Compass,
  FastForward,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { ACTIVITIES } from '../../content/activities';
import { ActivityCard } from '../../components/navigation/ActivityCard';
import { Button } from '../../components/ui/Button';
import { InfoPanel } from '../../components/ui/InfoPanel';
import { useJourney } from './JourneyProvider';
import { useAuth } from '../auth/AuthProvider';
import { StudentMaterialsList } from '../materials/StudentMaterialsList';
import styles from './JourneySection.module.css';

const ACTIVITY_BY_ID = Object.fromEntries(ACTIVITIES.map((item) => [item.id, item]));
const ANSWER_ACTIVITIES = ACTIVITIES.filter((item) =>
  ['self-check', 'kuis', 'refleksi', 'action-plan'].includes(item.id)
);
const recapDateFormat = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

export function JourneySection({ id = 'jelajahi' }) {
  const {
    journey,
    stepsById,
    loading,
    error,
    refreshJourney,
    recap,
    recapLoading,
    recapError,
    refreshRecap,
    recapDraft,
  } = useJourney();
  const { user } = useAuth();
  const isStudent = user?.role === 'user';

  const summary = journey?.summary ?? {
    totalSteps: 6,
    completedCount: 0,
    skippedCount: 0,
    hasStarted: false,
    isAllCompleted: false,
    currentStepId: 'self-check',
  };

  const mergedSections = new Map(
    (recap?.answers || []).map((section) => [section.id, section])
  );
  for (const [stepId, entries] of Object.entries(recapDraft || {})) {
    if (Array.isArray(entries) && entries.length > 0) {
      mergedSections.set(stepId, { id: stepId, answers: entries });
    }
  }
  const savedRecapSections = ANSWER_ACTIVITIES.flatMap((activity) => {
    const section = mergedSections.get(activity.id);
    return section ? [{ activity, answers: section.answers }] : [];
  });

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
              ? 'Selamat! Keenam langkah eksplorasi sudah selesai. Kamu bisa meninjau kembali materi atau rekap jawabanmu kapan saja.'
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

      {isStudent && (
        <section
          id="rekap-jawaban"
          className={styles.recapSection}
          aria-labelledby="student-recap-heading"
        >
          <div className={styles.recapHeader}>
            <div className={styles.recapTitleGroup}>
              <div className={styles.recapBadgeRow}>
                <span className={styles.recapPill}>
                  <ClipboardList size={15} aria-hidden="true" />
                  <span>
                    {savedRecapSections.length} dari {ANSWER_ACTIVITIES.length} kegiatan terekam
                  </span>
                </span>
                {recap?.submittedAt && (
                  <span className={styles.recapDate}>
                    Terakhir diperbarui {recapDateFormat.format(new Date(recap.submittedAt))}
                  </span>
                )}
              </div>
              <h2 id="student-recap-heading" className="section-title">
                Rekap Jawabanmu
              </h2>
              <p className={styles.recapLead}>
                Jawaban dari Self-check, Kuis, Refleksi, dan Action Plan tersimpan otomatis setelah
                kamu menyelesaikan langkah agar bisa ditinjau kembali olehmu maupun guru BK sekolahmu.
              </p>
            </div>

            <div className={styles.recapHeaderAction}>
              <Button to="/rekap" size="sm" variant="secondary">
                <span>Buka Rekap Lengkap</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Button>
            </div>
          </div>

          {recapError && (
            <InfoPanel tone="error" icon="warning" role="alert" title="Rekap jawaban belum dapat dimuat">
              <p>{recapError}</p>
              <div className={styles.retryWrap}>
                <Button variant="secondary" size="sm" onClick={refreshRecap}>
                  Coba Lagi
                </Button>
              </div>
            </InfoPanel>
          )}

          {recapLoading && !recap ? (
            <div className={styles.recapLoading} role="status">
              <Loader2 size={18} aria-hidden="true" className={styles.spinner} />
              <span>Memuat rekap jawabanmu…</span>
            </div>
          ) : savedRecapSections.length > 0 ? (
            <div className={styles.recapList}>
              {savedRecapSections.map(({ activity, answers }, index) => (
                <details
                  key={activity.id}
                  className={styles.recapAccordion}
                  open={index === 0}
                >
                  <summary className={styles.recapSummary}>
                    <span className={styles.recapSummaryTitle}>
                      <span className={styles.recapStepTag}>Langkah {activity.step}</span>
                      <span>{activity.title}</span>
                    </span>
                    <span className={styles.recapSummaryMeta}>
                      <span>{answers.length} isian</span>
                      <ChevronDown size={16} aria-hidden="true" className={styles.recapChevron} />
                    </span>
                  </summary>
                  <dl className={styles.recapAnswers}>
                    {answers.map((entry, entryIdx) => (
                      <div key={`${activity.id}-${entryIdx}`} className={styles.recapAnswerItem}>
                        <dt>{entry.question}</dt>
                        <dd>{entry.answer}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
              ))}
            </div>
          ) : (
            <div className={styles.recapEmpty}>
              <BookOpen size={20} aria-hidden="true" className={styles.recapEmptyIcon} />
              <div className={styles.recapEmptyText}>
                <p>
                  <strong>Belum ada jawaban terekam.</strong>
                </p>
                <p>
                  Selesaikan Self-check, Kuis, Refleksi, atau Action Plan untuk melihat rekapan
                  jawabanmu tampil langsung di sini. Jika kamu menuntaskan kegiatan sebelum fitur
                  ini aktif, buka kembali kegiatan tersebut lalu tekan tombol Selesai untuk
                  menyimpan jawabannya.
                </p>
              </div>
            </div>
          )}
        </section>
      )}

      {isStudent && (
        <StudentMaterialsList
          collapsible
          heading="Materi dari Guru BK & Sekolah"
          lead="Klik judul materi di bawah untuk membaca materi tambahan dari Superadmin atau Guru BK sekolahmu."
        />
      )}
    </section>
  );
}
