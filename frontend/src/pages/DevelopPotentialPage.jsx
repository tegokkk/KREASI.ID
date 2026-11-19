import { useState } from 'react';
import { useNavigate } from 'react-router';
import { PageLayout } from '../components/layout/PageLayout';
import { ActivityNavigation } from '../components/navigation/ActivityNavigation';
import { StepIndicator } from '../components/navigation/StepIndicator';
import { MENGEMBANGKAN_POTENSI_DATA } from '../content/learning-materials';
import { useJourney } from '../features/journey/JourneyProvider';
import styles from './ActivityPage.module.css';

export function DevelopPotentialPage() {
  const navigate = useNavigate();
  const { journey, stepsById, savingStepId, completeStep } = useJourney();
  const [saveError, setSaveError] = useState('');

  const { intro, benefits, pillars, examplesTitle, examplesLead, examples } =
    MENGEMBANGKAN_POTENSI_DATA;
  const currentStep = stepsById['mengembangkan-potensi'];

  async function handleComplete() {
    setSaveError('');
    const result = await completeStep('mengembangkan-potensi');
    if (result.ok) {
      navigate('/kuis');
      return;
    }
    setSaveError(result.error);
  }

  return (
    <PageLayout title="Mengembangkan Potensi — Langkah 3">
      <div className="container">
        <div className={`reading-column ${styles.pageStack}`}>
          <div className={styles.headerBlock}>
            <StepIndicator
              currentStep={3}
              label="Mengembangkan Potensi"
              status={currentStep?.status}
              steps={journey?.steps}
            />
            <h1 className="page-title">Mengembangkan Potensi</h1>
            <p className="lead-text">{intro}</p>
          </div>

          <section className={styles.sectionCard} aria-labelledby="dev-benefits">
            <h2 id="dev-benefits" className="section-title">
              {benefits.title}
            </h2>
            <ul className={styles.list}>
              {benefits.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className={styles.sectionCard} aria-labelledby="dev-pillars">
            <h2 id="dev-pillars" className="section-title">
              Lima cara mengembangkan potensi
            </h2>
            <div className={styles.cardGrid}>
              {pillars.map((pillar) => (
                <article key={pillar.id} className={styles.subCard}>
                  <h3 className={styles.subTitle}>{pillar.title}</h3>
                  <p>{pillar.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.sectionCard} aria-labelledby="dev-examples">
            <h2 id="dev-examples" className="section-title">
              {examplesTitle}
            </h2>
            <p className="supporting-text">{examplesLead}</p>

            <div className={styles.cardGrid}>
              {examples.map((example) => (
                <article
                  key={example.id}
                  className={[
                    styles.subCard,
                    example.color === 'blue' ? styles.subCardBlue : styles.subCardGreen,
                  ].join(' ')}
                >
                  <span className="supporting-text">
                    <strong>{example.badge}</strong>
                  </span>
                  <h3 className={styles.subTitle}>{example.kegiatan}</h3>
                  <div className={styles.exampleBox}>
                    <p>
                      <strong>Langkah pertama:</strong> {example.langkahPertama}
                    </p>
                  </div>
                  <div className={styles.exampleBox}>
                    <p>
                      <strong>Hambatan yang mungkin muncul:</strong> {example.hambatan}
                    </p>
                  </div>
                  <div className={styles.exampleBox}>
                    <p>
                      <strong>Pilihan dukungan:</strong> {example.dukungan}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <ActivityNavigation
            prev={{ to: '/kenali-potensi', label: 'Sebelumnya: Kenali Potensi' }}
            next={{
              label: 'Selesai Membaca & Lanjut ke Kuis',
              loading: savingStepId === 'mengembangkan-potensi',
              onClick: handleComplete,
            }}
            error={saveError}
            onRetry={handleComplete}
          />
        </div>
      </div>
    </PageLayout>
  );
}
