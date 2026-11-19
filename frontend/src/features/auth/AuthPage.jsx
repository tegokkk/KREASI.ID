import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router';
import { ArrowRight, LockKeyhole, ShieldCheck } from 'lucide-react';
import logo from '../../assets/images/logo-kreasi.png';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';
import { accountRequest } from '../../services/auth';
import { accountDestination, AuthLoading, useAuth } from './AuthProvider';
import styles from './Auth.module.css';

export function AuthPage({ register = false }) {
  const { user, loading, error: connectionError, refresh } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    document.title = `${register ? 'Daftar Akun' : 'Masuk'} — KREASI.ID`;
    setForm({ name: '', email: '', password: '', confirm: '' });
    setError('');
  }, [register]);

  if (loading || connectionError) return <AuthLoading />;
  if (user) return <Navigate to={accountDestination(user)} replace />;
  const change = (key) => (event) => setForm((previous) => ({ ...previous, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (!form.email.trim() || !form.password) return setError('Lengkapi email dan kata sandi.');
    if (register && form.password !== form.confirm) return setError('Konfirmasi kata sandi belum sesuai.');
    if (register && form.name.trim().length < 2) return setError('Tulis nama minimal dua karakter.');
    setBusy(true);
    try {
      const endpoint = register ? 'sign-up/email' : 'sign-in/email';
      await accountRequest(`/api/auth/${endpoint}`, {
        method: 'POST',
        body: { ...(register ? { name: form.name.trim() } : {}), email: form.email.trim().toLowerCase(), password: form.password },
      });
      setForm({ name: '', email: '', password: '', confirm: '' });
      await refresh();
    } catch (failure) {
      setError(failure.message || 'Koneksi bermasalah. Silakan coba lagi.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={styles.authShell}>
      <section className={styles.introduction} aria-label="Tentang KREASI.ID">
        <img src={logo} alt="Logo KREASI.ID" className={styles.logo} />
        <p className={styles.brand}>KREASI.ID</p>
        <h1>Kenali potensi,<br />mulai langkahmu.</h1>
        <p>Ruang untuk mengenali minat, melatih kemampuan, dan merencanakan langkah kecilmu.</p>
        <div className={styles.introNote}><ShieldCheck aria-hidden="true" /><p>Akun diverifikasi oleh superadmin sebelum kamu mulai menjelajahi kegiatan.</p></div>
      </section>
      <section className={styles.formPanel} aria-labelledby="auth-heading">
        <LockKeyhole className={styles.authIcon} size={28} aria-hidden="true" />
        <h2 id="auth-heading">{register ? 'Buat akunmu' : 'Selamat datang kembali'}</h2>
        <p className={styles.muted}>{register ? 'Daftar untuk mengajukan akses ke KREASI.ID.' : 'Masuk menggunakan email dan kata sandi akunmu.'}</p>
        <form onSubmit={submit} className={styles.form}>
          {register && <FormField id="name" label="Nama" required autoComplete="name" maxLength={100} value={form.name} onChange={change('name')} />}
          <FormField id="email" label="Email" required type="email" autoComplete="email" maxLength={254} value={form.email} onChange={change('email')} />
          <FormField id="password" label="Kata sandi" required type="password" autoComplete={register ? 'new-password' : 'current-password'} minLength={register ? 12 : undefined} maxLength={128} helperText={register ? 'Gunakan minimal 12 karakter.' : undefined} value={form.password} onChange={change('password')} />
          {register && <FormField id="confirm-password" label="Konfirmasi kata sandi" required type="password" autoComplete="new-password" minLength={12} maxLength={128} value={form.confirm} onChange={change('confirm')} />}
          {register && <p className={styles.privacy}>Nama dan email digunakan untuk akun serta peninjauan akses oleh superadmin. Jawaban kegiatan pribadi diproses sementara di perangkatmu.</p>}
          {error && <p className={styles.error} role="alert">{error}</p>}
          <Button type="submit" fullWidth disabled={busy}>{busy ? 'Memproses…' : register ? 'Daftar Akun' : 'Masuk'}<ArrowRight size={18} aria-hidden="true" /></Button>
        </form>
        <p className={styles.switchLink}>{register ? 'Sudah punya akun? ' : 'Belum punya akun? '}<Link to={register ? '/login' : '/daftar'}>{register ? 'Masuk' : 'Daftar sekarang'}</Link></p>
        <p className={styles.switchLink}><Link to="/">Kembali ke Beranda</Link></p>
      </section>
    </main>
  );
}
