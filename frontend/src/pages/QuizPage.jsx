import { useEffect, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { PageLayout } from '../components/layout/PageLayout';
import { ActivityNavigation } from '../components/navigation/ActivityNavigation';
import { StepIndicator } from '../components/navigation/StepIndicator';
import { ActivityErrorBoundary } from '../components/ui/ActivityErrorBoundary';
import { Button } from '../components/ui/Button';
import { InfoPanel } from '../components/ui/InfoPanel';
import { useJourney } from '../features/journey/JourneyProvider';
import { recapAnswers } from '../features/journey/recap-answers';
import { QuizForm } from '../features/quiz/QuizForm';
import { QuizResult } from '../features/quiz/QuizResult';
import { QUIZ_QUESTIONS, summarizeQuizResult } from '../features/quiz/questions';
import { DEFAULT_PUBLIC_CONFIG, fetchPublicConfig } from '../services/public-config';
import styles from './ActivityPage.module.css';

export function QuizPage() {
  const navigate = useNavigate();
  const { journey, stepsById, savingStepId, completeStep } = useJourney();
  const [publicConfig, setPublicConfig] = useState(DEFAULT_PUBLIC_CONFIG);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [formsConfirmed, setFormsConfirmed] = useState(false);
  const [saveError, setSaveError] = useState('');

  const resultRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchPublicConfig({ signal: controller.signal }).then((config) => {
      if (!controller.signal.aborted) {
        setPublicConfig(config);
        setLoadingConfig(false);
      }
    });

    return () => controller.abort();
  }, []);

  const isGoogleFormsMode =
    publicConfig.quiz.mode === 'google-forms' && Boolean(publicConfig.quiz.formUrl);

  const currentStep = stepsById.kuis;
  const isCompleted = currentStep?.status === 'completed';
  const hasQuizResult = isGoogleFormsMode ? formsConfirmed : submitted;
  const canContinue = isCompleted || hasQuizResult;

  function handleSelectOption(questionId, optionId) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  }

  function handleSubmitQuiz() {
    setSubmitted(true);
    requestAnimationFrame(() => {
      resultRef.current?.focus();
    });
  }

  function handleRetryQuiz() {
    setAnswers({});
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleComplete() {
    setSaveError('');
    let responses;
    if (!isGoogleFormsMode && submitted) {
      const summary = summarizeQuizResult(QUIZ_QUESTIONS, answers);
      responses = [
        {
          question: 'Hasil Kecenderungan Potensi',
          answer: summary.headline,
        },
        ...recapAnswers(QUIZ_QUESTIONS, (question) => {
          const chosen = question.options.find((option) => option.id === answers[question.id]);
          if (!chosen) return '';
          return `${chosen.id.toUpperCase()}. ${chosen.text}`;
        }),
      ];
    } else if (isGoogleFormsMode && formsConfirmed) {
      responses = [
        {
          question: 'Mode Kuis',
          answer: 'Dikerjakan melalui Google Forms (dikonfirmasi siswa)',
        },
      ];
    }
    const result = await completeStep('kuis', responses);
    if (result.ok) {
      navigate('/refleksi');
      return;
    }
    setSaveError(result.error);
  }

  return (
    <PageLayout title="Kuis — Langkah 4">
      <div className="container">
        <div className={`reading-column ${styles.pageStack}`}>
          <div className={styles.headerBlock}>
            <StepIndicator
              currentStep={4}
              label="Kuis"
              status={currentStep?.status}
              steps={journey?.steps}
            />
            <h1 className="page-title">Kuis KREASI.ID</h1>
            <p className="lead-text">
              Jawab lima pertanyaan berikut untuk mengenali kecenderungan potensi dirimu, mulai dari
              aktivitas yang kamu sukai, caramu menghadapi tantangan, hingga kemampuan yang ingin
              kamu kembangkan.
            </p>
          </div>

          <InfoPanel tone="blue" icon="info" title="Petunjuk pengisian kuis">
            <p>
              Tidak ada jawaban benar atau salah dalam kuis ini. Pilih jawaban yang paling sesuai
              dengan dirimu saat ini. Hasil kuis otomatis tersimpan ke Rekap Jawabanmu. Ingin
              membaca ulang materi? <Link to="/kenali-potensi">Buka Kenali Potensi</Link> atau{' '}
              <Link to="/mengembangkan-potensi">Mengembangkan Potensi</Link>.
            </p>
          </InfoPanel>

          {loadingConfig ? (
            <section className={styles.sectionCard} aria-live="polite">
              <p>Memuat pengaturan kuis...</p>
            </section>
          ) : isGoogleFormsMode ? (
            <section className={styles.sectionCard} aria-labelledby="forms-quiz-heading">
              <h2 id="forms-quiz-heading" className="section-title">
                Kerjakan kuis di Google Forms
              </h2>
              <p>
                Kuis ini membantumu mengenali kecenderungan potensi diri. Google Forms akan terbuka
                di tab baru. Setelah mengirim jawaban, kembali ke halaman KREASI.ID ini untuk lanjut
                ke Refleksi.
              </p>

              <InfoPanel tone="yellow" icon="privacy" title="Informasi data & privasi kuis">
                <p>
                  Jawaban pilihan ganda dan waktu pengiriman dicatat oleh layanan Google Forms dan
                  hanya dapat diakses pengelola layanan BK yang ditugaskan. Usulan masa simpan
                  respons maksimal {publicConfig.quiz.retentionDays} hari.
                </p>
                <p>
                  Email pribadi tidak dikumpulkan. Jika terdapat kolom komentar, jangan menuliskan
                  nama, alamat, nomor telepon, atau informasi sensitif.
                </p>
              </InfoPanel>

              <div className={styles.inlineActions}>
                <Button
                  href={publicConfig.quiz.formUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="primary"
                >
                  <span>Buka Kuis (Terbuka di tab baru)</span>
                  <ExternalLink size={18} aria-hidden="true" />
                </Button>
              </div>

              <label className={styles.fallbackSummary}>
                <input
                  type="checkbox"
                  checked={formsConfirmed}
                  onChange={(event) => setFormsConfirmed(event.target.checked)}
                  style={{ marginRight: '10px', width: '20px', height: '20px' }}
                />
                <span>Saya sudah mengerjakan kuis KREASI.ID dan siap lanjut ke Refleksi.</span>
              </label>
            </section>
          ) : (
            <>
              {publicConfig.isFallback && (
                <InfoPanel tone="yellow" icon="info" title="Mode kuis lokal aktif">
                  <p>
                    Pengaturan kuis eksternal tidak dapat dimuat saat ini. Kamu tetap dapat
                    mengerjakan seluruh lima pertanyaan Kuis KREASI.ID langsung di peramban ini.
                  </p>
                </InfoPanel>
              )}

              <ActivityErrorBoundary
                fallback={
                  <InfoPanel tone="error" icon="warning" title="Kuis sedang terkendala">
                    <p>Muat ulang halaman ini untuk mencoba mengerjakan Kuis KREASI.ID kembali.</p>
                  </InfoPanel>
                }
              >
                {submitted ? (
                  <QuizResult
                    ref={resultRef}
                    questions={QUIZ_QUESTIONS}
                    answers={answers}
                    onRetry={handleRetryQuiz}
                  />
                ) : (
                  <QuizForm
                    questions={QUIZ_QUESTIONS}
                    answers={answers}
                    onSelectOption={handleSelectOption}
                    onSubmitQuiz={handleSubmitQuiz}
                  />
                )}
              </ActivityErrorBoundary>
            </>
          )}

          <ActivityNavigation
            prev={{ to: '/mengembangkan-potensi', label: 'Sebelumnya: Mengembangkan Potensi' }}
            next={{
              label: 'Selesai & Lanjut ke Refleksi',
              disabled: !canContinue,
              loading: savingStepId === 'kuis',
              hint: !canContinue
                ? 'Jawab kelima pertanyaan kuis dan lihat hasilnya terlebih dahulu untuk membuka Refleksi.'
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
