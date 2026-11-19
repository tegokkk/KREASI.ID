import { Route, Routes } from 'react-router';
import { AboutPage } from './pages/AboutPage';
import { ActionPlanPage } from './pages/ActionPlanPage';
import { ContactPage } from './pages/ContactPage';
import { DevelopPotentialPage } from './pages/DevelopPotentialPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { QuizPage } from './pages/QuizPage';
import { RecognizePotentialPage } from './pages/RecognizePotentialPage';
import { ReflectionPage } from './pages/ReflectionPage';
import { SelfCheckPage } from './pages/SelfCheckPage';
import { TipsPage } from './pages/TipsPage';
import { AuthProvider, RequireAccount } from './features/auth/AuthProvider';
import { AuthPage } from './features/auth/AuthPage';
import { VerificationPage } from './features/auth/VerificationPage';
import { SuperadminPage } from './features/auth/SuperadminPage';
import { JourneyProvider } from './features/journey/JourneyProvider';
import { RequireStepAccess } from './features/journey/RequireStepAccess';

export function App() {
  return (
    <AuthProvider>
      <JourneyProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tentang" element={<AboutPage />} />
          <Route path="/tips" element={<TipsPage />} />
          <Route path="/kontak" element={<ContactPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/daftar" element={<AuthPage register />} />
          <Route path="/verifikasi" element={<VerificationPage />} />
          <Route element={<RequireAccount superadmin />}>
            <Route path="/superadmin" element={<SuperadminPage />} />
          </Route>
          <Route element={<RequireAccount />}>
            <Route
              path="/self-check"
              element={
                <RequireStepAccess stepId="self-check">
                  <SelfCheckPage />
                </RequireStepAccess>
              }
            />
            <Route
              path="/kenali-potensi"
              element={
                <RequireStepAccess stepId="kenali-potensi">
                  <RecognizePotentialPage />
                </RequireStepAccess>
              }
            />
            <Route
              path="/mengembangkan-potensi"
              element={
                <RequireStepAccess stepId="mengembangkan-potensi">
                  <DevelopPotentialPage />
                </RequireStepAccess>
              }
            />
            <Route
              path="/kuis"
              element={
                <RequireStepAccess stepId="kuis">
                  <QuizPage />
                </RequireStepAccess>
              }
            />
            <Route
              path="/refleksi"
              element={
                <RequireStepAccess stepId="refleksi">
                  <ReflectionPage />
                </RequireStepAccess>
              }
            />
            <Route
              path="/action-plan"
              element={
                <RequireStepAccess stepId="action-plan">
                  <ActionPlanPage />
                </RequireStepAccess>
              }
            />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </JourneyProvider>
    </AuthProvider>
  );
}
