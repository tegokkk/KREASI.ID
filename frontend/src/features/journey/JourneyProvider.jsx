import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getJourney, getStudentRecap, updateStepProgress } from '../../services/journey';
import { useAuth } from '../auth/AuthProvider';
import { useEphemeralReset } from '../useEphemeralReset';
import { newestJourney } from './progress-snapshot';

const JourneyContext = createContext(null);

export function JourneyProvider({ children }) {
  const { user } = useAuth();
  const isApproved = Boolean(user && user.status === 'approved' && ['user', 'superadmin'].includes(user.role));
  const isStudent = Boolean(user && user.status === 'approved' && user.role === 'user');
  return (
    <JourneySessionProvider key={isApproved ? user.id : 'guest'} isApproved={isApproved} isStudent={isStudent}>
      {children}
    </JourneySessionProvider>
  );
}

function JourneySessionProvider({ children, isApproved, isStudent }) {
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savingStepId, setSavingStepId] = useState(null);
  const [recap, setRecap] = useState(null);
  const [recapLoading, setRecapLoading] = useState(false);
  const [recapError, setRecapError] = useState('');
  const [recapDraft, setRecapDraft] = useState({});
  useEphemeralReset(useCallback(() => setRecapDraft({}), []));
  const sequence = useRef(0);
  const recapSequence = useRef(0);
  const mutationSequence = useRef(0);

  const syncJourney = useCallback((nextJourney) => {
    if (nextJourney && Array.isArray(nextJourney.steps)) {
      setJourney((current) => newestJourney(current, nextJourney));
      setError('');
    }
  }, []);

  const applyRecap = useCallback((nextRecap) => {
    setRecap(nextRecap ?? null);
    setRecapDraft({});
  }, []);

  const refreshRecap = useCallback(async () => {
    if (!isStudent) {
      recapSequence.current += 1;
      setRecap(null);
      setRecapLoading(false);
      setRecapError('');
      return null;
    }

    const id = ++recapSequence.current;
    setRecapLoading(true);
    setRecapError('');
    try {
      const data = await getStudentRecap();
      if (id === recapSequence.current) {
        setRecap(data?.recap ?? null);
      }
      return data?.recap ?? null;
    } catch (failure) {
      if (id === recapSequence.current) {
        setRecapError(failure.message || 'Gagal memuat rekap jawaban.');
      }
      return null;
    } finally {
      if (id === recapSequence.current) {
        setRecapLoading(false);
      }
    }
  }, [isStudent]);

  const refreshJourney = useCallback(async () => {
    if (!isApproved) {
      sequence.current += 1;
      recapSequence.current += 1;
      setJourney(null);
      setLoading(false);
      setError('');
      setRecap(null);
      setRecapLoading(false);
      setRecapError('');
      return null;
    }

    const id = ++sequence.current;
    setLoading(true);
    setError('');
    if (isStudent) refreshRecap();
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
  }, [isApproved, isStudent, refreshRecap]);

  useEffect(() => {
    refreshJourney();
    return () => {
      sequence.current += 1;
      recapSequence.current += 1;
    };
  }, [refreshJourney]);

  const submitStepAction = useCallback(async (stepId, action, answers) => {
    const id = ++sequence.current;
    const mutationId = ++mutationSequence.current;
    setSavingStepId(stepId);
    setLoading(false);
    try {
      const result = await updateStepProgress(stepId, action, isStudent ? answers : undefined);
      if (id !== sequence.current) return { ok: false, error: 'Sesi atau permintaan telah berubah. Coba lagi.' };
      if (result.journey) {
        setJourney((current) => newestJourney(current, result.journey));
      }
      if (isStudent && Object.hasOwn(result, 'recap')) {
        recapSequence.current += 1;
        applyRecap(result.recap ?? null);
        setRecapError('');
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
  }, [isStudent, applyRecap]);

  const completeStep = useCallback(
    async (stepId, answers) => {
      const result = await submitStepAction(stepId, 'complete', answers);
      if (result.ok && answers?.length && !isStudent) {
        setRecapDraft((current) => ({ ...current, [stepId]: answers }));
      }
      return result;
    },
    [submitStepAction, isStudent]
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
      recap,
      recapLoading,
      recapError,
      refreshRecap,
      setRecap: applyRecap,
      recapDraft,
      clearRecapStep,
    }),
    [
      journey,
      stepsById,
      loading,
      error,
      savingStepId,
      refreshJourney,
      syncJourney,
      completeStep,
      skipStep,
      recap,
      recapLoading,
      recapError,
      refreshRecap,
      applyRecap,
      recapDraft,
      clearRecapStep,
    ]
  );

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
}

export function useJourney() {
  return useContext(JourneyContext);
}
