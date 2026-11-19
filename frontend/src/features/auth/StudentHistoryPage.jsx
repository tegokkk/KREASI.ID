import { useEffect, useState } from 'react';
import { ClipboardCheck, RefreshCw } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Button } from '../../components/ui/Button';
import { InfoPanel } from '../../components/ui/InfoPanel';
import { accountRequest } from '../../services/auth';
import { useAuth } from './AuthProvider';
import { StaffDashboardNav } from './StaffDashboardNav';
import styles from './Superadmin.module.css';

const dateFormat = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

function CompletionTime({ value }) {
  return value ? <time dateTime={value}>{dateFormat.format(new Date(value))}</time> : 'Tanggal tidak tercatat';
}

function HistoryCard({ student }) {
  return (
    <li className={styles.userCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardIdentity}>
          <h2 className={styles.cardName}>{student.name}</h2>
          {student.nisn && <p className={styles.email}>NISN {student.nisn}</p>}
          {student.school && <p className={styles.email}>{student.school}</p>}
        </div>
        <span className={`${styles.statusBadge} ${styles.badge_approved}`}>
          <ClipboardCheck size={16} aria-hidden="true" /> {student.steps.length}/{student.steps.length} selesai
        </span>
      </div>
      <p className={styles.date}>Tuntas pada <CompletionTime value={student.finishedAt} /></p>
      <details className={styles.historyDetails}>
        <summary>Rincian langkah</summary>
        <ol className={styles.historySteps}>
          {student.steps.map((step) => (
            <li key={step.id}>
              <strong>{step.title}</strong>
              <span className={styles.date}><CompletionTime value={step.completedAt} /></span>
            </li>
          ))}
        </ol>
      </details>
    </li>
  );
}

export function StudentHistoryPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const loading = result === null && !error;

  useEffect(() => {
    const controller = new AbortController();
    accountRequest(`/api/staff/student-history?page=${page}`, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setResult(data);
      })
      .catch((failure) => {
        if (!controller.signal.aborted) setError(failure.message || 'Riwayat belum dapat dimuat.');
      });
    return () => controller.abort();
  }, [page, revision]);

  function load(nextPage = page) {
    setResult(null);
    setError('');
    if (nextPage === page) setRevision((value) => value + 1);
    else setPage(nextPage);
  }

  const superadmin = user.role === 'superadmin';

  return (
    <PageLayout title="Riwayat Siswa">
      <div className={`container ${styles.page}`}>
        <header className={styles.headingText}>
          <span className={styles.eyebrow}>{superadmin ? 'Superadmin' : 'Guru BK'}</span>
          <h1 className="page-title">Riwayat Siswa</h1>
          <p className="lead-text">Siswa yang sudah menuntaskan semua langkah kegiatan KREASI.ID.</p>
          {!superadmin && <p>{user.school}</p>}
        </header>
        {superadmin && <StaffDashboardNav current="history" />}
        <div className={styles.toolbar}>
          <Button size="sm" variant="secondary" disabled={loading} onClick={() => load()}>
            <RefreshCw size={16} aria-hidden="true" /> Muat Ulang
          </Button>
        </div>
        {error && <InfoPanel tone="error" icon="warning" role="alert">{error}</InfoPanel>}
        <section className={styles.listSection} aria-label="Siswa yang sudah tuntas" aria-busy={loading}>
          {loading && <p className={styles.stateBox} role="status">Memuat riwayat siswa…</p>}
          {result && (result.students.length > 0 ? (
            <ul className={styles.cardList}>
              {result.students.map((student) => <HistoryCard key={student.id} student={student} />)}
            </ul>
          ) : (
            <p className={styles.stateBox}>{page === 1 ? 'Belum ada siswa yang menuntaskan semua langkah.' : 'Tidak ada siswa di halaman ini.'}</p>
          ))}
        </section>
        {(page > 1 || result?.hasMore) && (
          <nav className={styles.filters} aria-label="Halaman riwayat">
            <Button size="sm" variant="secondary" disabled={loading || page === 1} onClick={() => load(page - 1)}>Sebelumnya</Button>
            <span>Halaman {page}</span>
            <Button size="sm" variant="secondary" disabled={loading || !result?.hasMore} onClick={() => load(page + 1)}>Berikutnya</Button>
          </nav>
        )}
      </div>
    </PageLayout>
  );
}
