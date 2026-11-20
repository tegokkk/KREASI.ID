import { useState } from 'react';
import { Link } from 'react-router';
import { HISTORY_ROLES, STAFF_ROLES, useAuth } from './AuthProvider';
import { Button } from '../../components/ui/Button';
import styles from './AccountMenu.module.css';

export function AccountMenu() {
  const { user, logout } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!user) return <Button to="/login" size="sm">Masuk</Button>;
  async function signOut() {
    setBusy(true);
    setError('');
    try { await logout(); } catch { setError('Belum berhasil keluar. Coba lagi.'); }
    finally { setBusy(false); }
  }
  return (
    <details className={styles.menu}>
      <summary>Akun</summary>
      <div className={styles.panel}>
        <p className={styles.name}>{user.name}</p>
        {user.status !== 'approved' && <Link to="/verifikasi">Status Verifikasi</Link>}
        {user.role === 'superadmin' && <Link to="/superadmin">Verifikasi Akun</Link>}
        {user.status === 'approved' && HISTORY_ROLES.includes(user.role) && <Link to="/riwayat-siswa">Riwayat Siswa</Link>}
        {user.status === 'approved' && STAFF_ROLES.includes(user.role) && <Link to="/rekap-siswa">Rekap Jawaban Siswa</Link>}
        {user.status === 'approved' && user.role === 'user' && <Link to="/rekap">Rekap Jawaban</Link>}
        <button type="button" disabled={busy} onClick={signOut}>{busy ? 'Memproses…' : 'Keluar'}</button>
        {error && <p role="alert">{error}</p>}
      </div>
    </details>
  );
}
