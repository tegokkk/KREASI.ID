import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Loader2,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';
import { InfoPanel } from '../../components/ui/InfoPanel';
import { accountRequest } from '../../services/auth';
import { StaffDashboardNav } from './StaffDashboardNav';
import styles from './Superadmin.module.css';

const STATUS_META = [
  {
    value: 'pending',
    label: 'Menunggu Verifikasi',
    summaryLabel: 'Menunggu Verifikasi',
    emptyMessage: 'Tidak ada akun yang menunggu verifikasi saat ini.',
    tone: 'yellow',
    Icon: Clock3,
  },
  {
    value: 'approved',
    label: 'Disetujui',
    summaryLabel: 'Disetujui',
    emptyMessage: 'Belum ada akun yang disetujui.',
    tone: 'success',
    Icon: CheckCircle2,
  },
  {
    value: 'rejected',
    label: 'Ditolak',
    summaryLabel: 'Ditolak',
    emptyMessage: 'Belum ada akun yang ditolak.',
    tone: 'error',
    Icon: XCircle,
  },
];

const STATUS_BY_KEY = Object.fromEntries(STATUS_META.map((item) => [item.value, item]));

function useDesktopLayout() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : true
  );

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const onChange = (event) => setIsDesktop(event.matches);
    setIsDesktop(mediaQuery.matches);
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', onChange);
      return () => mediaQuery.removeEventListener('change', onChange);
    }
    mediaQuery.addListener(onChange);
    return () => mediaQuery.removeListener(onChange);
  }, []);

  return isDesktop;
}

