import { Link } from 'react-router';
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck2,
  HeartHandshake,
  HelpCircle,
  KeyRound,
  MonitorSmartphone,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/ui/Button';
import { InfoPanel } from '../components/ui/InfoPanel';
import { ABOUT_DATA } from '../content/learning-materials';
import styles from './AboutPage.module.css';

const PRIVACY_ICONS = [KeyRound, MonitorSmartphone, FileCheck2, Clock, ShieldCheck];

const SUMMARY_ITEMS = [
  {
    label: 'Sasaran',
    value: 'Siswa SMP Kelas VII–IX & Guru BK',
    Icon: Users,
  },
  {
    label: 'Alur Kegiatan',
    value: '6 Langkah Berurutan',
    Icon: Compass,
  },
  {
    label: 'Sifat Isian Pribadi',
    value: 'Sementara di Peramban',
    Icon: ShieldCheck,
  },
];

export function AboutPage() {
  return (
    <PageLayout title="Tentang KREASI.ID">
      <div className="container">
        <div className={styles.aboutWrap}>
          <section className={styles.heroCard} aria-labelledby="about-heading">
            <div className={styles.heroTop}>
              <span className={styles.eyebrow}>
                <Sparkles size={14} aria-hidden="true" />
                <span>Layanan Bimbingan &amp; Konseling SMP</span>
              </span>
              <h1 id="about-heading" className={styles.pageHeading}>
                Tentang KREASI.ID
              </h1>
              <p className={styles.acronym}>{ABOUT_DATA.fullName}</p>
            </div>

            <p className={styles.purpose}>{ABOUT_DATA.purpose}</p>

            <div className={styles.metaStrip} aria-label="Ringkasan singkat KREASI.ID">
              {SUMMARY_ITEMS.map(({ label, value, Icon }) => (
                <div key={label} className={styles.metaItem}>
                  <span className={styles.metaIcon} aria-hidden="true">
                    <Icon size={16} />
                  </span>
                  <div className={styles.metaText}>
                    <span className={styles.metaLabel}>{label}</span>
                    <span className={styles.metaValue}>{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className={styles.twoColGrid}>
            <section className={styles.sectionCard} aria-labelledby="about-usage">
              <div className={styles.sectionHeader}>
                <span className={`${styles.sectionIcon} ${styles.iconBlue}`} aria-hidden="true">
                  <BookOpenCheck size={18} />
                </span>
                <h2 id="about-usage" className={styles.sectionTitle}>
                  Cara menggunakan website
                </h2>
              </div>

              <ol className={styles.stepList}>
                {ABOUT_DATA.howToUse.map((item, idx) => (
                  <li key={item} className={styles.stepItem}>
                    <span className={styles.stepBadge} aria-hidden="true">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className={styles.sectionCard} aria-labelledby="about-counselor">
              <div className={styles.sectionHeader}>
                <span className={`${styles.sectionIcon} ${styles.iconPink}`} aria-hidden="true">
                  <HeartHandshake size={18} />
                </span>
                <h2 id="about-counselor" className={styles.sectionTitle}>
                  Sasaran &amp; peran guru BK
                </h2>
              </div>

              <div className={styles.targetCallout}>
                <Users size={16} aria-hidden="true" className={styles.targetIcon} />
                <div className={styles.targetContent}>
                  <span className={styles.targetHeading}>Sasaran Pengguna</span>
                  <p>{ABOUT_DATA.targetUsers}</p>
                </div>
              </div>

              <ul className={styles.roleList}>
                {ABOUT_DATA.counselorRole.map((item) => (
                  <li key={item} className={styles.roleItem}>
                    <CheckCircle2 size={16} aria-hidden="true" className={styles.roleIcon} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section id="privasi" className={styles.sectionCard} aria-labelledby="about-privacy">
            <div className={styles.sectionHeader}>
              <span className={`${styles.sectionIcon} ${styles.iconMint}`} aria-hidden="true">
                <ShieldCheck size={18} />
              </span>
              <h2 id="about-privacy" className={styles.sectionTitle}>
                Privasi dan pengelolaan jawaban
              </h2>
            </div>

            <div className={styles.privacyNotice}>
              <InfoPanel tone="mint" icon="privacy" title="Alat pendukung eksplorasi diri">
                <p>
                  KREASI.ID mendukung eksplorasi dirimu secara aman dan tidak menggantikan sesi
                  konseling langsung dengan guru BK maupun layanan psikologis profesional.
                </p>
              </InfoPanel>
            </div>

            <div className={styles.privacyGrid}>
              {ABOUT_DATA.privacyPoints.map((point, index) => {
                const Icon = PRIVACY_ICONS[index % PRIVACY_ICONS.length];
                const isLastOdd =
                  ABOUT_DATA.privacyPoints.length % 2 === 1 &&
                  index === ABOUT_DATA.privacyPoints.length - 1;

                return (
                  <article
                    key={point.title}
                    className={[
                      styles.privacyCard,
                      isLastOdd ? styles.privacyCardFull : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <div className={styles.privacyCardHead}>
                      <Icon size={16} aria-hidden="true" className={styles.privacyCardIcon} />
                      <h3 className={styles.privacyTitle}>{point.title}</h3>
                    </div>
                    <p className={styles.privacyDesc}>{point.description}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <div className={styles.actionBar}>
            <div className={styles.actionButtons}>
              <Button to="/self-check" variant="primary" size="sm">
                <span>Mulai Self-check</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Button>
              <Button to="/" variant="secondary" size="sm">
                <span>Kembali ke Beranda</span>
              </Button>
            </div>

            <Link to="/kontak" className={styles.helpLink}>
              <HelpCircle size={16} aria-hidden="true" />
              <span>Butuh bantuan? Hubungi guru BK</span>
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
