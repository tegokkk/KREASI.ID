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
import { AuthProvider, RequireAccount, STAFF_ROLES, HISTORY_ROLES } from './features/auth/AuthProvider';
import { AuthPage } from './features/auth/AuthPage';
import { VerificationPage } from './features/auth/VerificationPage';
import { SuperadminPage } from './features/auth/SuperadminPage';
import { StudentHistoryPage } from './features/auth/StudentHistoryPage';
import { StaffRecapPage } from './features/auth/StaffRecapPage';
import { ManageMaterialsPage } from './features/materials/ManageMaterialsPage';
import { StudentRecapPage } from './features/journey/StudentRecapPage';
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
          <Route path="/daftar-bk" element={<AuthPage register registerStaff />} />
          <Route path="/verifikasi" element={<VerificationPage />} />
          <Route element={<RequireAccount roles={['superadmin']} />}>
            <Route path="/superadmin" element={<SuperadminPage />} />
          </Route>
          <Route element={<RequireAccount roles={HISTORY_ROLES} />}>
            <Route path="/riwayat-siswa" element={<StudentHistoryPage />} />
          </Route>
          <Route element={<RequireAccount roles={STAFF_ROLES} />}>
            <Route path="/rekap-siswa" element={<StudentHistoryPage key="recaps" recaps />} />
            <Route path="/rekap-siswa/:studentId" element={<StaffRecapPage />} />
            <Route path="/kelola-materi" element={<ManageMaterialsPage />} />
          </Route>
          <Route element={<RequireAccount roles={['user']} />}>
            <Route path="/rekap" element={<StudentRecapPage />} />
          </Route>
          <Route element={<RequireAccount roles={['user', 'superadmin']} />}>
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
