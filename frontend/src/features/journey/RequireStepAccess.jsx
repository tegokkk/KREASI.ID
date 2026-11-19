import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Loader2, Lock } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Button } from '../../components/ui/Button';
import { InfoPanel } from '../../components/ui/InfoPanel';
import { ACTIVITIES } from '../../content/activities';
import { checkStepAccess } from '../../services/journey';
import { useJourney } from './JourneyProvider';
import styles from './RequireStepAccess.module.css';

const ACTIVITY_BY_ID = Object.fromEntries(ACTIVITIES.map((item) => [item.id, item]));

export function RequireStepAccess({ stepId, children }) {
  return <StepAccessCheck key={stepId} stepId={stepId}>{children}</StepAccessCheck>;
}

function StepAccessCheck({ stepId, children }) {
  const { syncJourney } = useJourney();
  const sequence = useRef(0);
  const request = useRef(null);
  const [state, setState] = useState({
    status: 'checking',
    step: null,
    redirectStepId: null,
    error: '',
  });

  const verifyAccess = useCallback(async () => {
    const id = ++sequence.current;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setState((prev) => ({ ...prev, status: 'checking', error: '' }));
    try {
      const result = await checkStepAccess(stepId, { signal: controller.signal });
      if (id !== sequence.current) return;
      if (result.data?.journey) {
        syncJourney(result.data.journey);
      }
      if (result.ok && result.data?.allowed) {
        setState({
          status: 'allowed',
          step: result.data.step,
          redirectStepId: null,
          error: '',
        });
        return;
      }
      if (result.status === 403 && result.data?.allowed === false) {
        setState({
          status: 'locked',
          step: result.data.step,
          redirectStepId: result.data.redirectStepId || 'self-check',
          error: result.data.error || 'Langkah ini belum terbuka.',
        });
        return;
      }
      setState({
        status: 'error',
        step: null,
        redirectStepId: null,
        error: result.data?.error || 'Gagal memeriksa akses langkah.',
      });
    } catch {
      if (id !== sequence.current) return;
      setState({
        status: 'error',
        step: null,
        redirectStepId: null,
        error: 'Koneksi ke server belum tersedia.',
      });
    }
  }, [stepId, syncJourney]);

  useEffect(() => {
    verifyAccess();
    return () => {
      sequence.current += 1;
      request.current?.abort();
    };
  }, [verifyAccess]);

  const activity = ACTIVITY_BY_ID[stepId];

  if (state.status === 'allowed') {
    return children;
  }

  if (state.status === 'checking') {
    return (
      <PageLayout title={activity?.title || 'Memeriksa Akses'}>
        <div className="container">
          <div className={`reading-column ${styles.wrap}`}>
            <div className={styles.loadingCard} role="status">
              <Loader2 size={24} aria-hidden="true" className={styles.spinner} />
              <p>Memeriksa kesiapan langkah perjalananmu…</p>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (state.status === 'error') {
    return (
      <PageLayout title={activity?.title || 'Gagal Memeriksa Akses'}>
        <div className="container">
          <div className={`reading-column ${styles.wrap}`}>
            <InfoPanel tone="error" icon="warning" role="alert" title="Belum bisa membuka kegiatan">
              <p>{state.error}</p>
            </InfoPanel>
            <div className={styles.actions}>
              <Button variant="primary" onClick={verifyAccess}>
                Coba Lagi
              </Button>
              <Button to="/#jelajahi" variant="secondary">
                Lihat Perjalanan Potensimu
              </Button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  const prerequisite = state.step?.prerequisiteStep;
  const targetActivity = ACTIVITY_BY_ID[state.redirectStepId] || ACTIVITIES[0];

  return (
    <PageLayout title={`${activity?.title || 'Langkah'} — Belum Terbuka`}>
      <div className="container">
        <div className={`reading-column ${styles.wrap}`}>
          <section className={styles.lockedCard} aria-labelledby="locked-step-heading">
            <span className={styles.lockBadge}>
              <Lock size={18} aria-hidden="true" />
              <span>Langkah {activity?.step} Belum Terbuka</span>
            </span>

            <h1 id="locked-step-heading" className="page-title">
              {activity?.title} belum dapat dibuka
            </h1>

            <p className="lead-text">
              {prerequisite
                ? `Selesaikan Langkah ${prerequisite.step} (${prerequisite.title}) terlebih dahulu sebelum membuka kegiatan ini.`
                : state.error}
            </p>

            <div className={styles.actions}>
              <Button to={targetActivity.path} variant="primary">
                <span>Buka Langkah {targetActivity.step}: {targetActivity.title}</span>
              </Button>
              <Button to="/#jelajahi" variant="secondary">
                <ArrowLeft size={18} aria-hidden="true" />
                <span>Lihat Perjalanan Potensimu</span>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
