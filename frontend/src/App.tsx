import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AuthCallbackPage from './pages/auth/AuthCallbackPage';
import VerifyEmailPendingPage from './pages/auth/VerifyEmailPendingPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import UsersPage from './pages/users/UsersPage';
import CoursesPage from './pages/courses/CoursesPage';
import QuestionBanksPage from './pages/question-banks/QuestionBanksPage';
import QuestionsPage from './pages/questions/QuestionsPage';
import ExamsPage from './pages/exams/ExamsPage';
import ExamSessionsPage from './pages/exam-sessions/ExamSessionsPage';
import ExamResultsPage from './pages/exam-results/ExamResultsPage';
import AvailableExamsPage from './pages/user/AvailableExamsPage';
import MyResultsPage from './pages/user/MyResultsPage';
import TakeExamPage from './pages/user/TakeExamPage';
import ProtectedRoute from './components/ProtectedRoute';
import { authService } from './services/auth.service';

function App() {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();
  const defaultRoute = user?.role === 'ADMIN' ? '/admin' : '/';

  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to={defaultRoute} replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to={defaultRoute} replace /> : <RegisterPage />}
        />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/verify-email-pending" element={<VerifyEmailPendingPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="question-banks" element={<QuestionBanksPage />} />
          <Route path="questions" element={<QuestionsPage />} />
          <Route path="exams" element={<ExamsPage />} />
          <Route path="exam-sessions" element={<ExamSessionsPage />} />
          <Route path="exam-results" element={<ExamResultsPage />} />
        </Route>

        {/* User Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AvailableExamsPage />} />
          <Route path="my-results" element={<MyResultsPage />} />
        </Route>

        {/* Exam taking page (fullscreen, no layout) */}
        <Route
          path="/take-exam/:examId"
          element={
            <ProtectedRoute>
              <TakeExamPage />
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}


export default App;
