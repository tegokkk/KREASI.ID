import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { Header } from './Header';
import { Footer } from './Footer';
import styles from './PageLayout.module.css';

export function PageLayout({ title, children, mainClassName = '' }) {
  const { pathname, hash } = useLocation();
  const mainRef = useRef(null);

  useEffect(() => {
    document.title = title ? `${title} — KREASI.ID` : 'KREASI.ID';

    if (hash) {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView();
        return;
      }
    }

    window.scrollTo(0, 0);
    // Move keyboard focus safely to main landmark on route change without visible scroll jump.
    mainRef.current?.focus({ preventScroll: true });
  }, [title, pathname, hash]);

  return (
    <div className={styles.shell}>
      <a href="#main-content" className="skip-link">
        Langsung ke isi utama
      </a>
      <Header />
      <main id="main-content" ref={mainRef} tabIndex={-1} className={`${styles.main} ${mainClassName}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
