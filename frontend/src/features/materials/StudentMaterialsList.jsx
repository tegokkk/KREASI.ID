import { useEffect, useState } from 'react';
import { BookOpen, ChevronDown, ExternalLink } from 'lucide-react';
import { listMaterials, MATERIAL_CATEGORY_LABELS } from '../../services/materials';
import styles from './Materials.module.css';

const dateFormat = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' });
const ROLE_LABELS = {
  superadmin: 'Superadmin',
  admin: 'Admin',
  bk: 'Guru BK',
};

export function StudentMaterialsList({
  category = '',
  heading = 'Materi dari Guru BK & Sekolah',
  lead = 'Materi tambahan yang disiapkan khusus untuk membantumu mengenali dan mengembangkan potensi.',
  collapsible = false,
}) {
  const [materials, setMaterials] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    listMaterials({ category, signal: controller.signal })
      .then((items) => {
        if (!controller.signal.aborted) {
          setMaterials(items);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setMaterials([]);
          setLoaded(true);
        }
      });
    return () => controller.abort();
  }, [category]);

  if (!loaded || materials.length === 0) return null;

  const headingId = `student-materials-${category || 'all'}`;

  return (
    <section className={styles.studentSection} aria-labelledby={headingId}>
      <div className={styles.studentSectionHeader}>
        <span className={styles.studentEyebrow}>
          <BookOpen size={14} aria-hidden="true" />
          <span>Materi Guru BK & Sekolah ({materials.length})</span>
        </span>
        <h2 id={headingId} className="section-title">
          {heading}
        </h2>
        <p className="supporting-text">{lead}</p>
      </div>

      <ul className={styles.materialList}>
        {materials.map((item) => (
          <li key={item.id}>
            {collapsible ? (
              <details className={styles.studentDetails}>
                <summary className={styles.studentDetailsSummary}>
                  <div>
                    <div className={styles.badgeRow} style={{ marginBottom: '6px' }}>
                      <span className={styles.categoryBadge}>
                        {MATERIAL_CATEGORY_LABELS[item.category] || item.category}
                      </span>
                      <span className={styles.scopeBadge}>
                        {ROLE_LABELS[item.authorRole] || item.authorRole}
                        {item.school ? ` · ${item.school}` : ''}
                      </span>
                    </div>
                    <span>{item.title}</span>
                  </div>
                  <ChevronDown size={18} aria-hidden="true" />
                </summary>
                <div className={styles.studentDetailsBody}>
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
                    Ditambahkan oleh <strong>{item.authorName}</strong> ·{' '}
                    <time dateTime={item.createdAt}>
                      {dateFormat.format(new Date(item.createdAt))}
                    </time>
                  </p>
                </div>
              </details>
            ) : (
              <article className={styles.studentMaterialCard}>
                <div className={styles.badgeRow}>
                  <span className={styles.categoryBadge}>
                    {ROLE_LABELS[item.authorRole] || item.authorRole}
                  </span>
                  {item.school && <span className={styles.scopeBadge}>{item.school}</span>}
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
                  Ditambahkan oleh <strong>{item.authorName}</strong> ·{' '}
                  <time dateTime={item.createdAt}>
                    {dateFormat.format(new Date(item.createdAt))}
                  </time>
                </p>
              </article>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
