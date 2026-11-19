import {
  ArrowRight,
  Clock,
  Compass,
  HeartHandshake,
  HelpCircle,
  Home,
  MessageSquareHeart,
  School,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/ui/Button';
import { TIPS_DATA } from '../content/learning-materials';
import styles from './TipsPage.module.css';

const TIP_META = {
  'latihan-kecil': {
    Icon: Clock,
    cardClass: styles.tipYellow,
    iconClass: styles.iconYellow,
    pillClass: styles.pillYellow,
  },
  'coba-hal-baru': {
    Icon: Compass,
    cardClass: styles.tipGreen,
    iconClass: styles.iconGreen,
    pillClass: styles.pillGreen,
  },
  'minta-masukan': {
    Icon: MessageSquareHeart,
    cardClass: styles.tipPink,
    iconClass: styles.iconPink,
    pillClass: styles.pillPink,
  },
};

const SUMMARY_ITEMS = [
  {
    label: 'Durasi Mulai',
    value: '10–15 Menit / Hari',
    Icon: Clock,
  },
  {
    label: 'Tempat Latihan',
    value: 'Di Sekolah & Di Rumah',
    Icon: Compass,
  },
  {
    label: 'Pendekatan',
    value: 'Bertahap & Tanpa Tekanan',
    Icon: HeartHandshake,
  },
];

function stripExamplePrefix(text, prefixRegex) {
  const cleaned = text.replace(prefixRegex, '').trim();
  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : text;
}

export function TipsPage() {
  return (
    <PageLayout title="Tips">
      <div className="container">
        <div className={styles.tipsWrap}>
          <section className={styles.heroCard} aria-labelledby="tips-heading">
            <div className={styles.heroTop}>
              <span className={styles.eyebrow}>
                <Sparkles size={14} aria-hidden="true" />
                <span>Tips Pengembangan Diri · Siswa SMP</span>
              </span>
              <h1 id="tips-heading" className={styles.pageHeading}>
                Tips Latihan Sehari-hari
              </h1>
            </div>

            <p className={styles.introText}>{TIPS_DATA.intro}</p>

            <div className={styles.metaStrip} aria-label="Ringkasan kebiasaan latihan">
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

          <div className={styles.tipsList}>
            {TIPS_DATA.sections.map((tip) => {
              const meta = TIP_META[tip.id] || TIP_META['latihan-kecil'];
              const TipIcon = meta.Icon;

              return (
                <section
                  key={tip.id}
                  aria-labelledby={`tip-${tip.id}`}
                  className={`${styles.tipCard} ${meta.cardClass}`}
                >
                  <div className={styles.tipHeader}>
                    <span className={`${styles.tipIcon} ${meta.iconClass}`} aria-hidden="true">
                      <TipIcon size={18} />
                    </span>
                    <div className={styles.tipTitleGroup}>
                      <span className={`${styles.tipPill} ${meta.pillClass}`}>
                        {tip.stepLabel}
                      </span>
                      <h2 id={`tip-${tip.id}`} className={styles.sectionTitle}>
                        {tip.title}
                      </h2>
                    </div>
                  </div>

                  <p className={styles.tipSummary}>{tip.summary}</p>

                  <div className={styles.exampleGrid}>
                    <article className={styles.exampleCard}>
                      <div className={styles.exampleHead}>
                        <School size={16} aria-hidden="true" className={styles.exampleIcon} />
                        <h3 className={styles.exampleTitle}>Di Sekolah</h3>
                      </div>
                      <p className={styles.exampleBody}>
                        {stripExamplePrefix(tip.schoolExample, /^Di sekolah:\s*/i)}
                      </p>
                    </article>

                    <article className={styles.exampleCard}>
                      <div className={styles.exampleHead}>
                        <Home size={16} aria-hidden="true" className={styles.exampleIcon} />
                        <h3 className={styles.exampleTitle}>Di Rumah</h3>
                      </div>
                      <p className={styles.exampleBody}>
                        {stripExamplePrefix(tip.homeExample, /^Di rumah:\s*/i)}
                      </p>
                    </article>
                  </div>
                </section>
              );
            })}
          </div>

          <section className={styles.ctaCard} aria-labelledby="tips-next-heading">
            <div className={styles.ctaTextBlock}>
              <h2 id="tips-next-heading" className={styles.ctaHeading}>
                Siap mencoba salah satu tips di atas?
              </h2>
              <p className={styles.ctaDesc}>
                Kamu bisa membaca kembali panduan latihan di Mengembangkan Potensi atau langsung
                menuliskan satu langkah kecil di Action Plan.
              </p>
            </div>

            <div className={styles.actionRow}>
              <div className={styles.actionButtons}>
                <Button to="/action-plan" variant="primary" size="sm">
                  <span>Action Plan</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </Button>
                <Button to="/mengembangkan-potensi" variant="secondary" size="sm">
                  <span>Mengembangkan Potensi</span>
                </Button>
              </div>

              <Link to="/kontak" className={styles.helpLink}>
                <HelpCircle size={16} aria-hidden="true" />
                <span>Butuh bantuan? Hubungi guru BK</span>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
