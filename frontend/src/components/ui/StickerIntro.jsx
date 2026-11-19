import { useLayoutEffect, useRef, useState } from 'react';
import { ArrowDown, RotateCcw } from 'lucide-react';
import { Button } from './Button';
import { clamp, layoutScript, round, StickerSvg } from './sticker-art';
import styles from './StickerIntro.module.css';

const WORD = layoutScript('kreasi.id');
const VIEW_BOX = [-6, WORD.top - 15, WORD.width + 16, WORD.bottom - WORD.top + 28];
const STICKERS = [
  { kind: 'burst', text: 'ayo!', label: 'Stiker Ayo', x: 10, y: 29, rotate: -14 },
  { kind: 'smiley', label: 'Stiker senyum', x: 26, y: 75, rotate: 12 },
  { kind: 'heart', label: 'Stiker hati', x: 43, y: 18, rotate: -9 },
  { kind: 'daisy', label: 'Stiker bunga', x: 62, y: 78, rotate: 15 },
  { kind: 'bubble', text: 'coba', label: 'Stiker Coba', x: 80, y: 22, rotate: -8 },
  { kind: 'bolt', label: 'Stiker petir', x: 91, y: 75, rotate: 14 },
];

export function StickerIntro() {
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const dragRef = useRef(null);
  const [run, setRun] = useState(0);
  const [positions, setPositions] = useState({});
  const [dragging, setDragging] = useState(null);

  useLayoutEffect(() => {
    rootRef.current.querySelectorAll('path[data-draw]').forEach((path) => {
      path.style.setProperty('--path-length', `${Math.ceil(path.getTotalLength()) + 1}px`);
    });
  }, [run]);

  function startDrag(event, index) {
    if (event.button !== 0) return;
    const bounds = stageRef.current.getBoundingClientRect();
    const position = positions[index] ?? STICKERS[index];
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      index,
      pointerId: event.pointerId,
      pointerX: event.clientX,
      pointerY: event.clientY,
      x: position.x,
      y: position.y,
      width: bounds.width,
      height: bounds.height,
    };
    setDragging(index);
  }

  function moveSticker(event) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const x = clamp(drag.x + ((event.clientX - drag.pointerX) / drag.width) * 100, 9, 91);
    const y = clamp(drag.y + ((event.clientY - drag.pointerY) / drag.height) * 100, 18, 82);
    setPositions((previous) => ({ ...previous, [drag.index]: { x, y } }));
  }

  function endDrag(event) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setDragging(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function resetSticker(index) {
    setPositions((previous) => {
      const next = { ...previous };
      delete next[index];
      return next;
    });
  }

  function handleStickerKey(event, index) {
    if (event.key === 'Home' || event.key === 'Escape') {
      event.preventDefault();
      resetSticker(index);
      return;
    }
    const direction = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    }[event.key];
    if (!direction) return;
    event.preventDefault();
    const step = event.shiftKey ? 6 : 2;
    const position = positions[index] ?? STICKERS[index];
    setPositions((previous) => ({
      ...previous,
      [index]: {
        x: clamp(position.x + direction[0] * step, 9, 91),
        y: clamp(position.y + direction[1] * step, 18, 82),
      },
    }));
  }

  function replay() {
    setPositions({});
    setRun((previous) => previous + 1);
  }

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
    <div className={`container ${styles.frame}`} ref={rootRef}>
      <div className={styles.panel}>
        <div className={styles.stage} ref={stageRef}>
          <svg
            key={run}
            viewBox={VIEW_BOX.map(round).join(' ')}
            className={styles.wordmark}
            role="img"
            aria-label="KREASI.ID"
          >
            <g transform="skewX(-9)">
              <path d={WORD.main} data-draw="" style={{ '--duration': '2.2s', '--delay': '.2s' }} />
              {WORD.extra.map((path, index) => (
                <path
                  key={index}
                  d={path}
                  data-draw=""
                  style={{ '--duration': '.25s', '--delay': `${2.4 + index * 0.12}s` }}
                />
              ))}
            </g>
          </svg>
          {STICKERS.map((sticker, index) => {
            const position = positions[index] ?? sticker;
            return (
              <button
                key={index}
                type="button"
                className={`${styles.sticker} ${dragging === index ? styles.dragging : ''}`}
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  '--rotation': `${sticker.rotate}deg`,
                  '--delay': `${0.35 + (sticker.x / 100) * 2.2}s`,
                }}
                aria-label={sticker.label}
                aria-describedby="sticker-instructions"
                onPointerDown={(event) => startDrag(event, index)}
                onPointerMove={moveSticker}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onLostPointerCapture={endDrag}
                onDoubleClick={() => resetSticker(index)}
                onKeyDown={(event) => handleStickerKey(event, index)}
              >
                <span key={run} className={styles.slap}>
                  <span className={styles.lift}>
                    <StickerSvg kind={sticker.kind} text={sticker.text} />
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <div className={styles.controls}>
          <p>Geser stikernya, susun versimu.</p>
          <div className={styles.controlActions}>
            <Button href="#jelajahi" variant="onHero" onDark onClick={explore}>
              <span>Jelajahi KREASI.ID</span>
              <ArrowDown size={20} aria-hidden="true" />
            </Button>
            <Button type="button" variant="secondaryOnDark" size="sm" onDark onClick={replay}>
              <RotateCcw size={16} aria-hidden="true" />
              <span>Putar ulang</span>
            </Button>
          </div>
        </div>
      </div>
      <p id="sticker-instructions" className="sr-only">
        Geser stiker dengan sentuhan atau tombol panah. Tekan Home atau Escape untuk mengembalikannya.
        Klik dua kali juga mengembalikan posisi stiker.
      </p>
    </div>
  );
}
