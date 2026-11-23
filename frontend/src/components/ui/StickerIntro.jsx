import { ArrowDown } from 'lucide-react';
import { Button } from './Button';
import { layoutScript, round, StickerSvg } from './sticker-art';
import styles from './StickerIntro.module.css';

const WORD = layoutScript('kreasi.id');
const VIEW_BOX = [-6, WORD.top - 15, WORD.width + 16, WORD.bottom - WORD.top + 28];
const STICKERS = [
  { kind: 'burst', text: 'ayo!', x: 10, y: 29, rotate: -14 },
  { kind: 'smiley', x: 26, y: 75, rotate: 12 },
  { kind: 'heart', x: 43, y: 18, rotate: -9 },
  { kind: 'daisy', x: 62, y: 78, rotate: 15 },
  { kind: 'bubble', text: 'coba', x: 80, y: 22, rotate: -8 },
  { kind: 'bolt', x: 91, y: 75, rotate: 14 },
];

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
          {STICKERS.map((sticker, index) => (
            <div
              key={index}
              className={styles.sticker}
              style={{
                left: `${sticker.x}%`,
                top: `${sticker.y}%`,
                '--rotation': `${sticker.rotate}deg`,
              }}
              aria-hidden="true"
            >
              <span className={styles.lift}>
                <StickerSvg kind={sticker.kind} text={sticker.text} />
              </span>
            </div>
          ))}
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
