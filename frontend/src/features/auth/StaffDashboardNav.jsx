import { Button } from '../../components/ui/Button';
import { useAuth } from './AuthProvider';
import styles from './Superadmin.module.css';

export function StaffDashboardNav({ current }) {
  const { user } = useAuth();
  if (user.role === 'bk') return null;
  return (
    <nav className={styles.filters} aria-label="Menu dashboard">
      {user.role === 'superadmin' && <Button size="sm" to="/superadmin" variant={current === 'accounts' ? 'primary' : 'secondary'} aria-current={current === 'accounts' ? 'page' : undefined}>
        Verifikasi Akun
      </Button>}
      <Button size="sm" to="/riwayat-siswa" variant={current === 'history' ? 'primary' : 'secondary'} aria-current={current === 'history' ? 'page' : undefined}>
        Riwayat Siswa
      </Button>
      <Button size="sm" to="/rekap-siswa" variant={current === 'recaps' ? 'primary' : 'secondary'} aria-current={current === 'recaps' ? 'page' : undefined}>
        Rekap Jawaban Siswa
      </Button>
    </nav>
  );
}
