import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import styles from './NotchNav.module.css';

export function NotchNav({ items, value, ariaLabel = 'Navigasi utama' }) {
  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const [indicator, setIndicator] = useState(null);
  const activeIndex = items.findIndex((item) => item.value === value);

  const measure = useCallback(() => {
    const container = containerRef.current;
    const active = itemRefs.current[activeIndex];
    if (!container || !active) {
      setIndicator(null);
      return;
    }
    const containerRect = container.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    setIndicator({ left: activeRect.left - containerRect.left, width: activeRect.width });
  }, [activeIndex]);

  useLayoutEffect(() => {
    let mounted = true;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(containerRef.current);
    itemRefs.current.forEach((element) => { if (element) observer.observe(element); });
    document.fonts.ready.then(() => { if (mounted) measure(); });
    return () => {
      mounted = false;
      observer.disconnect();
    };
  }, [measure]);

  function moveFocus(event, index) {
    const next = { ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: items.length - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    itemRefs.current[Math.max(0, Math.min(items.length - 1, next))]?.focus();
  }

  return (
    <nav aria-label={ariaLabel} className={styles.nav}>
      <div ref={containerRef} className={styles.surface}>
        <ul className={styles.items}>
          {items.map((item, index) => {
            const props = {
              ref: (element) => { itemRefs.current[index] = element; },
              className: `${styles.item} ${value === item.value ? styles.active : ''}`,
              'aria-current': value === item.value ? 'page' : undefined,
              onKeyDown: (event) => moveFocus(event, index),
            };
            return (
              <li key={item.value}>
                {item.to ? (
                  <Link {...props} to={item.to}>{item.label}</Link>
                ) : (
                  <button {...props} type="button" onClick={item.onClick} aria-expanded={item.expanded} aria-controls={item.controls}>
                    {item.label}{item.icon}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
        {indicator && (
          <span
            aria-hidden="true"
            className={styles.indicator}
            style={{ transform: `translate3d(${indicator.left}px, 0, 0)`, width: indicator.width }}
          >
            <svg viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M2 1H98Q99 1 99 2V10H88Q87.2 10 86.6 11.4L84.8 18H15.2L13.4 11.4Q12.8 10 12 10H2Q1 10 1 9V2Q1 1 2 1Z" fill="currentColor" />
            </svg>
          </span>
        )}
      </div>
    </nav>
  );
}
