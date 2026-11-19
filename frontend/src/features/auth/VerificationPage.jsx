import { useState } from 'react';
import { Navigate } from 'react-router';
import { Clock3, ShieldX } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { accountDestination, AuthLoading, useAuth } from './AuthProvider';
import styles from './Auth.module.css';

export function VerificationPage() {
  const { user, loading, error: connectionError, refresh, logout } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (loading || connectionError) return <AuthLoading />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.status === 'approved') return <Navigate to={accountDestination(user)} replace />;
  const rejected = user.status === 'rejected';

  async function perform(action) {
    setError('');
    setBusy(true);
    try { await action(); } catch { setError('Permintaan belum berhasil. Coba lagi.'); }
    finally { setBusy(false); }
  }

  return (
    <main className={styles.statusShell}>
      <section className={styles.statusCard} aria-labelledby="status-heading">
        {rejected ? <ShieldX size={44} aria-hidden="true" /> : <Clock3 size={44} aria-hidden="true" />}
        <p className={styles.brand}>KREASI.ID</p>
        <h1 id="status-heading">{rejected ? 'Pengajuan belum disetujui' : 'Menunggu verifikasi'}</h1>
        <p>Halo, <strong>{user.name}</strong>.</p>
        <p>{rejected ? 'Superadmin telah meninjau pengajuan akunmu. Hubungi pengelola sekolah untuk informasi lebih lanjut.' : 'Pendaftaranmu berhasil. Superadmin akan meninjau akunmu sebelum akses kegiatan dibuka.'}</p>
        <p className={styles.email}>{user.nisn ? `NISN ${user.nisn} · ${user.school}` : user.email}</p>
        {user.reviewNote && <div className={styles.reviewNote}><strong>Catatan superadmin</strong><p>{user.reviewNote}</p></div>}
        <p className={styles.muted}>Status diperiksa otomatis. Kamu juga bisa memeriksanya melalui tombol di bawah.</p>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <div className={styles.actions}>
          <Button disabled={busy} onClick={() => perform(refresh)}>Periksa Status</Button>
          <Button disabled={busy} variant="secondary" onClick={() => perform(logout)}>Keluar</Button>
        </div>
      </section>
    </main>
  );
}
