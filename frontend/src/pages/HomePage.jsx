import { ArrowRight, HelpCircle, ShieldCheck } from 'lucide-react';
import { ACTIVITIES } from '../content/activities';
import { PageLayout } from '../components/layout/PageLayout';
import { ActivityCard } from '../components/navigation/ActivityCard';
import { Button } from '../components/ui/Button';
import { StickerIntro } from '../components/ui/StickerIntro';
import { useAuth } from '../features/auth/AuthProvider';
import { JourneySection } from '../features/journey/JourneySection';
import styles from './HomePage.module.css';

export function HomePage() {
  const { user } = useAuth();
  const isApprovedUser = Boolean(user && user.status === 'approved');
  const isPendingOrRejected = Boolean(user && user.status !== 'approved');

  let publicCta = { to: '/login', label: 'Masuk untuk Mulai' };
  if (isPendingOrRejected) {
    publicCta = { to: '/verifikasi', label: 'Lihat Status Verifikasi' };
  }

  return (
    <PageLayout title="Beranda" mainClassName={styles.homeMain}>
      <section className={styles.opening} aria-label="Animasi pembuka KREASI.ID">
        <StickerIntro />
      </section>
      <div className={`container ${styles.pageStack}`}>
        {isApprovedUser ? (
          <JourneySection id="jelajahi" />
        ) : (
          <>
            <section id="jelajahi" className={styles.hero} aria-labelledby="hero-heading" tabIndex={-1}>
              <div className={styles.dotsTopRight} aria-hidden="true" />
              <div className={styles.dotsBottomLeft} aria-hidden="true" />

              <div className={styles.heroGrid}>
                <div className={styles.heroContent}>
                  <p className={styles.heroBadge}>
                    <span className={styles.badgeDot} aria-hidden="true" />
                    <span>Layanan Bimbingan dan Konseling SMP</span>
                  </p>

                  <h1 id="hero-heading" className={styles.heroTitle}>
                    Kenali potensi, mulai langkahmu.
                  </h1>

                  <p className={styles.heroLead}>
                    KREASI.ID membantumu mengenali minat, mencoba cara melatih kemampuan, dan
                    membuat rencana sederhana melalui perjalanan enam langkah.
                  </p>

                  <div className={styles.heroActions}>
                    <Button to={publicCta.to} variant="onHero" onDark>
                      <span>{publicCta.label}</span>
                      <ArrowRight size={18} aria-hidden="true" />
                    </Button>
                    {!user && (
                      <Button to="/daftar" variant="secondaryOnDark" onDark>
                        <span>Daftar Akun</span>
                      </Button>
                    )}
                  </div>

                  <p className={styles.heroMeta}>
                    <ShieldCheck size={16} aria-hidden="true" />
                    <span>Isian bersifat pribadi &amp; sementara, bebas dari perbandingan antarsiswa.</span>
                  </p>
                </div>
              </div>
            </section>

            <section className={styles.section} aria-labelledby="choose-activity-heading">
              <div className={styles.sectionHeader}>
                <h2 id="choose-activity-heading" className="section-title">
                  Rangkaian enam kegiatan
                </h2>
                <p className="lead-text">
                  Masuk dengan akun yang telah diverifikasi superadmin untuk memulai perjalanan
                  berurutan dari Self-check sampai Action Plan.
                </p>
              </div>

              <div className={styles.activitiesGrid}>
                {ACTIVITIES.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            </section>
          </>
        )}

        <section className={styles.helpPanel} aria-labelledby="home-help-heading">
          <div className={styles.helpText}>
            <div className={styles.helpBadge}>
              <HelpCircle size={18} aria-hidden="true" />
              <span>Pendampingan Guru BK</span>
            </div>
            <h2 id="home-help-heading" className="section-title">
              Butuh bantuan?
            </h2>
            <p className={styles.helpBody}>
              Kalau kamu butuh teman berdiskusi tentang rencanamu, temui guru BK di sekolah.
            </p>
          </div>

          <div className={styles.helpAction}>
            <Button to="/kontak" variant="primary">
              <span>Kontak dan Bantuan</span>
              <ArrowRight size={18} aria-hidden="true" />
            </Button>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