function formatRegistrationDate(createdAt) {
  return new Date(createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' });
}

function accountIdentifier(user) {
  return user.nisn ? `NISN ${user.nisn}` : user.email;
}

function StatusBadge({ status }) {
  const meta = STATUS_BY_KEY[status] || STATUS_BY_KEY.pending;
  const Icon = meta.Icon;
  return (
    <span className={`${styles.statusBadge} ${styles[`badge_${status}`] || styles.badge_pending}`}>
      <Icon size={15} aria-hidden="true" />
      <span>{meta.label}</span>
    </span>
  );
}

function ReviewPanel({
  review,
  note,
  busy,
  onNoteChange,
  onSubmit,
  onCancel,
  noteInputRef,
}) {
  const isApprove = review.decision === 'approved';
  const actionTitle = isApprove ? 'Setujui akun ini?' : 'Tolak pengajuan akun ini?';

  function handleKeyDown(event) {
    if (event.key === 'Escape' && !busy) {
      event.preventDefault();
      onCancel();
    }
  }

  return (
    <form
      className={`${styles.reviewForm} ${isApprove ? styles.reviewApprove : styles.reviewReject}`}
      onSubmit={onSubmit}
      onKeyDown={handleKeyDown}
      aria-labelledby="review-title"
    >
      <div className={styles.reviewHeader}>
        <div className={styles.reviewMeta}>
          <span className={isApprove ? styles.decisionTagApprove : styles.decisionTagReject}>
            {isApprove ? 'Keputusan: Setujui' : 'Keputusan: Tolak'}
          </span>
          <h2 id="review-title" className={styles.reviewTitle}>
            {actionTitle}
          </h2>
          <p className={styles.reviewIdentity}>
            <strong>{review.user.name}</strong> ·{' '}
            <span className={styles.email}>{accountIdentifier(review.user)}</span>
            {review.user.school && <> · {review.user.school}</>}
          </p>
        </div>
      </div>

      <FormField
        ref={noteInputRef}
        id="review-note"
        label="Catatan untuk pengguna"
        optionalLabel="Opsional"
        multiline
        rows={3}
        maxLength={500}
        disabled={busy}
        value={note}
        onChange={(event) => onNoteChange(event.target.value)}
        placeholder={
          isApprove
            ? 'Contoh: Akun sudah aktif, silakan mulai kegiatan Self-check.'
            : 'Contoh: Gunakan nama lengkap siswa atau hubungi guru BK sekolah.'
        }
        helperText={`Maksimal 500 karakter (${note.length}/500). Catatan ini dapat dibaca pengguna.`}
      />

      <div className={styles.reviewActions}>
        <Button type="submit" variant={isApprove ? 'primary' : 'danger'} disabled={busy}>
          {busy ? (
            <>
              <Loader2 size={18} aria-hidden="true" className={styles.spinner} />
              <span>Menyimpan keputusan…</span>
            </>
          ) : (
            <span>{isApprove ? 'Konfirmasi Persetujuan' : 'Konfirmasi Penolakan'}</span>
          )}
        </Button>

        <Button type="button" variant="secondary" disabled={busy} onClick={onCancel}>
          Batal
        </Button>
      </div>
    </form>
  );
}

export function SuperadminPage() {
  const isDesktop = useDesktopLayout();
  const [status, setStatus] = useState('pending');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({
    users: [],
    total: 0,
    counts: null,
    page: 1,
    pageSize: 20,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [review, setReview] = useState(null);
  const [note, setNote] = useState('');

  const sequence = useRef(0);
  const noteInputRef = useRef(null);
  const triggerButtonRef = useRef(null);

  const load = useCallback(async (targetStatus = status, targetPage = page) => {
    const id = ++sequence.current;
    setLoading(true);
    setError('');
    try {
      const result = await accountRequest(
        `/api/admin/users?status=${encodeURIComponent(targetStatus)}&page=${targetPage}`
      );
      if (id !== sequence.current) return;
      const nextPage = result.page ?? targetPage;
      const nextPageSize = result.pageSize ?? 20;
      const nextTotal = result.total ?? 0;
      const nextTotalPages =
        result.totalPages ?? Math.max(1, Math.ceil(nextTotal / nextPageSize));
      setData({
        users: result.users ?? [],
        total: nextTotal,
        counts: result.counts ?? null,
        page: nextPage,
        pageSize: nextPageSize,
        totalPages: nextTotalPages,
      });
      if (nextPage !== targetPage) {
        setPage(nextPage);
      }
    } catch (failure) {
      if (id === sequence.current) {
        setError(failure.message || 'Gagal memuat daftar akun.');
      }
    } finally {
      if (id === sequence.current) {
        setLoading(false);
      }
    }
  }, [status, page]);

  useEffect(() => {
    load(status, page);
    return () => {
      sequence.current += 1;
    };
  }, [load, status, page]);

  function openReview(user, decision, triggerEl) {
    triggerButtonRef.current = triggerEl || null;
    setError('');
    setMessage('');
    setReview({ user, decision });
    setNote('');
    requestAnimationFrame(() => {
      noteInputRef.current?.focus();
    });
  }

  function closeReview({ restoreFocus = false } = {}) {
    setReview(null);
    setNote('');
    if (restoreFocus) {
      requestAnimationFrame(() => {
        triggerButtonRef.current?.focus();
      });
    }
  }

  function handleFilterChange(nextStatus) {
    if (nextStatus === status) return;
    setStatus(nextStatus);
    setData((previous) => ({ ...previous, users: [], total: 0, page: 1, totalPages: 1 }));
    setPage(1);
    setReview(null);
    setNote('');
    setMessage('');
    setError('');
  }

  async function submitReview(event) {
    event.preventDefault();
    if (!review || busy) return;
    setBusy(true);
    setError('');
    const targetUser = review.user;
    const decision = review.decision;
    try {
      const result = await accountRequest(
        `/api/admin/users/${encodeURIComponent(targetUser.id)}/review`,
        {
          method: 'POST',
          body: { decision, note },
        }
      );
      if (result.counts) {
        setData((prev) => ({ ...prev, counts: result.counts }));
      }
      setMessage(
        `Akun ${targetUser.name} (${accountIdentifier(targetUser)}) ${
          decision === 'approved' ? 'telah disetujui' : 'telah ditolak'
        }.`
      );
      closeReview();
      await load(status, page);
    } catch (failure) {
      closeReview();
      await load(status, page);
      setError(failure.message || 'Keputusan gagal disimpan. Coba lagi.');
    } finally {
      setBusy(false);
    }
  }

  const counts = data.counts;
  const activeMeta = STATUS_BY_KEY[status] || STATUS_BY_KEY.pending;
  const startIndex = data.total === 0 ? 0 : (data.page - 1) * data.pageSize + 1;
  const endIndex = data.total === 0 ? 0 : startIndex + data.users.length - 1;

  return (
    <PageLayout title="Verifikasi Akun">
      <div className={`container ${styles.page}`}>
        <header className={styles.heading}>
          <div className={styles.headingText}>
            <span className={styles.eyebrow}>
              <ShieldCheck size={16} aria-hidden="true" />
              <span>Superadmin</span>
            </span>
            <h1 className="page-title">Verifikasi Akun</h1>
            <p className="lead-text">
              Tinjau pengajuan akun sebelum peserta didik mengakses kegiatan KREASI.ID.
            </p>
          </div>
        </header>

        <StaffDashboardNav current="accounts" />

        <section className={styles.summaryGrid} aria-label="Ringkasan jumlah akun">
          {STATUS_META.map((item) => {
            const Icon = item.Icon;
            const countValue = counts ? counts[item.value] : null;
            return (
              <article
                key={item.value}
                className={`${styles.summaryCard} ${styles[`summary_${item.tone}`]}`}
              >
                <div className={styles.summaryTop}>
                  <span className={styles.summaryLabel}>{item.summaryLabel}</span>
                  <span className={styles.summaryIcon} aria-hidden="true">
                    <Icon size={20} />
                  </span>
                </div>
                <p
                  className={styles.summaryValue}
                  data-testid={`summary-count-${item.value}`}
                >
                  {countValue === null ? '–' : countValue}
                </p>
              </article>
            );
          })}
        </section>

        <section className={styles.toolbar} aria-label="Filter dan pembaruan daftar akun">
          <div className={styles.filters} role="group" aria-label="Filter status akun">
            {STATUS_META.map((filter) => {
              const active = status === filter.value;
              const filterCount = counts ? ` (${counts[filter.value]})` : '';
              return (
                <Button
                  key={filter.value}
                  size="sm"
                  variant={active ? 'primary' : 'secondary'}
                  aria-pressed={active}
                  disabled={busy}
                  onClick={() => handleFilterChange(filter.value)}
                >
                  {filter.label}
                  {filterCount}
                </Button>
              );
            })}
          </div>

          <Button
            variant="secondary"
            size="sm"
            disabled={loading || busy}
            onClick={() => load(status, page)}
          >
            <RefreshCw size={16} aria-hidden="true" className={loading ? styles.spinner : ''} />
            <span>{loading ? 'Memuat…' : 'Muat Ulang'}</span>
          </Button>
        </section>

        {message && (
          <InfoPanel tone="success" icon="success" role="status">
            <p>{message}</p>
          </InfoPanel>
        )}

        {error && (
          <InfoPanel tone="error" icon="warning" role="alert" title="Permintaan belum berhasil">
            <p>{error}</p>
            <div className={styles.errorRetry}>
              <Button
                variant="secondary"
                size="sm"
                disabled={loading || busy}
                onClick={() => load(status, page)}
              >
                Coba Lagi
              </Button>
            </div>
          </InfoPanel>
        )}

        <section aria-label="Daftar akun" className={styles.listSection} aria-busy={loading}>
          {loading ? (
            <div className={styles.stateBox} role="status">
              <Loader2 size={24} aria-hidden="true" className={styles.spinner} />
              <p>Memuat daftar akun…</p>
            </div>
          ) : data.users.length === 0 && !error ? (
            <div className={styles.stateBox}>
              <p className={styles.emptyTitle}>{activeMeta.emptyMessage}</p>
              <p className="supporting-text">
                Gunakan filter di atas untuk melihat status akun lainnya atau tekan Muat Ulang.
              </p>
            </div>
          ) : isDesktop ? (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <colgroup>
                  <col style={{ width: '23%' }} />
                  <col style={{ width: '27%' }} />
                  <col style={{ width: '16%' }} />
                  <col style={{ width: '16%' }} />
                  <col style={{ width: '18%' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th scope="col">Nama</th>
                    <th scope="col">Identitas akun</th>
                    <th scope="col">Tanggal Daftar</th>
                    <th scope="col">Status</th>
                    <th scope="col">Tindakan</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((user) => {
                    const isReviewing = review?.user.id === user.id;
                    return (
                      <DesktopAccountRows
                        key={user.id}
                        user={user}
                        isReviewing={isReviewing}
                        review={review}
                        note={note}
                        busy={busy}
                        onOpenReview={openReview}
                        onNoteChange={setNote}
                        onSubmitReview={submitReview}
                        onCancelReview={() => closeReview({ restoreFocus: true })}
                        noteInputRef={noteInputRef}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <ul className={styles.cardList}>
              {data.users.map((user) => {
                const isReviewing = review?.user.id === user.id;
                return (
                  <li
                    key={user.id}
                    className={`${styles.userCard} ${isReviewing ? styles.userCardSelected : ''}`}
                  >
                    <div className={styles.cardHeader}>
                      <div className={styles.cardIdentity}>
                        <h2 className={styles.cardName}>{user.name}</h2>
                        <p className={styles.email}>{accountIdentifier(user)}</p>
                        {user.school && <p className={styles.email}>{user.school}</p>}
                      </div>
                      <StatusBadge status={user.status} />
                    </div>

                    <p className={styles.date}>
                      Tanggal daftar: {formatRegistrationDate(user.createdAt)}
                    </p>

                    {user.reviewNote && (
                      <p className={styles.note}>
                        <strong>Catatan:</strong> {user.reviewNote}
                      </p>
                    )}

                    <div className={styles.cardActions}>
                      {user.status === 'pending' ? (
                        <>
                          <Button
                            size="sm"
                            variant="primary"
                            disabled={busy}
                            aria-expanded={isReviewing && review.decision === 'approved'}
                            onClick={(event) => openReview(user, 'approved', event.currentTarget)}
                          >
                            Setujui
                          </Button>
                          <Button
                            size="sm"
                            variant="dangerOutline"
                            disabled={busy}
                            aria-expanded={isReviewing && review.decision === 'rejected'}
                            onClick={(event) => openReview(user, 'rejected', event.currentTarget)}
                          >
                            Tolak
                          </Button>
                        </>
                      ) : (
                        <span className="supporting-text">Sudah ditinjau</span>
                      )}
                    </div>

                    {isReviewing && (
                      <div className={styles.mobileReviewWrap}>
                        <ReviewPanel
                          review={review}
                          note={note}
                          busy={busy}
                          onNoteChange={setNote}
                          onSubmit={submitReview}
                          onCancel={() => closeReview({ restoreFocus: true })}
                          noteInputRef={noteInputRef}
                        />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <nav className={styles.pagination} aria-label="Navigasi halaman daftar akun">
          <p className={styles.rangeText}>
            {data.total === 0
              ? 'Menampilkan 0 akun'
              : `Menampilkan ${startIndex}–${endIndex} dari ${data.total} akun`}
          </p>

          <div className={styles.paginationControls}>
            <Button
              variant="secondary"
              size="sm"
              disabled={data.page <= 1 || loading || busy}
              onClick={() => {
                setReview(null);
                setPage((value) => Math.max(1, value - 1));
              }}
            >
              <ChevronLeft size={16} aria-hidden="true" />
              <span>Sebelumnya</span>
            </Button>

            <span className={styles.pageLabel}>
              Halaman {data.page} dari {data.totalPages}
            </span>

            <Button
              variant="secondary"
              size="sm"
              disabled={data.page >= data.totalPages || loading || busy}
              onClick={() => {
                setReview(null);
                setPage((value) => Math.min(data.totalPages, value + 1));
              }}
            >
              <span>Berikutnya</span>
              <ChevronRight size={16} aria-hidden="true" />
            </Button>
          </div>
        </nav>
      </div>
    </PageLayout>
  );
}

function DesktopAccountRows({
  user,
  isReviewing,
  review,
  note,
  busy,
  onOpenReview,
  onNoteChange,
  onSubmitReview,
  onCancelReview,
  noteInputRef,
}) {
  return (
    <>
      <tr className={isReviewing ? styles.rowSelected : undefined}>
        <td className={styles.cellName}>
          <div className={styles.nameValue}>{user.name}</div>
          {user.reviewNote && (
            <p className={styles.tableNote}>Catatan: {user.reviewNote}</p>
          )}
        </td>
        <td className={styles.cellEmail}>
          {accountIdentifier(user)}
          {user.school && <p className={styles.email}>{user.school}</p>}
        </td>
        <td className={styles.cellDate}>{formatRegistrationDate(user.createdAt)}</td>
        <td>
          <StatusBadge status={user.status} />
        </td>
        <td>
          {user.status === 'pending' ? (
            <div className={styles.tableActions}>
              <Button
                size="sm"
                variant="primary"
                disabled={busy}
                aria-expanded={isReviewing && review.decision === 'approved'}
                onClick={(event) => onOpenReview(user, 'approved', event.currentTarget)}
              >
                Setujui
              </Button>
              <Button
                size="sm"
                variant="dangerOutline"
                disabled={busy}
                aria-expanded={isReviewing && review.decision === 'rejected'}
                onClick={(event) => onOpenReview(user, 'rejected', event.currentTarget)}
              >
                Tolak
              </Button>
            </div>
          ) : (
            <span className="supporting-text">Sudah ditinjau</span>
          )}
        </td>
      </tr>
      {isReviewing && (
        <tr className={styles.reviewTableRow}>
          <td colSpan={5} className={styles.reviewTableCell}>
            <ReviewPanel
              review={review}
              note={note}
              busy={busy}
              onNoteChange={onNoteChange}
              onSubmit={onSubmitReview}
              onCancel={onCancelReview}
              noteInputRef={noteInputRef}
            />
          </td>
        </tr>
      )}
    </>
  );
}
