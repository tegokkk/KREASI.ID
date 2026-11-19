import { useEffect, useState } from 'react';
import {
  BookmarkCheck,
  ExternalLink,
  HelpCircle,
  LifeBuoy,
  ListChecks,
  MessageCircle,
  MonitorSmartphone,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/ui/Button';
import { InfoPanel } from '../components/ui/InfoPanel';
import { HELP_DATA } from '../content/help';
import { DEFAULT_PUBLIC_CONFIG, fetchPublicConfig } from '../services/public-config';
import styles from './ContactPage.module.css';

const TROUBLE_ICONS = [ListChecks, MonitorSmartphone, BookmarkCheck];

export function ContactPage() {
  const [publicConfig, setPublicConfig] = useState(DEFAULT_PUBLIC_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetchPublicConfig({ signal: controller.signal, supportOnly: true }).then((config) => {
      if (!controller.signal.aborted) {
        setPublicConfig(config);
        setLoading(false);
      }
    });

    return () => controller.abort();
  }, []);

  const contactUrl = publicConfig.support.contactUrl;
  const isExternalWebUrl =
    contactUrl && (contactUrl.startsWith('http://') || contactUrl.startsWith('https://'));

  return (
    <PageLayout title="Kontak dan Bantuan">
      <div className="container">
        <div className={styles.contactWrap}>
          <section className={styles.heroCard} aria-labelledby="contact-heading">
            <div className={styles.heroTop}>
              <span className={styles.eyebrow}>
                <HelpCircle size={14} aria-hidden="true" />
                <span>Pendampingan &amp; Bantuan · Layanan BK SMP</span>
              </span>
              <h1 id="contact-heading" className={styles.pageHeading}>
                Kontak dan Bantuan
              </h1>
            </div>
            <p className={styles.introText}>{HELP_DATA.intro}</p>
          </section>

          <section className={styles.sectionCard} aria-labelledby="talk-bk-heading">
            <div className={styles.sectionHeader}>
              <span className={`${styles.sectionIcon} ${styles.iconMint}`} aria-hidden="true">
                <MessageCircle size={18} />
              </span>
              <h2 id="talk-bk-heading" className={styles.sectionTitle}>
                {HELP_DATA.primaryGuide.title}
              </h2>
            </div>

            <p className={styles.sectionDesc}>{HELP_DATA.primaryGuide.description}</p>

            {loading ? (
              <p className={styles.loadingNote}>Memeriksa informasi kanal bantuan sekolah...</p>
            ) : contactUrl ? (
              <div className={styles.contactActions}>
                <Button
                  href={contactUrl}
                  target={isExternalWebUrl ? '_blank' : undefined}
                  rel={isExternalWebUrl ? 'noopener noreferrer' : undefined}
                  variant="primary"
                  size="sm"
                >
                  <MessageCircle size={16} aria-hidden="true" />
                  <span>
                    Hubungi Guru BK{isExternalWebUrl ? ' (Terbuka di tab baru)' : ''}
                  </span>
                  {isExternalWebUrl && <ExternalLink size={15} aria-hidden="true" />}
                </Button>
              </div>
            ) : (
              <div className={styles.noticeWrap}>
                <InfoPanel tone="mint" icon="info" title="Temui guru BK di sekolah">
                  <p>{HELP_DATA.primaryGuide.fallbackText}</p>
                </InfoPanel>
              </div>
            )}
          </section>

          <section className={styles.sectionCard} aria-labelledby="troubleshooting-heading">
            <div className={styles.sectionHeader}>
              <span className={`${styles.sectionIcon} ${styles.iconBlue}`} aria-hidden="true">
                <LifeBuoy size={18} />
              </span>
              <h2 id="troubleshooting-heading" className={styles.sectionTitle}>
                Jika aktivitas atau tautan bermasalah
              </h2>
            </div>

            <div className={styles.troubleGrid}>
              {HELP_DATA.troubleshooting.map((item, index) => {
                const TroubleIcon = TROUBLE_ICONS[index % TROUBLE_ICONS.length];
                const isLastOdd =
                  HELP_DATA.troubleshooting.length % 2 === 1 &&
                  index === HELP_DATA.troubleshooting.length - 1;

                return (
                  <article
                    key={item.id}
                    className={[
                      styles.troubleCard,
                      isLastOdd ? styles.troubleCardFull : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <div className={styles.troubleHead}>
                      <TroubleIcon size={16} aria-hidden="true" className={styles.troubleIcon} />
                      <h3 className={styles.troubleTitle}>{item.title}</h3>
                    </div>

                    <ol className={styles.stepList}>
                      {item.steps.map((step, stepIndex) => (
                        <li key={step} className={styles.stepItem}>
                          <span className={styles.stepBadge} aria-hidden="true">
                            {stepIndex + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </article>
                );
              })}
            </div>
          </section>

          <div className={styles.actionBar}>
            <div className={styles.actionButtons}>
              <Button to="/" variant="secondary" size="sm">
                <span>Kembali ke Beranda</span>
              </Button>
              <Button to="/tips" variant="ghost" size="sm">
                <span>Lihat Tips Latihan</span>
              </Button>
            </div>

            <Link to="/tentang#privasi" className={styles.privacyLink}>
              <ShieldCheck size={16} aria-hidden="true" />
              <span>Baca kebijakan privasi KREASI.ID</span>
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
