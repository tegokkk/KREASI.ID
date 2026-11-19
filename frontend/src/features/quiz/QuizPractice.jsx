import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { BACKUP_PRACTICE_QUESTIONS } from './questions';
import styles from './QuizPractice.module.css';

export function QuizPractice() {
  const [openIds, setOpenIds] = useState({});

  function toggleQuestion(id) {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  return (
    <section aria-labelledby="backup-practice-heading" className={styles.wrapper}>
      <div className={styles.header}>
        <h2 id="backup-practice-heading" className="section-title">
          Latihan cadangan
        </h2>
        <p className={styles.lead}>
          Bagian ini selalu bisa kamu buka kapan saja untuk berlatih dan mengecek pembahasan
          satu per satu, termasuk saat Google Forms tidak dapat diakses.
        </p>
      </div>

      <div className={styles.list}>
        {BACKUP_PRACTICE_QUESTIONS.map((item, idx) => {
          const isOpen = Boolean(openIds[item.id]);
          const panelId = `backup-explanation-${item.id}`;
          return (
            <article key={item.id} className={styles.card}>
              <p className={styles.topic}>
                Latihan {idx + 1} · {item.topic}
              </p>
              <h3 className={styles.question}>{item.question}</h3>
              <ul className={styles.options}>
                {item.options.map((opt) => (
                  <li key={opt}>{opt}</li>
                ))}
              </ul>

              <Button
                variant="secondary"
                size="sm"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggleQuestion(item.id)}
              >
                <span>{isOpen ? 'Tutup Pembahasan' : 'Lihat Pembahasan'}</span>
                {isOpen ? (
                  <ChevronUp size={18} aria-hidden="true" />
                ) : (
                  <ChevronDown size={18} aria-hidden="true" />
                )}
              </Button>

              {isOpen && (
                <div id={panelId} className={styles.explanation}>
                  <p>
                    <strong>{item.answerLabel}</strong> {item.explanation}
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
