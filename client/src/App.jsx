import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import LoadingSpinner from "./components/shared/LoadingSpinner";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import PublicLayout from "./components/layout/PublicLayout";
import DashboardLayout from "./components/layout/DashboardLayout";

import Landing from "./pages/Landing/Landing";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";

// Everything past the landing page is lazy-loaded so the initial bundle
// stays small — each page's code only downloads when the user visits it.
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const Documents = lazy(() => import("./pages/Documents/Documents"));
const Upload = lazy(() => import("./pages/Upload/Upload"));
const DocumentDetails = lazy(() => import("./pages/DocumentDetails/DocumentDetails"));
const Summary = lazy(() => import("./pages/Summary/Summary"));
const SummaryDetail = lazy(() => import("./pages/SummaryDetail/SummaryDetail"));
const Chat = lazy(() => import("./pages/Chat/Chat"));
const ChatDetail = lazy(() => import("./pages/ChatDetail/ChatDetail"));
const Flashcards = lazy(() => import("./pages/Flashcards/Flashcards"));
const FlashcardsDetail = lazy(() => import("./pages/FlashcardsDetail/FlashcardsDetail"));
const Quiz = lazy(() => import("./pages/Quiz/Quiz"));
const QuizDetail = lazy(() => import("./pages/QuizDetail/QuizDetail"));
const Notes = lazy(() => import("./pages/Notes/Notes"));
const Analytics = lazy(() => import("./pages/Analytics/Analytics"));
const Profile = lazy(() => import("./pages/Profile/Profile"));
const Settings = lazy(() => import("./pages/Settings/Settings"));
const Notifications = lazy(() => import("./pages/Notifications/Notifications"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));

const PageFallback = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <ToastProvider>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Landing />} />
              </Route>

              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/documents/:id" element={<DocumentDetails />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/summary" element={<Summary />} />
                <Route path="/summary/:id" element={<SummaryDetail />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/chat/:id" element={<ChatDetail />} />
                <Route path="/flashcards" element={<Flashcards />} />
                <Route path="/flashcards/:id" element={<FlashcardsDetail />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/quiz/:id" element={<QuizDetail />} />
                <Route path="/notes" element={<Notes />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/notifications" element={<Notifications />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ToastProvider>
      </AuthProvider>
    </AppProvider>
  );
}

export default App;
