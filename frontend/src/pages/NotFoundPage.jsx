import { ArrowLeft } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/ui/Button';
import styles from './ActivityPage.module.css';

export function NotFoundPage() {
  return (
    <PageLayout title="Halaman Tidak Ditemukan">
      <div className="container">
        <div className={`reading-column ${styles.pageStack}`}>
          <section className={styles.sectionCard} aria-labelledby="not-found-heading">
            <h1 id="not-found-heading" className="page-title">
              Halaman tidak ditemukan
            </h1>
            <p className="lead-text">
              Alamat halaman yang kamu buka tidak tersedia di KREASI.ID. Kamu bisa kembali ke
              Beranda untuk memilih kegiatan atau menghubungi bantuan.
            </p>
            <div className={styles.inlineActions}>
              <Button to="/" variant="primary">
                <ArrowLeft size={18} aria-hidden="true" />
                <span>Kembali ke Beranda</span>
              </Button>
              <Button to="/kontak" variant="secondary">
                <span>Kontak dan Bantuan</span>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
