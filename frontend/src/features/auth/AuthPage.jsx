import { useEffect, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router';
import { ArrowLeft, ArrowRight, GraduationCap, LockKeyhole, ShieldCheck } from 'lucide-react';
import logo from '../../assets/images/logo-kreasi.png';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';
import { accountRequest } from '../../services/auth';
import { accountDestination, AuthLoading, useAuth } from './AuthProvider';
import styles from './Auth.module.css';

const emptyForm = { name: '', email: '', nisn: '', school: '', password: '' };

export function AuthPage({ register = false, registerStaff = false }) {
  const { user, loading, error: connectionError, refresh } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const student = !register && searchParams.get('mode') === 'siswa';
  const legacyEmail = student && searchParams.get('akun') === 'email';
  const usesNisn = (register && !registerStaff) || (student && !legacyEmail);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    document.title = `${register ? 'Daftar Akun' : student ? 'Login Siswa' : 'Login Guru BK & Superadmin'} — KREASI.ID`;
    setForm(emptyForm);
    setError('');
  }, [register, registerStaff, student, legacyEmail]);

  if (loading || connectionError) return <AuthLoading />;
  if (user) return <Navigate to={accountDestination(user)} replace />;
  const change = (key) => (event) => setForm((previous) => ({ ...previous, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    setError('');
    const { password } = form;
    const { name, email, nisn, school } = {
      name: form.name.trim(), email: form.email.trim().toLowerCase(), nisn: form.nisn.trim(), school: form.school.trim(),
    };
    if (usesNisn && !/^[0-9]{10}$/.test(nisn)) return setError('NISN harus terdiri dari 10 angka.');
    if (!password || (!usesNisn && !email)) return setError('Lengkapi isian untuk masuk.');
    if (register && (name.length < 2 || !school)) return setError('Isi nama minimal dua karakter dan nama sekolah.');
    setBusy(true);
    try {
      const action = register ? 'sign-up' : 'sign-in';
      const method = registerStaff ? 'bk' : usesNisn ? 'siswa' : 'email';
      const body = usesNisn ? { nisn, password } : { email, password };
      if (register) Object.assign(body, { name, school });
      await accountRequest(`/api/auth/${action}/${method}`, { method: 'POST', body });
      setForm(emptyForm);
      await refresh();
    } catch (failure) {
      setError(failure.message || 'Koneksi bermasalah. Silakan coba lagi.');
    } finally {
      setBusy(false);
    }
  }

  const AuthIcon = student || register ? GraduationCap : LockKeyhole;
  const title = registerStaff ? 'Daftar akun Guru BK' : register ? 'Daftar akun siswa' : student ? 'Masuk sebagai siswa' : 'Selamat datang kembali';
  const description = register
    ? (registerStaff ? 'Ajukan akses untuk ditinjau oleh Superadmin.' : 'Daftar untuk mengajukan akses ke KREASI.ID.')
    : student ? (legacyEmail ? 'Gunakan email akun yang sudah terdaftar.' : 'Gunakan NISN dan kata sandi akunmu.') : 'Masuk dengan akun Guru BK atau Superadmin.';

  return (
    <main className={`${styles.authShell} ${register ? styles.registerShell : styles.loginShell}`} data-student={student} data-animate={!register && animate}>
      <section className={styles.introduction} aria-label="Tentang KREASI.ID">
        <img src={logo} alt="Logo KREASI.ID" className={styles.logo} />
        <p className={styles.brand}>KREASI.ID</p>
        <p className={styles.tagline}>Kenali potensi,<br />mulai langkahmu.</p>
        <p className={styles.introDescription}>Ruang untuk mengenali minat, melatih kemampuan, dan merencanakan langkah kecilmu.</p>
        <div className={styles.introNote}><ShieldCheck aria-hidden="true" /><p>Akun diverifikasi oleh superadmin sebelum kamu mulai menjelajahi kegiatan.</p></div>
        {!register && (
          <Button
            className={styles.modeSwitch}
            variant="secondaryOnDark"
            onDark
            disabled={busy}
            aria-controls="auth-form-panel"
            onClick={() => {
              setAnimate(true);
              setSearchParams(student ? {} : { mode: 'siswa' });
            }}
          >
            {student && <ArrowLeft size={18} aria-hidden="true" />}
            {student ? 'Login Guru BK & Superadmin' : 'Login Siswa'}
            {!student && <ArrowRight size={18} aria-hidden="true" />}
          </Button>
        )}
      </section>
      <section id="auth-form-panel" className={styles.formSlot} aria-labelledby="auth-heading">
        <div className={styles.formPanel}>
          <AuthIcon className={styles.authIcon} size={28} aria-hidden="true" />
          <h1 id="auth-heading" aria-live="polite">{title}</h1>
          <p className={styles.muted}>{description}</p>
          <form onSubmit={submit} className={styles.form}>
            {register && <FormField id="name" name="name" label="Nama" required autoComplete="name" maxLength={100} value={form.name} onChange={change('name')} />}
            {usesNisn ? (
              <FormField id="nisn" name="nisn" label="NISN" required inputMode="numeric" autoComplete="username" pattern="[0-9]{10}" maxLength={10} helperText={register ? 'Masukkan 10 angka NISN.' : undefined} value={form.nisn} onChange={change('nisn')} />
            ) : (
              <FormField id="email" name="email" label="Email" required type="email" autoComplete="username" autoCapitalize="none" maxLength={254} value={form.email} onChange={change('email')} />
            )}
            {register && <FormField id="school" name="school" label="Sekolah" required maxLength={150} value={form.school} onChange={change('school')} />}
            <FormField id="password" name="password" label="Kata sandi" required type="password" autoComplete={register ? 'new-password' : 'current-password'} minLength={register ? 12 : undefined} maxLength={128} helperText={register ? 'Gunakan minimal 12 karakter.' : undefined} value={form.password} onChange={change('password')} />
            {register && !registerStaff && <p className={styles.privacy}>Nama, NISN, dan sekolah digunakan untuk verifikasi akun. Kamu dapat memilih jawaban yang ingin dibagikan kepada staf melalui menu Rekap Jawaban.</p>}
            {error && <p className={styles.error} role="alert">{error}</p>}
            <Button type="submit" fullWidth disabled={busy}>{busy ? 'Memproses…' : register ? 'Daftar Akun' : 'Masuk'}<ArrowRight size={18} aria-hidden="true" /></Button>
          </form>
          {register && <p className={styles.switchLink}>Sudah punya akun? {registerStaff ? <Link to="/login">Login Guru BK</Link> : <Link to="/login?mode=siswa">Login Siswa</Link>}</p>}
          {!register && !student && <p className={styles.switchLink}><Link to="/daftar-bk">Daftar akun Guru BK</Link></p>}
          {student && <p className={styles.switchLink}>Belum punya akun? <Link to="/daftar">Daftar sekarang</Link></p>}
          {student && <p className={styles.switchLink}><Link to={legacyEmail ? '?mode=siswa' : '?mode=siswa&akun=email'}>{legacyEmail ? 'Masuk dengan NISN' : 'Masuk dengan email akun lama'}</Link></p>}
          <p className={styles.switchLink}><Link to="/">Kembali ke Beranda</Link></p>
        </div>
      </section>
    </main>
  );
}
