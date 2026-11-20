import { useEffect, useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Button } from '../../components/ui/Button';
import { InfoPanel } from '../../components/ui/InfoPanel';
import { deleteStudentRecap, saveStudentRecap } from '../../services/journey';
import { useJourney } from './JourneyProvider';
import { RecapAnswers } from './RecapAnswers';
import styles from '../auth/Superadmin.module.css';

const dateFormat = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

export function StudentRecapPage() {
  const { recap, recapLoading, recapError, refreshRecap, setRecap, recapDraft } = useJourney();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [selection, setSelection] = useState(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    refreshRecap();
  }, [refreshRecap]);

  const sections = new Map((recap?.answers || []).map((section) => [section.id, section]));
  for (const [id, answers] of Object.entries(recapDraft || {})) {
    if (Array.isArray(answers) && answers.length > 0) {
      sections.set(id, { id, answers });
    }
  }
  const answers = [...sections.values()];
  const selected = selection ?? answers.map(({ id }) => id);
  const activeError = error || recapError;

  async function saveChanges(event) {
    event.preventDefault();
    const chosen = answers.filter(({ id }) => selected.includes(id));
    if (!chosen.length || busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await saveStudentRecap(chosen);
      setRecap(result.recap ?? null);
      setSelection(null);
      setNotice('Rekap jawaban sudah diperbarui.');
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  async function withdraw() {
    if (busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await deleteStudentRecap();
      setRecap(null);
      setSelection(null);
      setNotice('Rekap sudah dihapus dari penyimpanan akun dan dashboard staf.');
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageLayout title="Rekap Jawaban">
      <div className={`container reading-column ${styles.page}`}>
        <h1 className="page-title">Rekap Jawaban</h1>
        <p>
          Jawaban dari Self-check, Kuis, Refleksi, dan Action Plan tersimpan otomatis setelah kamu
          menyelesaikan langkah agar dapat kamu tinjau kembali serta dilihat oleh Guru BK
          sekolahmu, Admin, dan Superadmin.
        </p>

        {notice && (
          <InfoPanel tone="success" role="status">
            {notice}
          </InfoPanel>
        )}

        {activeError && (
          <InfoPanel tone="error" role="alert">
            <p>{activeError}</p>
            {recapError && (
              <div className={styles.errorRetry}>
                <Button variant="secondary" size="sm" onClick={refreshRecap}>
                  Coba Lagi
                </Button>
              </div>
            )}
          </InfoPanel>
        )}

        {recap?.submittedAt ? (
          <InfoPanel tone="mint" icon="success" title="Tersimpan di akunmu">
            <p>
              Rekap jawaban terakhir diperbarui pada{' '}
              <strong>{dateFormat.format(new Date(recap.submittedAt))}</strong> dan dapat dilihat
              oleh staf BK/Admin sekolahmu.
            </p>
          </InfoPanel>
        ) : (
          !recapLoading && (
            <InfoPanel tone="blue" icon="info" title="Rekap terisi otomatis per langkah">
              <p>
                Saat kamu menyelesaikan Self-check, Kuis, Refleksi, atau Action Plan, jawabanmu akan
                langsung muncul di sini. Jika kamu melewati langkah tertentu atau belum mengisi
                ulang langkah lama, buka kegiatan tersebut lalu tekan tombol Selesai.
              </p>
            </InfoPanel>
          )
        )}

        {recapLoading && !recap && answers.length === 0 ? (
          <p role="status">Memuat rekap…</p>
        ) : (
          <form className={styles.page} onSubmit={saveChanges}>
            <RecapAnswers
              answers={answers}
              selected={answers.length > 0 ? selected : undefined}
              onSelect={
                answers.length > 0
                  ? (id, checked) =>
                      setSelection(
                        checked
                          ? [...selected, id]
                          : selected.filter((item) => item !== id)
                      )
                  : undefined
              }
            />

            <p className="supporting-text">
              Jika kamu mengerjakan kuis di Google Forms, KREASI.ID mencatat penyelesaian dan
              konfirmasinya saja.
            </p>

            <div className={styles.filters}>
              {answers.length > 0 && (
                <Button type="submit" disabled={!selected.length || busy}>
                  Simpan Pilihan Rekap
                </Button>
              )}
              {recap && (
                <Button variant="dangerOutline" disabled={busy} onClick={withdraw}>
                  Hapus Rekap
                </Button>
              )}
              <Button to="/#jelajahi" variant="secondary">
                Kembali ke Perjalanan
              </Button>
            </div>
          </form>
        )}
      </div>
    </PageLayout>
  );
}
