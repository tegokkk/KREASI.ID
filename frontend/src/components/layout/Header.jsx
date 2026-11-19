import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import logoKreasi from '../../assets/images/logo-kreasi.png';
import { ACTIVITIES } from '../../content/activities';
import { AccountMenu } from '../../features/auth/AccountMenu';
import { useAuth } from '../../features/auth/AuthProvider';
import { useJourney } from '../../features/journey/JourneyProvider';
import { ActivityCard } from '../navigation/ActivityCard';
import { Button } from '../ui/Button';
import { NotchNav } from '../ui/NotchNav';
import styles from './Header.module.css';

const MAIN_LINKS = [
  { to: '/', label: 'Beranda' },
  { to: '/tentang', label: 'Tentang KREASI.ID' },
];

const SECONDARY_LINKS = [
  { to: '/tips', label: 'Tips' },
  { to: '/kontak', label: 'Kontak dan Bantuan' },
];

export function Header() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { journey, stepsById } = useJourney() || {};
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dropdownRef = useRef(null);
  const mobileDrawerRef = useRef(null);
  const mobileToggleRef = useRef(null);

  const isApprovedUser = Boolean(user && user.status === 'approved');
  const canBrowseActivities = !isApprovedUser || !['admin', 'bk'].includes(user.role);
  const isActivityRoute = ACTIVITIES.some((item) => item.path === pathname);

  useEffect(() => {
    setDesktopMenuOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const desktopQuery = window.matchMedia('(min-width: 1024px)');
    const handleMediaChange = (event) => {
      if (event.matches) {
        setMobileMenuOpen(false);
      }
    };
    if (desktopQuery.matches) {
      setMobileMenuOpen(false);
    } else if (typeof desktopQuery.addEventListener === 'function') {
      desktopQuery.addEventListener('change', handleMediaChange);
    } else {
      desktopQuery.addListener(handleMediaChange);
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      if (typeof desktopQuery.removeEventListener === 'function') {
        desktopQuery.removeEventListener('change', handleMediaChange);
      } else {
        desktopQuery.removeListener(handleMediaChange);
      }
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!desktopMenuOpen && !mobileMenuOpen) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
          mobileToggleRef.current?.focus();
        }
        if (desktopMenuOpen) {
          setDesktopMenuOpen(false);
          dropdownRef.current?.querySelector('button[aria-controls="desktop-activities-menu"]')?.focus();
        }
      }
    }

    function handlePointerDown(event) {
      if (
        desktopMenuOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDesktopMenuOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [desktopMenuOpen, mobileMenuOpen]);

  function getStepForActivity(activity) {
    if (!isApprovedUser) return undefined;
    if (stepsById && stepsById[activity.id]) return stepsById[activity.id];
    return {
      id: activity.id,
      step: activity.step,
      status: activity.step === 1 ? 'active' : 'locked',
      accessible: activity.step === 1,
      prerequisiteStep:
        activity.step > 1
          ? {
              id: ACTIVITIES[activity.step - 2].id,
              step: ACTIVITIES[activity.step - 2].step,
              title: ACTIVITIES[activity.step - 2].title,
            }
          : null,
    };
  }

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.brand}>
          <img
            src={logoKreasi}
            alt="Logo KREASI.ID"
            className={styles.logo}
            width="40"
            height="28"
          />
          <span className={styles.wordmark}>KREASI.ID</span>
        </Link>

        <div className={styles.desktopTools} ref={dropdownRef}>
          <NotchNav
            value={isActivityRoute ? 'activities' : pathname}
            items={[
              ...MAIN_LINKS.map((item) => ({ value: item.to, ...item })),
              ...(canBrowseActivities ? [{
                value: 'activities',
                label: 'Kegiatan',
                onClick: () => setDesktopMenuOpen((open) => !open),
                expanded: desktopMenuOpen,
                controls: 'desktop-activities-menu',
                icon: (
                  <ChevronDown
                    size={16}
                    aria-hidden="true"
                    className={desktopMenuOpen ? styles.chevronOpen : styles.chevron}
                  />
                ),
              }] : []),
              ...SECONDARY_LINKS.map((item) => ({ value: item.to, ...item })),
            ]}
          />
          {canBrowseActivities && desktopMenuOpen && (
            <div
              id="desktop-activities-menu"
              className={styles.dropdownPanel}
              role="region"
              aria-label="Daftar enam kegiatan KREASI.ID"
            >
              <div className={styles.dropdownHeader}>
                <p className={styles.dropdownLabel}>Perjalanan Kegiatan</p>
                {isApprovedUser && journey?.summary && (
                  <p className={styles.dropdownSummary}>
                    {journey.summary.completedCount} selesai · {journey.summary.skippedCount} dilewati
                  </p>
                )}
              </div>
              <ul className={styles.dropdownList}>
                {ACTIVITIES.map((activity) => (
                  <li key={activity.id}>
                    <ActivityCard
                      activity={activity}
                      journeyStep={getStepForActivity(activity)}
                      variant="compact"
                      onSelect={() => setDesktopMenuOpen(false)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
          <AccountMenu />
        </div>

        <Button
          ref={mobileToggleRef}
          variant="secondary"
          size="sm"
          className={styles.mobileToggle}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation-panel"
          aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          {mobileMenuOpen ? (
            <>
              <X size={20} aria-hidden="true" />
              <span>Tutup</span>
            </>
          ) : (
            <>
              <Menu size={20} aria-hidden="true" />
              <span>Menu</span>
            </>
          )}
        </Button>
      </div>

      {mobileMenuOpen && (
        <>
          <div
            className={styles.mobileBackdrop}
            data-testid="mobile-menu-backdrop"
            aria-hidden="true"
            onClick={() => setMobileMenuOpen(false)}
          />
          <nav
            id="mobile-navigation-panel"
            ref={mobileDrawerRef}
            className={styles.mobilePanel}
            aria-label="Menu navigasi ponsel"
          >
          <div className="container">
            <ul className={styles.mobileMainList}>
              <li>
                <Link
                  to="/"
                  aria-current={pathname === '/' ? 'page' : undefined}
                  className={[
                    styles.mobileLink,
                    pathname === '/' ? styles.mobileLinkActive : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  Beranda
                </Link>
              </li>
              <li>
                <Link
                  to="/tentang"
                  aria-current={pathname === '/tentang' ? 'page' : undefined}
                  className={[
                    styles.mobileLink,
                    pathname === '/tentang' ? styles.mobileLinkActive : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  Tentang KREASI.ID
                </Link>
              </li>
            </ul>

            {canBrowseActivities && <div className={styles.mobileSection}>
              <div className={styles.dropdownHeader}>
                <p className={styles.mobileSectionLabel}>Kegiatan</p>
                {isApprovedUser && journey?.summary && (
                  <p className={styles.dropdownSummary}>
                    {journey.summary.completedCount} selesai · {journey.summary.skippedCount} dilewati
                  </p>
                )}
              </div>
              <ul className={styles.mobileActivityList}>
                {ACTIVITIES.map((activity) => (
                  <li key={activity.id}>
                    <ActivityCard
                      activity={activity}
                      journeyStep={getStepForActivity(activity)}
                      variant="compact"
                      onSelect={() => setMobileMenuOpen(false)}
                    />
                  </li>
                ))}
              </ul>
            </div>}

            <ul className={styles.mobileMainList}>
              {SECONDARY_LINKS.map((item) => {
                const active = pathname === item.to;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      aria-current={active ? 'page' : undefined}
                      className={[
                        styles.mobileLink,
                        active ? styles.mobileLinkActive : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className={styles.mobileAccount}>
              <AccountMenu />
            </div>
          </div>
        </nav>
        </>
      )}
    </header>
  );
}
