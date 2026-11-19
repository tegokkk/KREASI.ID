import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { accountRequest } from '../../services/auth';
import { Button } from '../../components/ui/Button';
import styles from './Auth.module.css';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, loading: true, error: '' });
  const sequence = useRef(0);
  const refresh = useCallback(async () => {
    const id = ++sequence.current;
    try {
      const data = await accountRequest('/api/access/me');
      if (!Object.hasOwn(data, 'user')) throw new Error('Respons akun tidak valid.');
      if (id === sequence.current) setState({ user: data.user, loading: false, error: '' });
      return data.user;
    } catch {
      if (id === sequence.current) setState((previous) => ({ ...previous, loading: false, error: 'Koneksi ke server belum tersedia.' }));
      return null;
    }
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener('focus', refresh);
    const timer = window.setInterval(refresh, 30000);
    return () => {
      window.removeEventListener('focus', refresh);
      window.clearInterval(timer);
      sequence.current += 1;
    };
  }, [refresh]);

  async function logout() {
    await accountRequest('/api/auth/sign-out', { method: 'POST', body: {} });
    sequence.current += 1;
    setState({ user: null, loading: false, error: '' });
  }

  return <AuthContext.Provider value={{ ...state, refresh, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function accountDestination(user) {
  if (user.status !== 'approved') return '/verifikasi';
  return user.role === 'superadmin' ? '/superadmin' : '/';
}

export function AuthLoading() {
  const { error, refresh } = useAuth();
  return (
    <main className={styles.loading} role="status">
      <p>{error || 'Memeriksa akun…'}</p>
      {error && <Button onClick={refresh}>Coba Lagi</Button>}
    </main>
  );
}

export function RequireAccount({ superadmin = false }) {
  const { user, loading, error, refresh } = useAuth();
  const location = useLocation();
  if (loading || (error && !user)) return <AuthLoading />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (user.status !== 'approved') return <Navigate to="/verifikasi" replace />;
  if (superadmin && user.role !== 'superadmin') return <Navigate to="/" replace />;
  return (
    <>
      {error && (
        <div className={styles.connectionWarning} role="status">
          <p>Koneksi terputus. Isian tetap tersedia selama halaman ini terbuka. Penyimpanan progres memerlukan koneksi.</p>
          <Button size="sm" variant="secondary" onClick={refresh}>Coba Lagi</Button>
        </div>
      )}
      <Outlet key={user.id} />
    </>
  );
}
