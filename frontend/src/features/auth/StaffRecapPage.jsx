import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { PageLayout } from '../../components/layout/PageLayout';
import { Button } from '../../components/ui/Button';
import { InfoPanel } from '../../components/ui/InfoPanel';
import { accountRequest } from '../../services/auth';
import { RecapAnswers } from '../journey/RecapAnswers';
import { HISTORY_ROLES, useAuth } from './AuthProvider';
import styles from './Superadmin.module.css';

export function StaffRecapPage() {
  const { studentId } = useParams();
  return <Detail key={studentId} studentId={studentId} />;
}

function Detail({ studentId }) {
  const { user } = useAuth();
  const [recap, setRecap] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    accountRequest(`/api/staff/recaps/${encodeURIComponent(studentId)}`, {
      signal: controller.signal,
    })
      .then((result) => {
        if (!controller.signal.aborted) setRecap(result.recap);
      })
      .catch((failure) => {
        if (!controller.signal.aborted) setError(failure.message);
      });
    return () => controller.abort();
  }, [studentId]);

  const canSeeHistory = HISTORY_ROLES.includes(user?.role);

  return (
    <PageLayout title="Rekap Jawaban Siswa">
      <div className={`container reading-column ${styles.page}`}>
        <div className={styles.filters}>
          <Button to="/rekap-siswa" size="sm" variant="secondary">
            Kembali ke Daftar Rekap
          </Button>
          {canSeeHistory && (
            <Button to="/riwayat-siswa" size="sm" variant="ghost">
              Kembali ke Riwayat Siswa
            </Button>
          )}
        </div>
        <h1 className="page-title">{recap?.name ?? 'Rekap Jawaban Siswa'}</h1>
        {!recap && !error && <p role="status">Memuat jawaban siswa…</p>}
        {error && (
          <InfoPanel tone="error" role="alert">
            {error}
          </InfoPanel>
        )}
        {recap && (
          <>
            <p className={styles.email}>
              {[recap.nisn ? `NISN ${recap.nisn}` : '', recap.school].filter(Boolean).join(' · ')}
            </p>
            <p className={styles.date}>
              Progres {recap.completedCount ?? 0} dari {recap.totalSteps ?? 6} langkah selesai ·
              Diperbarui pada {new Date(recap.submittedAt).toLocaleString('id-ID')}.
            </p>
            <RecapAnswers answers={recap.answers} />
          </>
        )}
      </div>
    </PageLayout>
  );
}
