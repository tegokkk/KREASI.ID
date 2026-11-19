import { Button } from '../../components/ui/Button';
import styles from './Superadmin.module.css';

export function StaffDashboardNav({ current }) {
  return (
    <nav className={styles.filters} aria-label="Menu dashboard">
      <Button size="sm" to="/superadmin" variant={current === 'accounts' ? 'primary' : 'secondary'} aria-current={current === 'accounts' ? 'page' : undefined}>
        Verifikasi Akun
      </Button>
      <Button size="sm" to="/riwayat-siswa" variant={current === 'history' ? 'primary' : 'secondary'} aria-current={current === 'history' ? 'page' : undefined}>
        Riwayat Siswa
      </Button>
    </nav>
  );
}
