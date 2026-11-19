import { Link } from 'react-router';
import { ArrowLeft, ArrowRight, FastForward, HelpCircle, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { InfoPanel } from '../ui/InfoPanel';
import styles from './ActivityNavigation.module.css';

export function ActivityNavigation({ prev, next, skip, error, onRetry }) {
  return (
    <nav className={styles.wrapper} aria-label="Navigasi langkah kegiatan">
      {error && (
        <InfoPanel tone="error" icon="warning" role="alert" title="Progres belum tersimpan">
          <p>{error}</p>
          {onRetry && (
            <div className={styles.retryRow}>
              <Button variant="secondary" size="sm" onClick={onRetry} disabled={next?.loading || skip?.loading}>
                Coba Lagi
              </Button>
            </div>
          )}
        </InfoPanel>
      )}

      {next?.hint && (
        <p className={styles.hint} role="status">
          {next.hint}
        </p>
      )}

      <div className={styles.actions}>
        {prev ? (
          <Button to={prev.to} variant="secondary" className={styles.prevButton}>
            <ArrowLeft size={18} aria-hidden="true" />
            <span>{prev.label}</span>
          </Button>
        ) : (
          <span />
        )}

        <div className={styles.forwardActions}>
          {skip && (
            <Button
              type="button"
              variant="secondary"
              disabled={skip.disabled || skip.loading || next?.loading}
              onClick={skip.onClick}
              className={styles.skipButton}
            >
              {skip.loading ? (
                <Loader2 size={18} aria-hidden="true" className={styles.spinner} />
              ) : (
                <FastForward size={18} aria-hidden="true" />
              )}
              <span>{skip.loading ? 'Menyimpan…' : skip.label}</span>
            </Button>
          )}

          {next && (
            <Button
              to={next.onClick ? undefined : next.to}
              type={next.onClick ? 'button' : undefined}
              onClick={next.onClick}
              disabled={next.disabled || next.loading || skip?.loading}
              variant="primary"
              className={styles.nextButton}
            >
              <span>{next.loading ? 'Menyimpan…' : next.label}</span>
              {next.loading ? (
                <Loader2 size={18} aria-hidden="true" className={styles.spinner} />
              ) : (
                <ArrowRight size={18} aria-hidden="true" />
              )}
            </Button>
          )}
        </div>
      </div>

      <div className={styles.utilityLinks}>
        <Link to="/kontak" className={styles.utilityLink}>
          <HelpCircle size={16} aria-hidden="true" />
          <span>Butuh bantuan? Hubungi guru BK</span>
        </Link>
        <Link to="/tentang#privasi" className={styles.utilityLink}>
          <ShieldCheck size={16} aria-hidden="true" />
          <span>Baca info privasi</span>
        </Link>
      </div>
    </nav>
  );
}
