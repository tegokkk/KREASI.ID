import { useState } from 'react';
import { useNavigate } from 'react-router';
import { PageLayout } from '../components/layout/PageLayout';
import { ActivityNavigation } from '../components/navigation/ActivityNavigation';
import { StepIndicator } from '../components/navigation/StepIndicator';
import { InfoPanel } from '../components/ui/InfoPanel';
import { KENALI_POTENSI_DATA } from '../content/learning-materials';
import { useJourney } from '../features/journey/JourneyProvider';
import { StudentMaterialsList } from '../features/materials/StudentMaterialsList';
import styles from './ActivityPage.module.css';

const TERM_COLOR_CLASS = {
  blue: styles.subCardBlue,
  yellow: styles.subCardYellow,
  green: styles.subCardGreen,
  lilac: styles.subCardLilac,
};

export function RecognizePotentialPage() {
  const navigate = useNavigate();
  const { journey, stepsById, savingStepId, completeStep } = useJourney();
  const [saveError, setSaveError] = useState('');

  const { whatIsPotential, fourTerms, varieties, howToRecognize, whyStartNow } =
    KENALI_POTENSI_DATA;
  const currentStep = stepsById['kenali-potensi'];

  async function handleComplete() {
    setSaveError('');
    const result = await completeStep('kenali-potensi');
    if (result.ok) {
      navigate('/mengembangkan-potensi');
      return;
    }
    setSaveError(result.error);
  }

  return (
    <PageLayout title="Kenali Potensi — Langkah 2">
      <div className="container">
        <div className={`reading-column ${styles.pageStack}`}>
          <div className={styles.headerBlock}>
            <StepIndicator
              currentStep={2}
              label="Kenali Potensi"
              status={currentStep?.status}
              steps={journey?.steps}
            />
            <h1 className="page-title">Kenali Potensi</h1>
            <p className="lead-text">{KENALI_POTENSI_DATA.intro}</p>
          </div>

          <section className={styles.sectionCard} aria-labelledby="topic-what-is-potential">
            <h2 id="topic-what-is-potential" className="section-title">
              {whatIsPotential.title}
            </h2>
            {whatIsPotential.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <InfoPanel tone="blue" icon="info" title="Pertanyaan pemantik">
              <p>{whatIsPotential.prompt}</p>
            </InfoPanel>
          </section>

          <section className={styles.sectionCard} aria-labelledby="topic-four-terms">
            <h2 id="topic-four-terms" className="section-title">
              {fourTerms.title}
            </h2>
            <p className="supporting-text">{fourTerms.subtitle}</p>
            <div className={`${styles.cardGrid} ${styles.cardGridTwo}`}>
              {fourTerms.items.map((item) => (
                <article
                  key={item.term}
                  className={[styles.subCard, TERM_COLOR_CLASS[item.color] || ''].join(' ')}
                >
                  <h3 className={styles.subTitle}>{item.term}</h3>
                  <p>{item.definition}</p>
                  <p className={styles.exampleBox}>
                    <strong>Contoh:</strong> {item.example}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.sectionCard} aria-labelledby="topic-varieties">
            <h2 id="topic-varieties" className="section-title">
              {varieties.title}
            </h2>
            <p className="supporting-text">{varieties.subtitle}</p>
            <div className={`${styles.cardGrid} ${styles.cardGridTwo}`}>
              {varieties.groups.map((group) => (
                <article key={group.category} className={styles.subCard}>
                  <h3 className={styles.subTitle}>{group.category}</h3>
                  <p>{group.description}</p>
                  <ul className={styles.list}>
                    {group.examples.map((ex) => (
                      <li key={ex}>{ex}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.sectionCard} aria-labelledby="topic-how-to-recognize">
            <h2 id="topic-how-to-recognize" className="section-title">
              {howToRecognize.title}
            </h2>
            <ol className={styles.list}>
              {howToRecognize.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>

            <div className={styles.highlightPanel}>
              <h3 className={styles.subTitle}>{howToRecognize.highlightTitle}</h3>
              <p>
                <strong>{howToRecognize.highlightText}</strong>
              </p>
              <p>{howToRecognize.highlightNote}</p>
            </div>
          </section>

          <section className={styles.sectionCard} aria-labelledby="topic-why-start-now">
            <h2 id="topic-why-start-now" className="section-title">
              {whyStartNow.title}
            </h2>
            <div className={styles.cardGrid}>
              {whyStartNow.reasons.map((reason) => (
                <article key={reason.title} className={styles.subCard}>
                  <h3 className={styles.subTitle}>{reason.title}</h3>
                  <p>{reason.description}</p>
                </article>
              ))}
            </div>
            <InfoPanel tone="mint" icon="info" title="Coba pikirkan sebentar">
              <p>{whyStartNow.reflectionPrompt}</p>
            </InfoPanel>
          </section>

          <StudentMaterialsList
            category="kenali-potensi"
            heading="Materi Tambahan: Kenali Potensi"
            lead="Materi tambahan dari Guru BK atau pengelola sekolah untuk memperdalam pemahamanmu."
          />

          <ActivityNavigation
            prev={{ to: '/self-check', label: 'Sebelumnya: Self-check' }}
            next={{
              label: 'Selesai Membaca & Lanjut ke Mengembangkan Potensi',
              loading: savingStepId === 'kenali-potensi',
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
