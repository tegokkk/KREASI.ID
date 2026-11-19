import { forwardRef } from 'react';
import { BookOpen, Edit3, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { InfoPanel } from '../../components/ui/InfoPanel';
import styles from './SelfCheckSummary.module.css';

export const SelfCheckSummary = forwardRef(function SelfCheckSummary(
  {
    questions,
    answers,
    onEditAnswers,
    onClearAnswers,
    confirmingClear,
    onCancelClear,
    onRequestClear,
  },
  ref
) {
  const answeredGroups = questions.filter(
    (question) => (answers[question.id] || []).length > 0
  );
  const isEmpty = answeredGroups.length === 0;

  return (
    <section
      ref={ref}
      tabIndex={-1}
      aria-labelledby="catatanku-heading"
      className={styles.summaryPanel}
    >
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <BookOpen size={22} aria-hidden="true" className={styles.icon} />
          <h2 id="catatanku-heading" className="section-title">
            Catatanku
          </h2>
        </div>
        <span className={styles.badge}>Sementara di halaman ini</span>
      </div>

      {isEmpty ? (
        <div className={styles.emptyBox}>
          <p className={styles.emptyText}>
            Pilih kegiatan yang cocok denganmu, atau lanjut membaca materi jika kamu belum yakin.
          </p>
        </div>
      ) : (
        <>
          <p className={styles.lead}>
            Ini adalah rangkuman pilihanmu sendiri. Tidak ada skor atau penilaian—kamu bisa
            mengingat satu hal yang paling ingin kamu pikirkan atau coba lebih lanjut.
          </p>

          <div className={styles.groups}>
            {answeredGroups.map((question) => (
              <div key={question.id} className={styles.groupItem}>
                <h3 className={styles.groupTitle}>
                  {question.number}. {question.prompt}
                </h3>
                <ul className={styles.choiceList}>
                  {answers[question.id].map((choice) => (
                    <li key={choice} className={styles.choiceItem}>
                      {choice}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <InfoPanel tone="mint" icon="info" title="Ajak dirimu memilih satu hal">
            <p>
              Dari daftar Catatanku di atas, pilih satu kegiatan atau kemampuan yang paling
              membuatmu penasaran untuk dicermati saat membaca materi di langkah berikutnya.
            </p>
          </InfoPanel>
        </>
      )}

      {confirmingClear && (
        <InfoPanel tone="error" icon="warning" role="alert" title="Kosongkan seluruh pilihan?">
          <p>Semua pilihan Self-check yang kamu tandai di halaman ini akan dihapus.</p>
          <div className={styles.confirmButtons}>
            <Button type="button" variant="primary" size="sm" onClick={onClearAnswers}>
              Ya, Hapus Jawaban
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onCancelClear}>
              Batal
            </Button>
          </div>
        </InfoPanel>
      )}

      <div className={styles.actions}>
        <Button type="button" variant="secondary" size="sm" onClick={onEditAnswers}>
          <Edit3 size={16} aria-hidden="true" />
          <span>Ubah Jawaban</span>
        </Button>

        {!isEmpty && !confirmingClear && (
          <Button type="button" variant="dangerText" size="sm" onClick={onRequestClear}>
            <Trash2 size={16} aria-hidden="true" />
            <span>Hapus Jawaban</span>
          </Button>
        )}
      </div>
    </section>
  );
});
