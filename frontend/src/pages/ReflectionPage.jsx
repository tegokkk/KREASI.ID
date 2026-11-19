import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { PageLayout } from '../components/layout/PageLayout';
import { ActivityNavigation } from '../components/navigation/ActivityNavigation';
import { StepIndicator } from '../components/navigation/StepIndicator';
import { ActivityErrorBoundary } from '../components/ui/ActivityErrorBoundary';
import { InfoPanel } from '../components/ui/InfoPanel';
import { useJourney } from '../features/journey/JourneyProvider';
import { ReflectionForm } from '../features/reflection/ReflectionForm';
import { REFLECTION_QUESTIONS } from '../features/reflection/questions';
import { useEphemeralReset } from '../features/useEphemeralReset';
import styles from './ActivityPage.module.css';

function StaticReflectionFallback() {
  return (
    <section className={styles.sectionCard} aria-labelledby="reflection-fallback-heading">
      <h2 id="reflection-fallback-heading" className="section-title">
        Pertanyaan Refleksi (Untuk Buku Catatan)
      </h2>
      <p>
        Tuliskan jawabanmu secara pribadi di buku catatan menggunakan enam pertanyaan berikut:
      </p>
      <ol className={styles.fallbackList}>
        {REFLECTION_QUESTIONS.map((q) => (
          <li key={q.id}>{q.prompt}</li>
        ))}
      </ol>
    </section>
  );
}

export function ReflectionPage() {
  const navigate = useNavigate();
  const { journey, stepsById, savingStepId, completeStep, skipStep } = useJourney();
  const [values, setValues] = useState({});
  const [saveError, setSaveError] = useState('');
  const [lastAction, setLastAction] = useState('complete');

  const resetAll = useCallback(() => {
    setValues({});
  }, []);

  useEphemeralReset(resetAll);

  const currentStep = stepsById.refleksi;
  const isCompleted = currentStep?.status === 'completed';
  const isSkipped = currentStep?.status === 'skipped';
  const isSaving = savingStepId === 'refleksi';

  function handleChangeValue(questionId, nextValue) {
    setValues((prev) => ({
      ...prev,
      [questionId]: nextValue,
    }));
  }

  async function handleProgress(action) {
    setLastAction(action);
    setSaveError('');
    // Never send private reflection text in progress requests.
    const result =
      action === 'skip'
        ? await skipStep('refleksi')
        : await completeStep('refleksi');

    if (result.ok) {
      navigate('/action-plan');
      return;
    }
    setSaveError(result.error);
  }

  return (
    <PageLayout title="Refleksi — Langkah 5">
      <div className="container">
        <div className={`reading-column ${styles.pageStack}`}>
          <div className={styles.headerBlock}>
            <StepIndicator
              currentStep={5}
              label="Refleksi"
              status={currentStep?.status}
              steps={journey?.steps}
            />
            <h1 className="page-title">Refleksi</h1>
            <p className="lead-text">
              Luangkan sejenak untuk memikirkan hal yang mulai kamu sadari dan ingin kamu coba.
              Jawabanmu bersifat pribadi—kamu bebas menentukan sendiri bagian mana yang ingin
              dibicarakan dengan guru BK.
            </p>
          </div>

          {isSkipped && (
            <InfoPanel tone="yellow" icon="info" title="Langkah ini sempat dilewati">
              <p>
                Kamu dapat menuliskan refleksimu secara pribadi di sini atau di buku catatan, lalu
                tekan <strong>Lanjut ke Action Plan</strong> untuk menandai langkah ini selesai.
              </p>
            </InfoPanel>
          )}

          <InfoPanel tone="pink" icon="privacy" title="Catatan pribadi & sementara">
            <p>
              Kamu boleh menulis di sini atau di buku catatan. Isian di halaman ini bersifat
              sementara dan akan hilang saat kamu keluar.
            </p>
          </InfoPanel>

          <InfoPanel tone="surface" icon="info" title="Alternatif: Tulis di buku catatan">
            <p>
              Kalau lebih nyaman memakai kertas atau buku tulis BK, kamu bisa membaca pertanyaan di
              bawah, mencatat di bukumu, lalu menekan <strong>Lanjut ke Action Plan</strong>.
            </p>
          </InfoPanel>

          <ActivityErrorBoundary fallback={<StaticReflectionFallback />}>
            <ReflectionForm
              questions={REFLECTION_QUESTIONS}
              values={values}
              onChangeValue={handleChangeValue}
              onClearAll={resetAll}
            />
          </ActivityErrorBoundary>

          <details className={styles.fallbackDetails}>
            <summary className={styles.fallbackSummary}>
              Lihat daftar pertanyaan Refleksi dalam teks (untuk ditulis di buku catatan)
            </summary>
            <ol className={styles.fallbackList}>
              {REFLECTION_QUESTIONS.map((q) => (
                <li key={q.id}>{q.prompt}</li>
              ))}
            </ol>
          </details>

          <ActivityNavigation
            prev={{ to: '/kuis', label: 'Sebelumnya: Kuis' }}
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
              label: 'Lanjut ke Action Plan',
              loading: isSaving && lastAction === 'complete',
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
