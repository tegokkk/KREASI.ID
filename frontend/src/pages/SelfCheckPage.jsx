import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { PageLayout } from '../components/layout/PageLayout';
import { ActivityNavigation } from '../components/navigation/ActivityNavigation';
import { StepIndicator } from '../components/navigation/StepIndicator';
import { ActivityErrorBoundary } from '../components/ui/ActivityErrorBoundary';
import { InfoPanel } from '../components/ui/InfoPanel';
import { useJourney } from '../features/journey/JourneyProvider';
import { SelfCheckForm } from '../features/self-check/SelfCheckForm';
import { SelfCheckSummary } from '../features/self-check/SelfCheckSummary';
import { SELF_CHECK_QUESTIONS } from '../features/self-check/questions';
import { useEphemeralReset } from '../features/useEphemeralReset';
import styles from './ActivityPage.module.css';

function StaticSelfCheckFallback() {
  return (
    <section className={styles.sectionCard} aria-labelledby="sc-fallback-title">
      <h2 id="sc-fallback-title" className="section-title">
        Pertanyaan Self-check (Versi Teks)
      </h2>
      <p>
        Jika komponen interaktif tidak dapat digunakan, kamu tetap bisa membaca kelima
        pertanyaan ini dan mencatat jawabannya di buku catatanmu:
      </p>
      <ol className={styles.fallbackList}>
        {SELF_CHECK_QUESTIONS.map((q) => (
          <li key={q.id}>
            <strong>{q.prompt}</strong>
            <p className="supporting-text">Contoh pilihan: {q.options.join(', ')}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function SelfCheckPage() {
  const navigate = useNavigate();
  const { journey, stepsById, savingStepId, completeStep, skipStep } = useJourney();
  const [answers, setAnswers] = useState({});
  const [showSummary, setShowSummary] = useState(false);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [lastAction, setLastAction] = useState('complete');

  const summaryRef = useRef(null);
  const firstInputRef = useRef(null);

  const resetAll = useCallback(() => {
    setAnswers({});
    setShowSummary(false);
    setConfirmingClear(false);
  }, []);

  function handleClearAnswers() {
    setAnswers({});
    setConfirmingClear(false);
  }

  useEphemeralReset(resetAll);

  const currentStep = stepsById['self-check'];
  const isCompleted = currentStep?.status === 'completed';
  const isSkipped = currentStep?.status === 'skipped';
  const canComplete = showSummary || isCompleted;
  const isSaving = savingStepId === 'self-check';
  const hasAnySelection = Object.values(answers).some((list) => list.length > 0);

  function handleToggleOption(questionId, option) {
    setConfirmingClear(false);
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      const exists = current.includes(option);
      const nextList = exists
        ? current.filter((item) => item !== option)
        : [...current, option];
      return {
        ...prev,
        [questionId]: nextList,
      };
    });
  }

  function handleShowSummary() {
    setShowSummary(true);
    setConfirmingClear(false);
    requestAnimationFrame(() => {
      summaryRef.current?.focus();
    });
  }

  function handleEditAnswers() {
    firstInputRef.current?.focus();
  }

  function handleRequestClear() {
    setShowSummary(true);
    setConfirmingClear(true);
    requestAnimationFrame(() => {
      summaryRef.current?.focus();
    });
  }

  async function handleProgress(action) {
    setLastAction(action);
    setSaveError('');
    const result =
      action === 'skip'
        ? await skipStep('self-check')
        : await completeStep('self-check');

    if (result.ok) {
      navigate('/kenali-potensi');
      return;
    }
    setSaveError(result.error);
  }

  return (
    <PageLayout title="Self-check — Langkah 1">
      <div className="container">
        <div className={`reading-column ${styles.pageStack}`}>
          <div className={styles.headerBlock}>
            <StepIndicator
              currentStep={1}
              label="Self-check"
              status={currentStep?.status}
              steps={journey?.steps}
            />
            <h1 className="page-title">Self-check</h1>
            <p className="lead-text">
              Kenali kegiatan dan kemampuan yang terasa dekat dengan keseharianmu saat ini.
            </p>
          </div>

          {isSkipped && (
            <InfoPanel tone="yellow" icon="info" title="Langkah ini sempat dilewati">
              <p>
                Kamu dapat menandai pilihan dan menekan <strong>Lihat Catatanku</strong> untuk
                menyelesaikan langkah ini sekarang.
              </p>
            </InfoPanel>
          )}

          <InfoPanel tone="mint" icon="privacy" title="Bersifat pribadi & tidak menentukan bakat">
            <p>
              Jawabanmu membantu kamu melihat hal yang menarik untuk dicoba. Hasil ini tidak
              menentukan bakatmu dan tidak dikirim ke mana pun.
            </p>
          </InfoPanel>

          <ActivityErrorBoundary fallback={<StaticSelfCheckFallback />}>
            <SelfCheckForm
              questions={SELF_CHECK_QUESTIONS}
              answers={answers}
              onToggleOption={handleToggleOption}
              onShowSummary={handleShowSummary}
              onClearRequest={handleRequestClear}
              hasAnySelection={hasAnySelection}
              firstInputRef={firstInputRef}
            />

            {showSummary && (
              <SelfCheckSummary
                ref={summaryRef}
                questions={SELF_CHECK_QUESTIONS}
                answers={answers}
                onEditAnswers={handleEditAnswers}
                onClearAnswers={handleClearAnswers}
                confirmingClear={confirmingClear}
                onCancelClear={() => setConfirmingClear(false)}
                onRequestClear={() => setConfirmingClear(true)}
              />
            )}
          </ActivityErrorBoundary>

          <details className={styles.fallbackDetails}>
            <summary className={styles.fallbackSummary}>
              Lihat daftar pertanyaan Self-check dalam format teks (untuk buku catatan)
            </summary>
            <ol className={styles.fallbackList}>
              {SELF_CHECK_QUESTIONS.map((q) => (
                <li key={q.id}>
                  <strong>{q.prompt}</strong>
                  <p className="supporting-text">Pilihan: {q.options.join(' · ')}</p>
                </li>
              ))}
            </ol>
          </details>

          <ActivityNavigation
            prev={{ to: '/#jelajahi', label: 'Kembali ke Perjalanan' }}
            skip={
              !isCompleted
                ? {
                    label: 'Lewati untuk sekarang',
                    loading: isSaving && lastAction === 'skip',
                    onClick: () => handleProgress('skip'),
                  }
                : undefined
            }
            next={{
              label: 'Selesai & Lanjut ke Kenali Potensi',
              disabled: !canComplete,
              loading: isSaving && lastAction === 'complete',
              hint: !canComplete
                ? 'Tekan Lihat Catatanku terlebih dahulu untuk melihat rangkuman pilihanmu, atau pilih Lewati untuk sekarang.'
                : undefined,
              onClick: () => handleProgress('complete'),
            }}
            error={saveError}
            onRetry={() => handleProgress(lastAction)}
          />
        </div>
      </div>
    </PageLayout>
  );
}
