import { forwardRef, useState } from 'react';
import { Check, Copy, Edit3, Target, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { InfoPanel } from '../../components/ui/InfoPanel';
import { ACTION_PLAN_FIELDS, formatActionPlanText } from './template';
import styles from './ActionPlanSummary.module.css';

export const ActionPlanSummary = forwardRef(function ActionPlanSummary(
  {
    plan,
    onEditPlan,
    onRequestClear,
    confirmingClear,
    onConfirmClear,
    onCancelClear,
  },
  ref
) {
  const [copyStatus, setCopyStatus] = useState('idle');
  const plainText = formatActionPlanText(plan);

  async function handleCopy() {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(plainText);
        setCopyStatus('copied');
        return;
      } catch {
        setCopyStatus('manual');
        return;
      }
    }
    setCopyStatus('manual');
  }

  return (
    <section
      ref={ref}
      tabIndex={-1}
      aria-labelledby="rencanaku-heading"
      className={styles.summaryPanel}
    >
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <Target size={22} aria-hidden="true" className={styles.icon} />
          <h2 id="rencanaku-heading" className="section-title">
            Rencanaku
          </h2>
        </div>
        <span className={styles.badge}>Siap disalin</span>
      </div>

      <p className={styles.lead}>
        Salin rencanamu ke buku atau catatan di perangkat pribadi sebelum keluar agar kamu bisa
        membacanya kembali dan mengisi bagian evaluasi setelah mencoba.
      </p>

      <dl className={styles.summaryList}>
        {ACTION_PLAN_FIELDS.map((field) => {
          const rawValue = (plan[field.id] || '').trim();
          const displayValue = rawValue || 'Diisi setelah mencoba';
          const isPendingEvaluation = field.id === 'evaluasi' && !rawValue;

          return (
            <div key={field.id} className={styles.summaryRow}>
              <dt className={styles.term}>{field.label}</dt>
              <dd
                className={[
                  styles.definition,
                  isPendingEvaluation ? styles.pendingText : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {displayValue}
              </dd>
            </div>
          );
        })}
      </dl>

      <div className={styles.copyBox}>
        <label htmlFor="rencanaku-copy-text" className={styles.copyLabel}>
          Teks ringkasan yang dapat diseleksi dan disalin manual
        </label>
        <textarea
          id="rencanaku-copy-text"
          readOnly
          rows={7}
          value={plainText}
          onFocus={(event) => event.target.select()}
          className={styles.copyTextarea}
        />
      </div>

      {copyStatus === 'copied' && (
        <InfoPanel tone="success" icon="success" role="status">
          <p>Ringkasan Rencanaku sudah disalin. Tempelkan ke buku catatan digital atau aplikasi catatanmu.</p>
        </InfoPanel>
      )}

      {copyStatus === 'manual' && (
        <InfoPanel tone="yellow" icon="info" role="status">
          <p>
            Penyalinan otomatis tidak tersedia di peramban ini. Pilih teks di kotak di atas lalu
            salin secara manual (Ctrl+C / tekan lama untuk salin).
          </p>
        </InfoPanel>
      )}

      {confirmingClear && (
        <InfoPanel tone="error" icon="warning" role="alert" title="Kosongkan semua isian Action Plan?">
          <p>Pastikan kamu sudah menyalin rencanamu sebelum menghapus isian di halaman ini.</p>
          <div className={styles.confirmButtons}>
            <Button type="button" variant="primary" size="sm" onClick={onConfirmClear}>
              Ya, Hapus Isian
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onCancelClear}>
              Batal
            </Button>
          </div>
        </InfoPanel>
      )}

      <div className={styles.actions}>
        <Button type="button" variant="primary" size="sm" onClick={handleCopy}>
          {copyStatus === 'copied' ? (
            <>
              <Check size={16} aria-hidden="true" />
              <span>Tersalin</span>
            </>
          ) : (
            <>
              <Copy size={16} aria-hidden="true" />
              <span>Salin Rencanaku</span>
            </>
          )}
        </Button>

        <Button type="button" variant="secondary" size="sm" onClick={onEditPlan}>
          <Edit3 size={16} aria-hidden="true" />
          <span>Ubah Rencana</span>
        </Button>

        {!confirmingClear && (
          <Button type="button" variant="dangerText" size="sm" onClick={onRequestClear}>
            <Trash2 size={16} aria-hidden="true" />
            <span>Hapus Isian</span>
          </Button>
        )}
      </div>
    </section>
  );
});
