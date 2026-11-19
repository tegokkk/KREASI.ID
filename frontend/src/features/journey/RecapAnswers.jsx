import { ACTIVITIES } from '../../content/activities';
import styles from '../auth/Superadmin.module.css';

export function RecapAnswers({ answers, selected, onSelect }) {
  return ACTIVITIES.map((activity) => {
    const section = answers.find(({ id }) => id === activity.id);
    return (
      <section className={styles.userCard} key={activity.id} aria-label={activity.title}>
        <h2 className={styles.cardName}>{activity.step}. {activity.title}</h2>
        {section ? (
          <>
            {onSelect && (
              <label className={styles.recapCheck}>
                <input type="checkbox" checked={selected.includes(activity.id)} onChange={(event) => onSelect(activity.id, event.target.checked)} />
                Bagikan {activity.title}
              </label>
            )}
            <dl className={styles.recapAnswers}>
              {section.answers.map(({ question, answer }, index) => (
                <div key={index}><dt>{question}</dt><dd>{answer}</dd></div>
              ))}
            </dl>
          </>
        ) : (
          <p className="supporting-text">{activity.id === 'kenali-potensi' || activity.id === 'mengembangkan-potensi' ? 'Langkah membaca materi.' : 'Belum ada jawaban di rekap untuk langkah ini.'}</p>
        )}
      </section>
    );
  });
}
