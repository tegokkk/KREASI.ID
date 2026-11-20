import { useEffect, useState } from 'react';
import { ClipboardCheck, RefreshCw } from 'lucide-react';
import { ACTIVITIES } from '../../content/activities';
import { PageLayout } from '../../components/layout/PageLayout';
import { Button } from '../../components/ui/Button';
import { InfoPanel } from '../../components/ui/InfoPanel';
import { accountRequest } from '../../services/auth';
import { useAuth } from './AuthProvider';
import { StaffDashboardNav } from './StaffDashboardNav';
import styles from './Superadmin.module.css';

const dateFormat = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
const ACTIVITY_TITLE_BY_ID = Object.fromEntries(ACTIVITIES.map((item) => [item.id, item.title]));

function CompletionTime({ value }) {
  return value ? <time dateTime={value}>{dateFormat.format(new Date(value))}</time> : 'Tanggal tidak tercatat';
}

function HistoryCard({ student, recaps }) {
  return (
    <li className={styles.userCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardIdentity}>
          <h2 className={styles.cardName}>{student.name}</h2>
          {student.nisn && <p className={styles.email}>NISN {student.nisn}</p>}
          {student.school && <p className={styles.email}>{student.school}</p>}
        </div>
        <span className={`${styles.statusBadge} ${styles.badge_approved}`}>
          <ClipboardCheck size={16} aria-hidden="true" />{' '}
          {recaps
            ? `${student.sectionCount ?? 0}/4 kegiatan dijawab`
            : `${student.steps.length}/${student.steps.length} selesai`}
        </span>
      </div>

      {recaps && Array.isArray(student.sectionIds) && student.sectionIds.length > 0 && (
        <ul className={styles.sectionChips} aria-label="Kegiatan yang sudah dijawab">
          {student.sectionIds.map((sectionId) => (
            <li key={sectionId} className={styles.sectionChip}>
              {ACTIVITY_TITLE_BY_ID[sectionId] || sectionId}
            </li>
          ))}
        </ul>
      )}

      <p className={styles.date}>
        {recaps ? 'Diperbarui pada' : 'Tuntas pada'}{' '}
        <CompletionTime value={recaps ? student.submittedAt : student.finishedAt} />
        {recaps && typeof student.completedCount === 'number'
          ? ` · Progres ${student.completedCount}/${student.totalSteps ?? 6} langkah`
          : ''}
      </p>

      {recaps ? (
        <div>
          <Button to={`/rekap-siswa/${encodeURIComponent(student.id)}`} size="sm" variant="primary">
            Lihat Jawaban
          </Button>
        </div>
      ) : (
        <>
          <div className={styles.historyActions}>
            {student.hasRecap ? (
              <Button to={`/rekap-siswa/${encodeURIComponent(student.id)}`} size="sm" variant="primary">
                Lihat Jawaban
              </Button>
            ) : (
              <p className={styles.date}>
                Belum ada isi jawaban tersimpan (kegiatan selesai sebelum fitur rekap otomatis).
              </p>
            )}
          </div>
          <details className={styles.historyDetails}>
            <summary>Rincian langkah</summary>
            <ol className={styles.historySteps}>
              {student.steps.map((step) => (
                <li key={step.id}>
                  <strong>{step.title}</strong>
                  <span className={styles.date}>
                    <CompletionTime value={step.completedAt} />
                  </span>
                </li>
              ))}
            </ol>
          </details>
        </>
      )}
    </li>
  );
}

export function StudentHistoryPage({ recaps = false }) {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const loading = result === null && !error;

  useEffect(() => {
    const controller = new AbortController();
    accountRequest(`/api/staff/${recaps ? 'recaps' : 'student-history'}?page=${page}`, {
      signal: controller.signal,
    })
      .then((data) => {
        if (!controller.signal.aborted) setResult(data);
      })
      .catch((failure) => {
        if (!controller.signal.aborted) setError(failure.message || 'Riwayat belum dapat dimuat.');
      });
    return () => controller.abort();
  }, [page, revision, recaps]);

  function load(nextPage = page) {
    setResult(null);
    setError('');
    if (nextPage === page) setRevision((value) => value + 1);
    else setPage(nextPage);
  }

  const roleLabel = { superadmin: 'Superadmin', admin: 'Admin', bk: 'Guru BK' }[user.role];
  const title = recaps ? 'Rekap Jawaban Siswa' : 'Riwayat Siswa';

  return (
    <PageLayout title={title}>
      <div className={`container ${styles.page}`}>
        <header className={styles.headingText}>
          <span className={styles.eyebrow}>{roleLabel}</span>
          <h1 className="page-title">{title}</h1>
          <p className="lead-text">
            {recaps
              ? 'Rekapan jawaban kegiatan siswa yang tersimpan otomatis (Self-check, Kuis, Refleksi, dan Action Plan).'
              : 'Siswa yang sudah menuntaskan semua langkah kegiatan KREASI.ID beserta akses ke rekapan jawabannya.'}
          </p>
          {user.role === 'bk' && <p>{user.school}</p>}
        </header>
        <StaffDashboardNav current={recaps ? 'recaps' : 'history'} />
        <div className={styles.toolbar}>
          <Button size="sm" variant="secondary" disabled={loading} onClick={() => load()}>
            <RefreshCw size={16} aria-hidden="true" /> Muat Ulang
          </Button>
        </div>
        {error && (
          <InfoPanel tone="error" icon="warning" role="alert">
            {error}
          </InfoPanel>
        )}
        <section
          className={styles.listSection}
          aria-label={recaps ? 'Daftar rekap siswa' : 'Siswa yang sudah tuntas'}
          aria-busy={loading}
        >
          {loading && (
            <p className={styles.stateBox} role="status">
              Memuat riwayat siswa…
            </p>
          )}
          {result &&
            (result.students.length > 0 ? (
              <ul className={styles.cardList}>
                {result.students.map((student) => (
                  <HistoryCard key={student.id} student={student} recaps={recaps} />
                ))}
              </ul>
            ) : (
              <p className={styles.stateBox}>
                {page !== 1
                  ? 'Tidak ada siswa di halaman ini.'
                  : recaps
                    ? 'Belum ada rekap jawaban yang tersimpan dari siswa.'
                    : 'Belum ada siswa yang menuntaskan semua langkah.'}
              </p>
            ))}
        </section>
        {(page > 1 || result?.hasMore) && (
          <nav className={styles.filters} aria-label="Halaman riwayat">
            <Button
              size="sm"
              variant="secondary"
              disabled={loading || page === 1}
              onClick={() => load(page - 1)}
            >
              Sebelumnya
            </Button>
            <span>Halaman {page}</span>
            <Button
              size="sm"
              variant="secondary"
              disabled={loading || !result?.hasMore}
              onClick={() => load(page + 1)}
            >
              Berikutnya
            </Button>
          </nav>
        )}
      </div>
    </PageLayout>
  );
}
