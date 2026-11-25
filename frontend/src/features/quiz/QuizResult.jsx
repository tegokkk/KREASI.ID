import { forwardRef } from 'react';
import { CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { QUIZ_PROFILES, summarizeQuizResult } from './questions';
import styles from './QuizResult.module.css';

export const QuizResult = forwardRef(function QuizResult(
  { questions, answers, onRetry },
  ref
) {
  const summary = summarizeQuizResult(questions, answers);

  return (
    <section
      ref={ref}
      tabIndex={-1}
      aria-labelledby="quiz-result-heading"
      className={styles.resultBox}
    >
      <div className={styles.scoreHeader}>
        <div>
          <p className={styles.scoreLabel}>Hasil Kuis KREASI.ID</p>
          <h2 id="quiz-result-heading" className="section-title">
            {summary.headline}
          </h2>
          {summary.topProfiles.map((profile) => (
            <div key={profile.id} className={styles.profileBlock}>
              <p className={styles.feedbackText}>
                <strong>{profile.label}:</strong> {profile.summary}
              </p>
              <p className={styles.suggestionText}>
                <Sparkles size={16} aria-hidden="true" />
                <span>{profile.suggestion}</span>
              </p>
            </div>
          ))}
        </div>
        <Button type="button" variant="secondary" onClick={onRetry}>
          <RotateCcw size={18} aria-hidden="true" />
          <span>Ulangi Kuis</span>
        </Button>
      </div>

      <p className={styles.disclaimer}>
        Catatan: Tidak ada jawaban benar atau salah dalam kuis ini. Hasil ini membantumu mengenali
        kecenderungan potensi saat ini sebagai bahan refleksi, bukan penilaian mutlak atau nilai
        rapor sekolah.
      </p>

      <div className={styles.reviewList}>
        {questions.map((question) => {
          const userAnswerId = answers[question.id];
          const userOption = question.options.find((opt) => opt.id === userAnswerId);
          const profile = userAnswerId ? QUIZ_PROFILES[userAnswerId] : null;

          return (
            <article key={question.id} className={`${styles.reviewItem} ${styles.reviewCorrect}`}>
              <div className={styles.reviewTop}>
                <span className={styles.reviewNum}>
                  Soal {question.number} · {question.topic}
                </span>
                {profile && (
                  <span className={`${styles.statusPill} ${styles.statusPillCorrect}`}>
                    <CheckCircle2 size={15} aria-hidden="true" />
                    <span>{profile.shortLabel}</span>
                  </span>
                )}
              </div>

              <h3 className={styles.reviewPrompt}>{question.prompt}</h3>

              <p className={styles.answerLine}>
                <strong>Jawabanmu:</strong>{' '}
                {userOption ? `${userOption.id.toUpperCase()}. ${userOption.text}` : '-'}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
});
