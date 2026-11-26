import { ArrowDown } from 'lucide-react';
import { Button } from './Button';
import { layoutScript, round } from './sticker-art';
import styles from './StickerIntro.module.css';

const WORD = layoutScript('kreasi.id');
const VIEW_BOX = [-6, WORD.top - 15, WORD.width + 16, WORD.bottom - WORD.top + 28];

export function StickerIntro() {
  function explore(event) {
    const target = document.getElementById('jelajahi');
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      block: 'start',
    });
    target.focus({ preventScroll: true });
  }

  return (
    <div className={`container ${styles.frame}`}>
      <div className={styles.panel}>
        <div className={styles.stage}>
          <svg
            viewBox={VIEW_BOX.map(round).join(' ')}
            className={styles.wordmark}
            role="img"
            aria-label="KREASI.ID"
          >
            <g transform="skewX(-9)">
              <path d={WORD.main} />
              {WORD.extra.map((path, index) => (
                <path key={index} d={path} />
              ))}
            </g>
          </svg>
        </div>
        <div className={styles.controls}>
          <p>Kenali potensi dirimu bersama KREASI.ID.</p>
          <div className={styles.controlActions}>
            <Button href="#jelajahi" variant="onHero" onDark onClick={explore}>
              <span>Jelajahi KREASI.ID</span>
              <ArrowDown size={20} aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
