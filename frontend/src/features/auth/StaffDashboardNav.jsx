import { useEffect, useState } from 'react';
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  UserCheck,
  X,
} from 'lucide-react';
import { Link, useLocation } from 'react-router';
import logoKreasi from '../../assets/images/logo-kreasi.png';
import { PageLayout } from '../../components/layout/PageLayout';
import { useAuth } from './AuthProvider';
import styles from './Superadmin.module.css';

const ROLE_LABELS = {
  superadmin: 'Superadmin',
  admin: 'Administrator',
  bk: 'Guru BK',
};

export function StaffDashboardNav({ current, onNavigate }) {
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
    { id: 'home', to: '/', label: 'Beranda KREASI.ID', Icon: Home },
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
            onClick={onNavigate}
          >
            <Icon size={20} aria-hidden="true" className={styles.sidebarIcon} />
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
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const roleLabel = ROLE_LABELS[user?.role] || 'Administrator';
  const initial = (user?.name || roleLabel).trim().charAt(0).toUpperCase();
  const subIdentity = user?.email || user?.school || roleLabel;

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setDrawerOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [drawerOpen]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <PageLayout title={title || heading} hideChrome mainClassName={styles.dashboardPageMain}>
      <div className={styles.dashboardShell}>
        {drawerOpen && (
          <div
            className={styles.sidebarBackdrop}
            aria-hidden="true"
            onClick={() => setDrawerOpen(false)}
          />
        )}

        <aside
          id="staff-dashboard-sidebar"
          className={`${styles.sidebar} ${drawerOpen ? styles.sidebarOpen : ''}`}
          aria-label="Panel navigasi staf"
        >
          <div className={styles.sidebarTop}>
            <div className={styles.sidebarBrand}>
              <div className={styles.brandLogoWrap}>
                <img src={logoKreasi} alt="Logo KREASI.ID" className={styles.brandLogo} />
              </div>
              <div className={styles.brandText}>
                <span className={styles.brandTitle}>KREASI.ID</span>
                <span className={styles.brandSubtitle}>{roleLabel}</span>
              </div>
              {drawerOpen && (
                <button
                  type="button"
                  className={styles.drawerCloseBtn}
                  aria-label="Tutup menu navigasi"
                  onClick={() => setDrawerOpen(false)}
                >
                  <X size={20} aria-hidden="true" />
                </button>
              )}
            </div>

            <StaffDashboardNav current={current} onNavigate={() => setDrawerOpen(false)} />
          </div>

          <div className={styles.sidebarFooter}>
            <button
              type="button"
              className={styles.sidebarLogoutBtn}
              disabled={signingOut}
              onClick={handleSignOut}
            >
              <LogOut size={19} aria-hidden="true" />
              <span>{signingOut ? 'Memproses…' : 'Keluar Akun'}</span>
            </button>
          </div>
        </aside>

        <div className={styles.dashboardMain}>
          <header className={styles.dashboardTopbar}>
            <div className={styles.topbarLeft}>
              <button
                type="button"
                className={styles.mobileMenuBtn}
                aria-label={drawerOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
                aria-expanded={drawerOpen}
                aria-controls="staff-dashboard-sidebar"
                onClick={() => setDrawerOpen((open) => !open)}
              >
                <Menu size={22} aria-hidden="true" />
              </button>

              <div className={styles.topbarHeading}>
                <h1 className={styles.topbarTitle}>{heading || title}</h1>
                {description && <p className={styles.topbarLead}>{description}</p>}
              </div>
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
    </PageLayout>
  );
}
