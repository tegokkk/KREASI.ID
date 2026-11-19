import { useEffect, useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Button } from '../../components/ui/Button';
import { InfoPanel } from '../../components/ui/InfoPanel';
import { accountRequest } from '../../services/auth';
import { useJourney } from './JourneyProvider';
import { RecapAnswers } from './RecapAnswers';
import styles from '../auth/Superadmin.module.css';

export function StudentRecapPage() {
  const { journey, recapDraft } = useJourney();
  const [saved, setSaved] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState(false);
  const [selection, setSelection] = useState(null);
  const [consent, setConsent] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    accountRequest('/api/journey/recap', { signal: controller.signal })
      .then(({ recap }) => { if (!controller.signal.aborted) { setSaved(recap); setLoaded(true); } })
      .catch((failure) => { if (!controller.signal.aborted) setError(failure.message); });
    return () => controller.abort();
  }, [revision]);

  const sections = new Map(saved?.answers.map((section) => [section.id, section]) ?? []);
  for (const [id, answers] of Object.entries(recapDraft)) sections.set(id, { id, answers });
  const answers = [...sections.values()];
  const selected = selection ?? (saved?.answers ?? answers).map(({ id }) => id);
  const ready = journey?.summary.isAllCompleted;

  async function share(event) {
    event.preventDefault();
    const chosen = answers.filter(({ id }) => selected.includes(id));
    if (!ready || !loaded || !consent || !chosen.length || busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const { recap } = await accountRequest('/api/journey/recap', { method: 'PUT', body: { share: true, answers: chosen } });
      setSaved(recap);
      setConsent(false);
      setNotice('Rekap sudah dibagikan.');
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }

  async function withdraw() {
    if (busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await accountRequest('/api/journey/recap', { method: 'DELETE' });
      setSaved(null);
      setConsent(false);
      setNotice('Rekap sudah ditarik dari dashboard staf.');
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }

  return (
    <PageLayout title="Rekap Jawaban">
      <div className={`container reading-column ${styles.page}`}>
        <h1 className="page-title">Rekap Jawaban</h1>
        <p>Tinjau jawaban dari sesi ini. Setelah keenam langkah selesai, kamu bisa memilih bagian yang ingin dibagikan kepada Superadmin, Admin, dan Guru BK dari sekolah yang tercatat di akunmu.</p>
        {notice && <InfoPanel tone="success" role="status">{notice}</InfoPanel>}
        {error && <InfoPanel tone="error" role="alert">{error}</InfoPanel>}
        {!loaded && (error ? <Button variant="secondary" onClick={() => { setError(''); setRevision((value) => value + 1); }}>Coba Lagi</Button> : <p role="status">Memuat rekap…</p>)}
        {loaded && (
          <form className={styles.page} onSubmit={share}>
            {saved && <p>Rekap sudah dibagikan. Pengiriman berikutnya akan mengganti bagian yang dibagikan.</p>}
            {!ready && <p>Selesaikan keenam langkah untuk membuka pengiriman rekap.</p>}
            <RecapAnswers answers={answers} selected={selected} onSelect={(id, checked) => setSelection(checked ? [...selected, id] : selected.filter((item) => item !== id))} />
            <p className="supporting-text">Jawaban yang belum dikirim hanya ada di tab ini. Jika kamu mengerjakan kuis di Google Forms, KREASI.ID hanya mencatat penyelesaiannya.</p>
            <label className={styles.recapCheck}>
              <input type="checkbox" checked={consent} disabled={!ready || !selected.length || busy} onChange={(event) => setConsent(event.target.checked)} />
              Saya ingin membagikan jawaban yang dipilih.
            </label>
            <div className={styles.filters}>
              <Button type="submit" disabled={!ready || !selected.length || !consent || busy}>Kirim Rekap</Button>
              {saved && <Button variant="dangerOutline" disabled={busy} onClick={withdraw}>Tarik Rekap</Button>}
              <Button to="/#jelajahi" variant="secondary">Kembali ke Perjalanan</Button>
            </div>
          </form>
        )}
      </div>
    </PageLayout>
  );
}
