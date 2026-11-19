import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { PageLayout } from '../../components/layout/PageLayout';
import { Button } from '../../components/ui/Button';
import { InfoPanel } from '../../components/ui/InfoPanel';
import { accountRequest } from '../../services/auth';
import { RecapAnswers } from '../journey/RecapAnswers';
import styles from './Superadmin.module.css';

export function StaffRecapPage() {
  const { studentId } = useParams();
  return <Detail key={studentId} studentId={studentId} />;
}

function Detail({ studentId }) {
  const [recap, setRecap] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    accountRequest(`/api/staff/recaps/${encodeURIComponent(studentId)}`, { signal: controller.signal })
      .then((result) => { if (!controller.signal.aborted) setRecap(result.recap); })
      .catch((failure) => { if (!controller.signal.aborted) setError(failure.message); });
    return () => controller.abort();
  }, [studentId]);

  return (
    <PageLayout title="Rekap Jawaban Siswa">
      <div className={`container reading-column ${styles.page}`}>
        <div><Button to="/rekap-siswa" size="sm" variant="secondary">Kembali ke Daftar Rekap</Button></div>
        <h1 className="page-title">{recap?.name ?? 'Rekap Jawaban Siswa'}</h1>
        {!recap && !error && <p role="status">Memuat jawaban siswa…</p>}
        {error && <InfoPanel tone="error" role="alert">{error}</InfoPanel>}
        {recap && (
          <>
            <p>{[recap.nisn ? `NISN ${recap.nisn}` : '', recap.school].filter(Boolean).join(' · ')}</p>
            <p>Enam langkah selesai. Tanggal kirim {new Date(recap.submittedAt).toLocaleString('id-ID')}.</p>
            <RecapAnswers answers={recap.answers} />
          </>
        )}
      </div>
    </PageLayout>
  );
}
