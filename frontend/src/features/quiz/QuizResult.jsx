import { forwardRef } from 'react';
import { CheckCircle2, HelpCircle, RotateCcw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import styles from './QuizResult.module.css';

export const QuizResult = forwardRef(function QuizResult(
  { questions, answers, onRetry },
  ref
) {
  const correctCount = questions.reduce(
    (sum, question) => sum + (answers[question.id] === question.correctOptionId ? 1 : 0),
    0
  );

  let feedbackText =
    'Kamu bisa membaca ulang pembahasan di bawah atau kembali ke materi untuk memperkuat pemahamanmu.';
  if (correctCount === questions.length) {
    feedbackText =
      'Hebat! Kamu memahami seluruh konsep dasar tentang mengenali dan mengembangkan potensi diri.';
  } else if (correctCount >= 4) {
    feedbackText =
      'Bagus! Sebagian besar pemahamanmu sudah tepat. Tinjau kembali pembahasan untuk soal yang masih perlu diperkuat.';
  }

  return (
    <section
      ref={ref}
      tabIndex={-1}
      aria-labelledby="quiz-result-heading"
      className={styles.resultBox}
    >
      <div className={styles.scoreHeader}>
        <div>
          <p className={styles.scoreLabel}>Hasil Percobaan Ini</p>
          <h2 id="quiz-result-heading" className="section-title">
            {correctCount} dari {questions.length} jawaban benar
          </h2>
          <p className={styles.feedbackText}>{feedbackText}</p>
        </div>
        <Button type="button" variant="secondary" onClick={onRetry}>
          <RotateCcw size={18} aria-hidden="true" />
          <span>Ulangi Kuis</span>
        </Button>
      </div>

      <p className={styles.disclaimer}>
        Catatan: Nilai ini hanya menunjukkan pemahamanmu terhadap materi pada percobaan kali ini,
        bukan penilaian bakat atau nilai rapor sekolah.
      </p>

      <div className={styles.reviewList}>
        {questions.map((question) => {
          const userAnswerId = answers[question.id];
          const isCorrect = userAnswerId === question.correctOptionId;
          const userOption = question.options.find((opt) => opt.id === userAnswerId);
          const correctOption = question.options.find(
            (opt) => opt.id === question.correctOptionId
          );

          return (
            <article
              key={question.id}
              className={[
                styles.reviewItem,
                isCorrect ? styles.reviewCorrect : styles.reviewIncorrect,
              ].join(' ')}
            >
              <div className={styles.reviewTop}>
                <span className={styles.reviewNum}>
                  Soal {question.number} · {question.topic}
                </span>
                <span
                  className={[
                    styles.statusPill,
                    isCorrect ? styles.statusPillCorrect : styles.statusPillIncorrect,
                  ].join(' ')}
                >
                  {isCorrect ? (
                    <>
                      <CheckCircle2 size={15} aria-hidden="true" />
                      <span>Jawaban benar</span>
                    </>
                  ) : (
                    <>
                      <HelpCircle size={15} aria-hidden="true" />
                      <span>Perlu ditinjau</span>
                    </>
                  )}
                </span>
              </div>

              <h3 className={styles.reviewPrompt}>{question.prompt}</h3>

              <p className={styles.answerLine}>
                <strong>Jawabanmu:</strong>{' '}
                {userOption ? `${userOption.id.toUpperCase()}. ${userOption.text}` : '-'}
              </p>

              {!isCorrect && correctOption && (
                <p className={styles.answerLine}>
                  <strong>Jawaban tepat:</strong> {correctOption.id.toUpperCase()}.{' '}
                  {correctOption.text}
                </p>
              )}

              <p className={styles.explanation}>
                <strong>Pembahasan:</strong> {question.explanation}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
});
