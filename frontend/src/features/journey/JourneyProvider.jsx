import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getJourney, updateStepProgress } from '../../services/journey';
import { useAuth } from '../auth/AuthProvider';
import { useEphemeralReset } from '../useEphemeralReset';
import { newestJourney } from './progress-snapshot';

const JourneyContext = createContext(null);

export function JourneyProvider({ children }) {
  const { user } = useAuth();
  const isApproved = Boolean(user && user.status === 'approved' && ['user', 'superadmin'].includes(user.role));
  return (
    <JourneySessionProvider key={isApproved ? user.id : 'guest'} isApproved={isApproved}>
      {children}
    </JourneySessionProvider>
  );
}

function JourneySessionProvider({ children, isApproved }) {
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savingStepId, setSavingStepId] = useState(null);
  const [recapDraft, setRecapDraft] = useState({});
  useEphemeralReset(useCallback(() => setRecapDraft({}), []));
  const sequence = useRef(0);
  const mutationSequence = useRef(0);

  const syncJourney = useCallback((nextJourney) => {
    if (nextJourney && Array.isArray(nextJourney.steps)) {
      setJourney((current) => newestJourney(current, nextJourney));
      setError('');
    }
  }, []);

  const refreshJourney = useCallback(async () => {
    if (!isApproved) {
      sequence.current += 1;
      setJourney(null);
      setLoading(false);
      setError('');
      return null;
    }

    const id = ++sequence.current;
    setLoading(true);
    setError('');
    try {
      const data = await getJourney();
      newestJourney(null, data);
      if (id === sequence.current) {
        setJourney((current) => newestJourney(current, data));
      }
      return data;
    } catch (failure) {
      if (id === sequence.current) {
        setError(failure.message || 'Gagal memuat progres perjalanan.');
      }
      return null;
    } finally {
      if (id === sequence.current) {
        setLoading(false);
      }
    }
  }, [isApproved]);

  useEffect(() => {
    refreshJourney();
    return () => { sequence.current += 1; };
  }, [refreshJourney]);

  const submitStepAction = useCallback(async (stepId, action) => {
    const id = ++sequence.current;
    const mutationId = ++mutationSequence.current;
    setSavingStepId(stepId);
    setLoading(false);
    try {
      const result = await updateStepProgress(stepId, action);
      if (id !== sequence.current) return { ok: false, error: 'Sesi atau permintaan telah berubah. Coba lagi.' };
      if (result.journey) {
        setJourney((current) => newestJourney(current, result.journey));
      }
      setError('');
      return { ok: true, ...result };
    } catch (failure) {
      return {
        ok: false,
        error: failure.message || 'Progres gagal disimpan. Coba lagi.',
      };
    } finally {
      if (mutationId === mutationSequence.current) setSavingStepId(null);
    }
  }, []);

  const completeStep = useCallback(
    async (stepId, answers) => {
      const result = await submitStepAction(stepId, 'complete');
      if (result.ok && answers?.length) setRecapDraft((current) => ({ ...current, [stepId]: answers }));
      return result;
    },
    [submitStepAction]
  );

  const skipStep = useCallback(
    (stepId) => submitStepAction(stepId, 'skip'),
    [submitStepAction]
  );

  const clearRecapStep = useCallback((stepId) => setRecapDraft((current) => {
    const { [stepId]: removed, ...rest } = current;
    return removed ? rest : current;
  }), []);

  const stepsById = useMemo(() => {
    if (!journey?.steps) return {};
    return Object.fromEntries(journey.steps.map((step) => [step.id, step]));
  }, [journey]);

  const value = useMemo(
    () => ({
      journey,
      stepsById,
      loading,
      error,
      savingStepId,
      refreshJourney,
      syncJourney,
      completeStep,
      skipStep,
      recapDraft,
      clearRecapStep,
    }),
    [journey, stepsById, loading, error, savingStepId, refreshJourney, syncJourney, completeStep, skipStep, recapDraft, clearRecapStep]
  );

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
}

export function useJourney() {
  return useContext(JourneyContext);
}
