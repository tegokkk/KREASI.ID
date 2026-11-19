import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';
import { InfoPanel } from '../../components/ui/InfoPanel';
import styles from './ReflectionForm.module.css';

export function ReflectionForm({ questions, values, onChangeValue, onClearAll }) {
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [clearedNotice, setClearedNotice] = useState(false);

  const hasAnyText = Object.values(values).some((val) => val.length > 0);
  const filledCount = questions.filter((q) => (values[q.id] || '').trim().length > 0).length;

  function handleConfirmClear() {
    onClearAll();
    setConfirmingClear(false);
    setClearedNotice(true);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.statusBar}>
        <p className={styles.statusText}>
          Semua pertanyaan bersifat <strong>opsional</strong>. Kamu boleh mengisi sebagian atau
          langsung melanjutkan.
        </p>
        <span className={styles.counter} aria-live="polite">
          {filledCount} dari {questions.length} terisi
        </span>
      </div>

      <form className={styles.form} onSubmit={(e) => e.preventDefault()} noValidate>
        {questions.map((question) => (
          <div key={question.id} className={styles.questionCard}>
            <FormField
              id={`refleksi-${question.id}`}
              label={`${question.number}. ${question.prompt}`}
              required={false}
              optionalLabel="Opsional"
              multiline
              maxLength={1200}
              rows={4}
              value={values[question.id] || ''}
              onChange={(event) => {
                setClearedNotice(false);
                onChangeValue(question.id, event.target.value);
              }}
              placeholder={question.placeholder}
            />
          </div>
        ))}
      </form>

      {clearedNotice && (
        <InfoPanel tone="mint" icon="success" role="status">
          <p>Seluruh tulisan refleksi di halaman ini sudah dikosongkan.</p>
        </InfoPanel>
      )}

      {confirmingClear && (
        <InfoPanel tone="error" icon="warning" role="alert" title="Kosongkan tulisan refleksi?">
          <p>Semua catatan yang kamu ketik di halaman ini akan dihapus.</p>
          <div className={styles.confirmActions}>
            <Button type="button" variant="primary" size="sm" onClick={handleConfirmClear}>
              Ya, Hapus Jawaban
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirmingClear(false)}
            >
              Batal
            </Button>
          </div>
        </InfoPanel>
      )}

      {hasAnyText && !confirmingClear && (
        <div className={styles.actions}>
          <Button
            type="button"
            variant="dangerText"
            onClick={() => setConfirmingClear(true)}
          >
            <Trash2 size={16} aria-hidden="true" />
            <span>Hapus Jawaban</span>
          </Button>
        </div>
      )}
    </div>
  );
}
