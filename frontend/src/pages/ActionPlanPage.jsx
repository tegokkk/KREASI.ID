import { useCallback, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router';
import { PageLayout } from '../components/layout/PageLayout';
import { ActivityNavigation } from '../components/navigation/ActivityNavigation';
import { StepIndicator } from '../components/navigation/StepIndicator';
import { ActivityErrorBoundary } from '../components/ui/ActivityErrorBoundary';
import { Button } from '../components/ui/Button';
import { InfoPanel } from '../components/ui/InfoPanel';
import { ActionPlanForm } from '../features/action-plan/ActionPlanForm';
import { ActionPlanSummary } from '../features/action-plan/ActionPlanSummary';
import {
  ACTION_PLAN_EXAMPLE,
  ACTION_PLAN_FIELDS,
  INITIAL_ACTION_PLAN_VALUES,
} from '../features/action-plan/template';
import { useJourney } from '../features/journey/JourneyProvider';
import { recapAnswers } from '../features/journey/recap-answers';
import { useEphemeralReset } from '../features/useEphemeralReset';
import styles from './ActivityPage.module.css';

function StaticActionPlanFallback() {
  return (
    <section className={styles.sectionCard} aria-labelledby="plan-fallback-heading">
      <h2 id="plan-fallback-heading" className="section-title">
        Template Action Plan 6 Bagian (Untuk Buku Catatan)
      </h2>
      <p>
        Salin format enam bagian di bawah ke buku catatan atau aplikasi catatan pribadimu untuk
        menyusun rencana:
      </p>
      <ol className={styles.fallbackList}>
        {ACTION_PLAN_FIELDS.map((field) => (
          <li key={field.id}>
            <strong>{field.label}</strong> ({field.required ? 'Wajib' : 'Opsional'}) —{' '}
            {field.helperText}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function ActionPlanPage() {
  const navigate = useNavigate();
  const { journey, stepsById, savingStepId, completeStep, clearRecapStep } = useJourney();
  const [values, setValues] = useState(INITIAL_ACTION_PLAN_VALUES);
  const [errors, setErrors] = useState({});
  const [submittedPlan, setSubmittedPlan] = useState(null);
  const [showExample, setShowExample] = useState(false);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [saveError, setSaveError] = useState('');

  const fieldRefs = useRef({});
  const summaryRef = useRef(null);

  const resetAll = useCallback(() => {
    setValues(INITIAL_ACTION_PLAN_VALUES);
    setErrors({});
    setSubmittedPlan(null);
    setConfirmingClear(false);
  }, []);

  useEphemeralReset(resetAll);

  const currentStep = stepsById['action-plan'];
  const isCompleted = currentStep?.status === 'completed';
  const canComplete = submittedPlan !== null || isCompleted;
  const hasAnyInput = Object.values(values).some((val) => val.length > 0);

  function handleChangeValue(fieldId, nextValue) {
    setSubmittedPlan(null);
    setValues((prev) => ({
      ...prev,
      [fieldId]: nextValue,
    }));
    if (errors[fieldId] && nextValue.trim().length > 0) {
      setErrors((prev) => {
        const nextErrors = { ...prev };
        delete nextErrors[fieldId];
        return nextErrors;
      });
    }
  }

  function handleSubmitPlan() {
    const nextErrors = {};
    let firstInvalidId = null;

    for (const field of ACTION_PLAN_FIELDS) {
      if (field.required && (values[field.id] || '').trim().length === 0) {
        nextErrors[field.id] = field.emptyError;
        if (!firstInvalidId) {
          firstInvalidId = field.id;
        }
      }
    }

    if (firstInvalidId) {
      setErrors(nextErrors);
      fieldRefs.current[firstInvalidId]?.focus();
      return;
    }

    setErrors({});
    setConfirmingClear(false);
    setSubmittedPlan({ ...values });
    requestAnimationFrame(() => {
      summaryRef.current?.focus();
    });
  }

  function handleEditPlan() {
    fieldRefs.current.potensi?.focus();
  }

  function handleRequestClear() {
    if (submittedPlan) {
      setConfirmingClear(true);
      requestAnimationFrame(() => {
        summaryRef.current?.focus();
      });
      return;
    }
    clearRecapStep('action-plan');
    resetAll();
  }

  async function handleComplete() {
    setSaveError('');
    const result = await completeStep('action-plan', recapAnswers(ACTION_PLAN_FIELDS, (field) => submittedPlan?.[field.id]));
    if (result.ok) {
      navigate('/#jelajahi');
      return;
    }
    setSaveError(result.error);
  }

  return (
    <PageLayout title="Action Plan — Langkah 6">
      <div className="container">
        <div className={`reading-column ${styles.pageStack}`}>
          <div className={styles.headerBlock}>
            <StepIndicator
              currentStep={6}
              label="Action Plan"
              status={currentStep?.status}
              steps={journey?.steps}
            />
            <h1 className="page-title">Action Plan</h1>
            <p className="lead-text">Susun satu rencana kecil yang bisa kamu mulai.</p>
          </div>

          <InfoPanel tone="mint" icon="privacy" title="Tersimpan di Rekap &amp; siap disalin">
            <p>
              Saat kamu menekan <strong>Selesai &amp; Kembali ke Perjalanan</strong>, Action Plan ini
              otomatis tersimpan ke menu Rekap Jawaban pada dashboardmu dan dapat dilihat staf
              terkait. Kamu juga dapat menyalinnya langsung ke catatan pribadi atau buku BK.
            </p>
          </InfoPanel>

          <section className={styles.sectionCard} aria-labelledby="example-plan-heading">
            <div className={styles.inlineActions}>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                aria-expanded={showExample}
                aria-controls="action-plan-example-box"
                onClick={() => setShowExample((prev) => !prev)}
              >
                <span>{showExample ? 'Tutup Contoh Rencana' : 'Lihat Contoh Rencana'}</span>
                {showExample ? (
                  <ChevronUp size={18} aria-hidden="true" />
                ) : (
                  <ChevronDown size={18} aria-hidden="true" />
                )}
              </Button>
            </div>

            {showExample && (
              <div id="action-plan-example-box" className={styles.subCardYellow + ' ' + styles.subCard}>
                <h2 id="example-plan-heading" className={styles.subTitle}>
                  Contoh Rencana Lengkap
                </h2>
                <ul className={styles.list}>
                  <li>
                    <strong>Potensi atau kemampuan:</strong> {ACTION_PLAN_EXAMPLE.potensi}
                  </li>
                  <li>
                    <strong>Tujuan:</strong> {ACTION_PLAN_EXAMPLE.tujuan}
                  </li>
                  <li>
                    <strong>Langkah atau kegiatan:</strong> {ACTION_PLAN_EXAMPLE.langkah}
                  </li>
                  <li>
                    <strong>Target waktu:</strong> {ACTION_PLAN_EXAMPLE.targetWaktu}
                  </li>
                  <li>
                    <strong>Cara memantau:</strong> {ACTION_PLAN_EXAMPLE.caraMemantau}
                  </li>
                  <li>
                    <strong>Evaluasi setelah mencoba:</strong> {ACTION_PLAN_EXAMPLE.evaluasi}
                  </li>
                </ul>
              </div>
            )}
          </section>

          <ActivityErrorBoundary fallback={<StaticActionPlanFallback />}>
            <ActionPlanForm
              fields={ACTION_PLAN_FIELDS}
              values={values}
              errors={errors}
              fieldRefs={fieldRefs}
              onChangeValue={handleChangeValue}
              onSubmitPlan={handleSubmitPlan}
              onRequestClear={handleRequestClear}
              hasAnyInput={hasAnyInput}
            />

            {submittedPlan && (
              <ActionPlanSummary
                ref={summaryRef}
                plan={submittedPlan}
                onEditPlan={handleEditPlan}
                onRequestClear={() => setConfirmingClear(true)}
                confirmingClear={confirmingClear}
                onConfirmClear={() => { clearRecapStep('action-plan'); resetAll(); }}
                onCancelClear={() => setConfirmingClear(false)}
              />
            )}
          </ActivityErrorBoundary>

          <details className={styles.fallbackDetails}>
            <summary className={styles.fallbackSummary}>
              Template teks 6 bagian (alternatif untuk ditulis di buku catatan)
            </summary>
            <ol className={styles.fallbackList}>
              {ACTION_PLAN_FIELDS.map((field) => (
                <li key={field.id}>
                  <strong>{field.label}</strong> ({field.required ? 'Wajib' : 'Opsional'}) —{' '}
                  {field.placeholder}
                </li>
              ))}
            </ol>
          </details>

          <ActivityNavigation
            prev={{ to: '/refleksi', label: 'Sebelumnya: Refleksi' }}
            next={{
              label: 'Selesai & Kembali ke Perjalanan',
              disabled: !canComplete,
              loading: savingStepId === 'action-plan',
              hint: !canComplete
                ? 'Lengkapi lima isian wajib lalu tekan Lihat Rencanaku untuk menampilkan ringkasan sebelum menyelesaikan Action Plan.'
                : undefined,
              onClick: handleComplete,
            }}
            error={saveError}
            onRetry={handleComplete}
          />
        </div>
      </div>
    </PageLayout>
  );
}
