import { Link } from 'react-router';
import logoKreasi from '../../assets/images/logo-kreasi.png';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brandBlock}>
          <div className={styles.brandRow}>
            <img
              src={logoKreasi}
              alt=""
              aria-hidden="true"
              className={styles.logo}
              width="36"
              height="25"
            />
            <span className={styles.wordmark}>KREASI.ID</span>
          </div>
          <p className={styles.tagline}>
            Kenali, Refleksikan, Eksplorasi, dan Aktualisasikan Potensi Diri
          </p>
          <p className={styles.note}>
            Website pendukung layanan Bimbingan dan Konseling (BK) untuk peserta didik SMP.
            Jawaban tetap di browser sampai kamu memilih untuk membagikannya lewat Rekap Jawaban.
          </p>
        </div>

        <nav className={styles.links} aria-label="Navigasi kaki halaman">
          <Link to="/tentang" className={styles.link}>
            Tentang KREASI.ID
          </Link>
          <Link to="/kontak" className={styles.link}>
            Kontak dan Bantuan
          </Link>
          <Link to="/tentang#privasi" className={styles.link}>
            Privasi
          </Link>
        </nav>
      </div>
    </footer>
  );
}
