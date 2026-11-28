import { useEffect, useState } from 'react';
import { BookOpen, ExternalLink, PlusCircle, RefreshCw, Trash2 } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Button } from '../../components/ui/Button';
import { InfoPanel } from '../../components/ui/InfoPanel';
import {
  createMaterial,
  deleteMaterial,
  listMaterials,
  MATERIAL_CATEGORIES,
  MATERIAL_CATEGORY_LABELS,
} from '../../services/materials';
import { useAuth } from '../auth/AuthProvider';
import { StaffDashboardLayout } from '../auth/StaffDashboardNav';
import styles from './Materials.module.css';

const dateFormat = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
const ROLE_LABELS = {
  superadmin: 'Superadmin',
  admin: 'Admin',
  bk: 'Guru BK',
};

export function ManageMaterialsPage() {
  const { user } = useAuth();
  const isBk = user?.role === 'bk';

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [revision, setRevision] = useState(0);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('kenali-potensi');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [school, setSchool] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [deletingId, setDeletingId] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError('');
    listMaterials({ scope: 'manage', signal: controller.signal })
      .then((items) => {
        if (!controller.signal.aborted) {
          setMaterials(items);
          setLoading(false);
        }
      })
      .catch((failure) => {
        if (!controller.signal.aborted) {
          setLoadError(failure.message || 'Daftar materi belum dapat dimuat.');
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [revision]);

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');
    setStatusMessage('');

    if (!title.trim()) {
      setFormError('Judul materi wajib diisi.');
      return;
    }
    if (!content.trim()) {
      setFormError('Isi materi wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await createMaterial({
        title: title.trim(),
        category,
        summary: summary.trim(),
        content: content.trim(),
        resourceUrl: resourceUrl.trim(),
        school: isBk ? user.school : school.trim(),
      });
      setMaterials((prev) => [created, ...prev]);
      setTitle('');
      setSummary('');
      setContent('');
      setResourceUrl('');
      setSchool('');
      setStatusMessage(`Materi "${created.title}" berhasil ditambahkan dan langsung tampil di akun siswa.`);
    } catch (failure) {
      setFormError(failure.message || 'Materi belum berhasil disimpan.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(item) {
    setFormError('');
    setStatusMessage('');
    setDeletingId(item.id);
    try {
      await deleteMaterial(item.id);
      setMaterials((prev) => prev.filter((entry) => entry.id !== item.id));
      setStatusMessage(`Materi "${item.title}" berhasil dihapus.`);
    } catch (failure) {
      setFormError(failure.message || 'Materi belum berhasil dihapus.');
    } finally {
      setDeletingId('');
    }
  }

  return (
    <StaffDashboardLayout
      title="Kelola Materi"
      heading="Kelola Materi Siswa"
      description={
        isBk
          ? `Tambahkan materi pembelajaran khusus untuk siswa ${user.school}. Materi yang ditambahkan otomatis muncul di halaman siswa.`
          : 'Tambahkan materi pembelajaran untuk semua sekolah atau sekolah tertentu. Materi yang disimpan otomatis muncul di akun siswa.'
      }
      current="materials"
      headerActions={
        <Button
          size="sm"
          variant="secondary"
          type="button"
          onClick={() => setRevision((value) => value + 1)}
        >
          <RefreshCw size={16} aria-hidden="true" /> Muat ulang
        </Button>
      }
    >
      {statusMessage && (
            <InfoPanel tone="mint" icon="check" title="Berhasil" role="status">
              <p>{statusMessage}</p>
            </InfoPanel>
          )}

          {formError && (
            <InfoPanel tone="error" icon="warning" title="Periksa isian materi" role="alert">
              <p>{formError}</p>
            </InfoPanel>
          )}

          <section className={styles.formCard} aria-labelledby="add-material-heading">
            <div className={styles.sectionHeader}>
              <h2 id="add-material-heading" className="section-title">
                Tambah Materi Baru
              </h2>
              <p className="supporting-text">
                Materi akan tampil di Dashboard Siswa dan di halaman kegiatan sesuai penempatan yang
                dipilih.
              </p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="material-title">
                  Judul Materi <span aria-hidden="true">*</span>
                </label>
                <input
                  id="material-title"
                  type="text"
                  className={styles.input}
                  maxLength={160}
                  required
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Contoh: Cara Menemukan Bakat dari Kegiatan Ekstrakurikuler"
                />
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="material-category">
                    Penempatan Materi <span aria-hidden="true">*</span>
                  </label>
                  <select
                    id="material-category"
                    className={styles.select}
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                  >
                    {MATERIAL_CATEGORIES.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="material-school">
                    Sasaran Sekolah
                  </label>
                  {isBk ? (
                    <input
                      id="material-school"
                      type="text"
                      className={styles.input}
                      value={user.school || ''}
                      disabled
                    />
                  ) : (
                    <input
                      id="material-school"
                      type="text"
                      className={styles.input}
                      maxLength={150}
                      value={school}
                      onChange={(event) => setSchool(event.target.value)}
                      placeholder="Kosongkan untuk semua sekolah"
                    />
                  )}
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="material-summary">
                  Ringkasan Singkat (opsional)
                </label>
                <input
                  id="material-summary"
                  type="text"
                  className={styles.input}
                  maxLength={300}
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  placeholder="Ringkasan 1-2 kalimat yang menjelaskan inti materi"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="material-content">
                  Isi Materi <span aria-hidden="true">*</span>
                </label>
                <textarea
                  id="material-content"
                  className={styles.textarea}
                  rows={6}
                  maxLength={8000}
                  required
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Tuliskan penjelasan materi, langkah praktis, atau tips yang mudah dipahami siswa SMP..."
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="material-url">
                  Tautan Referensi / Video / PDF (opsional)
                </label>
                <input
                  id="material-url"
                  type="url"
                  className={styles.input}
                  maxLength={500}
                  value={resourceUrl}
                  onChange={(event) => setResourceUrl(event.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className={styles.formActions}>
                <Button type="submit" variant="primary" disabled={submitting}>
                  <PlusCircle size={18} aria-hidden="true" />
                  <span>{submitting ? 'Menyimpan Materi…' : 'Publikasikan Materi'}</span>
                </Button>
              </div>
            </form>
          </section>

          <section className={styles.listSection} aria-labelledby="material-list-heading">
            <div className={styles.listHeader}>
              <h2 id="material-list-heading" className="section-title">
                Daftar Materi Terpublikasi ({materials.length})
              </h2>
            </div>

            {loadError && (
              <InfoPanel tone="error" icon="warning" title="Gagal memuat materi">
                <p>{loadError}</p>
              </InfoPanel>
            )}

            {loading ? (
              <p role="status">Memuat daftar materi…</p>
            ) : materials.length === 0 ? (
              <InfoPanel tone="blue" icon="info" title="Belum ada materi tambahan">
                <p>
                  Gunakan formulir di atas untuk menambahkan materi pertama. Materi akan langsung
                  tampil di akun siswa sesuai sasaran sekolah.
                </p>
              </InfoPanel>
            ) : (
              <ul className={styles.materialList}>
                {materials.map((item) => (
                  <li key={item.id} className={styles.materialCard}>
                    <div className={styles.materialTop}>
                      <div className={styles.badgeRow}>
                        <span className={styles.categoryBadge}>
                          <BookOpen size={14} aria-hidden="true" />
                          <span>{MATERIAL_CATEGORY_LABELS[item.category] || item.category}</span>
                        </span>
                        <span className={styles.scopeBadge}>
                          {item.school ? `Sekolah: ${item.school}` : 'Semua Sekolah'}
                        </span>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={deletingId === item.id}
                        onClick={() => handleDelete(item)}
                      >
                        <Trash2 size={15} aria-hidden="true" />
                        <span>{deletingId === item.id ? 'Menghapus…' : 'Hapus'}</span>
                      </Button>
                    </div>

                    <h3 className={styles.materialTitle}>{item.title}</h3>
                    {item.summary && <p className={styles.materialSummary}>{item.summary}</p>}

                    <div className={styles.materialBody}>
                      {item.content.split(/\n+/).map((paragraph, idx) => (
                        <p key={idx}>{paragraph}</p>
                      ))}
                    </div>

                    {item.resourceUrl && (
                      <div className={styles.resourceLinkRow}>
                        <a
                          href={item.resourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.resourceLink}
                        >
                          <span>Buka tautan pendukung</span>
                          <ExternalLink size={15} aria-hidden="true" />
                        </a>
                      </div>
                    )}

                    <p className={styles.metaText}>
                      Ditambahkan oleh <strong>{item.authorName}</strong> (
                      {ROLE_LABELS[item.authorRole] || item.authorRole}) ·{' '}
                      <time dateTime={item.createdAt}>
                        {dateFormat.format(new Date(item.createdAt))}
                      </time>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
    </StaffDashboardLayout>
  );
}
