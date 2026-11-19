import { useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { InfoPanel } from '../../components/ui/InfoPanel';
import styles from './QuizForm.module.css';

export function QuizForm({ questions, answers, onSelectOption, onSubmitQuiz }) {
  const [missingIds, setMissingIds] = useState([]);
  const [validationMessage, setValidationMessage] = useState('');
  const firstOptionRefs = useRef({});

  function handleSubmit(event) {
    event.preventDefault();
    const unanswered = questions
      .filter((question) => !answers[question.id])
      .map((question) => question.id);

    if (unanswered.length > 0) {
      setMissingIds(unanswered);
      setValidationMessage(
        `Masih ada ${unanswered.length} soal yang belum dipilih. Pilih satu jawaban untuk setiap soal sebelum melihat hasil.`
      );
      const firstMissingId = unanswered[0];
      firstOptionRefs.current[firstMissingId]?.focus();
      return;
    }

    setMissingIds([]);
    setValidationMessage('');
    onSubmitQuiz();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {validationMessage && (
        <InfoPanel tone="error" icon="warning" role="alert" title="Lengkapi semua soal terlebih dahulu">
          <p>{validationMessage}</p>
        </InfoPanel>
      )}

      {questions.map((question) => {
        const selectedOptionId = answers[question.id] || '';
        const isMissing = missingIds.includes(question.id);
        const errorId = isMissing ? `${question.id}-error` : undefined;

        return (
          <fieldset
            key={question.id}
            aria-describedby={errorId}
            className={[styles.questionCard, isMissing ? styles.questionCardError : '']
              .filter(Boolean)
              .join(' ')}
          >
            <div className={styles.metaRow}>
              <span className={styles.questionNum}>
                Soal {question.number} dari {questions.length}
              </span>
              <span className={styles.topicTag}>{question.topic}</span>
            </div>

            <legend className={styles.legend}>{question.prompt}</legend>

            <div className={styles.optionsList}>
              {question.options.map((option, idx) => {
                const inputId = `quiz-${question.id}-${option.id}`;
                const checked = selectedOptionId === option.id;
                return (
                  <label
                    key={option.id}
                    htmlFor={inputId}
                    className={[
                      styles.optionLabel,
                      checked ? styles.optionLabelSelected : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <input
                      ref={
                        idx === 0
                          ? (el) => {
                              firstOptionRefs.current[question.id] = el;
                            }
                          : undefined
                      }
                      id={inputId}
                      type="radio"
                      name={question.id}
                      value={option.id}
                      checked={checked}
                      onChange={() => {
                        onSelectOption(question.id, option.id);
                        if (isMissing) {
                          setMissingIds((prev) => prev.filter((id) => id !== question.id));
                        }
                      }}
                      className={styles.nativeRadio}
                    />
                    <span
                      className={[
                        styles.customRadio,
                        checked ? styles.customRadioChecked : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      aria-hidden="true"
                    >
                      {checked && <span className={styles.radioDot} />}
                    </span>
                    <span className={styles.optionText}>
                      <strong>{option.id.toUpperCase()}.</strong> {option.text}
                    </span>
                  </label>
                );
              })}
            </div>

            {isMissing && (
              <p id={errorId} role="alert" className={styles.errorText}>
                <AlertCircle size={16} aria-hidden="true" />
                <span>Pilih salah satu jawaban untuk Soal {question.number}.</span>
              </p>
            )}
          </fieldset>
        );
      })}

      <div className={styles.actions}>
        <Button type="submit" variant="primary">
          Periksa Jawaban
        </Button>
      </div>
    </form>
  );
}
