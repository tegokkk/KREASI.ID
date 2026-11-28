import { useState } from 'react';
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { Link } from 'react-router';
import logoKreasi from '../../assets/images/logo-kreasi.png';
import { PageLayout } from '../../components/layout/PageLayout';
import { useAuth } from './AuthProvider';
import styles from './Superadmin.module.css';

const ROLE_LABELS = {
  superadmin: 'Superadmin',
  admin: 'Administrator',
  bk: 'Guru BK',
};

export function StaffDashboardNav({ current }) {
  const { user } = useAuth();
  if (!user) return null;

  const items = [
    ...(user.role === 'superadmin'
      ? [{ id: 'accounts', to: '/superadmin', label: 'Verifikasi Akun', Icon: UserCheck }]
      : []),
    ...(['superadmin', 'admin'].includes(user.role)
      ? [{ id: 'history', to: '/riwayat-siswa', label: 'Riwayat Siswa', Icon: GraduationCap }]
      : []),
    { id: 'recaps', to: '/rekap-siswa', label: 'Rekap Jawaban Siswa', Icon: ClipboardList },
    { id: 'materials', to: '/kelola-materi', label: 'Kelola Materi', Icon: BookOpen },
  ];

  return (
    <nav className={styles.sidebarNav} aria-label="Menu dashboard">
      {items.map(({ id, to, label, Icon }) => {
        const active = current === id;
        return (
          <Link
            key={id}
            to={to}
            aria-current={active ? 'page' : undefined}
            className={`${styles.sidebarLink} ${active ? styles.sidebarLinkActive : ''}`}
          >
            <Icon size={18} aria-hidden="true" className={styles.sidebarIcon} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function StaffDashboardLayout({
  title,
  heading,
  description,
  current,
  headerActions,
  children,
}) {
  const { user, logout } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const roleLabel = ROLE_LABELS[user?.role] || 'Staf';
  const initial = (user?.name || roleLabel).trim().charAt(0).toUpperCase();
  const subIdentity = user?.email || user?.school || roleLabel;

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <PageLayout title={title || heading}>
      <div className={`container ${styles.dashboardContainer}`}>
        <div className={styles.dashboardShell}>
          <aside className={styles.sidebar} aria-label="Panel navigasi staf">
            <div className={styles.sidebarBrand}>
              <div className={styles.brandLogoWrap}>
                <img src={logoKreasi} alt="" className={styles.brandLogo} />
              </div>
              <div className={styles.brandText}>
                <span className={styles.brandTitle}>KREASI.ID</span>
                <span className={styles.brandSubtitle}>{roleLabel}</span>
              </div>
            </div>

            <StaffDashboardNav current={current} />

            <div className={styles.sidebarFooter}>
              <Link to="/" className={styles.sidebarSecondaryLink}>
                <Home size={17} aria-hidden="true" />
                <span>Beranda KREASI.ID</span>
              </Link>
              <button
                type="button"
                className={styles.sidebarLogoutBtn}
                disabled={signingOut}
                onClick={handleSignOut}
              >
                <LogOut size={17} aria-hidden="true" />
                <span>{signingOut ? 'Memproses…' : 'Keluar'}</span>
              </button>
            </div>
          </aside>

          <div className={styles.dashboardMain}>
            <header className={styles.dashboardTopbar}>
              <div className={styles.topbarHeading}>
                <span className={styles.eyebrow}>
                  <LayoutDashboard size={15} aria-hidden="true" />
                  <span>Dashboard {roleLabel}</span>
                </span>
                <h1 className="page-title">{heading || title}</h1>
                {description && <p className={styles.topbarLead}>{description}</p>}
              </div>

              <div className={styles.topbarRight}>
                {headerActions}
                {user && (
                  <div className={styles.profilePill} aria-label="Profil staf aktif">
                    <span className={styles.profileAvatar} aria-hidden="true">
                      {initial}
                    </span>
                    <div className={styles.profileMeta}>
                      <span className={styles.profileName}>{user.name}</span>
                      <span className={styles.profileSub}>{subIdentity}</span>
                    </div>
                  </div>
                )}
              </div>
            </header>

            <div className={styles.dashboardBody}>{children}</div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
