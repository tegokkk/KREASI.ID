import { Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import styles from './SelfCheckForm.module.css';

export function SelfCheckForm({
  questions,
  answers,
  onToggleOption,
  onShowSummary,
  onClearRequest,
  hasAnySelection,
  firstInputRef,
}) {
  const totalSelected = Object.values(answers).reduce(
    (acc, list) => acc + list.length,
    0
  );

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        onShowSummary();
      }}
      noValidate
    >
      <div className={styles.statusBar}>
        <span className={styles.instruction}>
          Kamu boleh memilih lebih dari satu jawaban atau melewati pertanyaan.
        </span>
        <span className={styles.counter} aria-live="polite">
          {totalSelected} pilihan ditandai
        </span>
      </div>

      {questions.map((question, qIndex) => {
        const selectedForQuestion = answers[question.id] || [];
        return (
          <fieldset key={question.id} className={styles.questionCard}>
            <legend className={styles.legend}>
              <span className={styles.numberBadge}>{question.number}</span>
              <span>{question.prompt}</span>
            </legend>
            <p className={styles.helper}>{question.helper}</p>

            <div className={styles.optionsGrid}>
              {question.options.map((option, oIndex) => {
                const inputId = `sc-${question.id}-${oIndex}`;
                const checked = selectedForQuestion.includes(option);
                return (
                  <label
                    key={option}
                    htmlFor={inputId}
                    className={[
                      styles.optionLabel,
                      checked ? styles.optionLabelSelected : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <input
                      ref={qIndex === 0 && oIndex === 0 ? firstInputRef : undefined}
                      id={inputId}
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleOption(question.id, option)}
                      className={styles.nativeCheckbox}
                    />
                    <span
                      className={[
                        styles.customBox,
                        checked ? styles.customBoxChecked : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      aria-hidden="true"
                    >
                      {checked && <Check size={14} strokeWidth={3} />}
                    </span>
                    <span className={styles.optionText}>{option}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        );
      })}

      <div className={styles.actions}>
        <Button type="submit" variant="primary">
          Lihat Catatanku
        </Button>
        {hasAnySelection && (
          <Button type="button" variant="dangerText" onClick={onClearRequest}>
            Hapus Jawaban
          </Button>
        )}
      </div>
    </form>
  );
}
