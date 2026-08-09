import React, { useEffect, useMemo, useState } from "react";
import {
  FiSun,
  FiMoon,
  FiFileText,
  FiEdit3,
  FiLayers,
  FiHelpCircle,
  FiMessageSquare,
  FiClock,
} from "react-icons/fi";
import PageHeader from "../../components/shared/PageHeader";
import Card from "../../components/shared/Card";
import Skeleton from "../../components/shared/Skeleton";
import { useAppContext } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { analyticsService } from "../../services/analyticsService";
import { getStudyTimeStats } from "../../utils/studyTimeTracker";
import { formatDuration } from "../../utils/formatDuration";
import { formatDate } from "../../utils/formatDate";

const StatBlock = ({ icon: Icon, label, value }) => (
  <div>
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
      <Icon size={14} />
    </span>
    <p className="mt-2 font-display text-xl font-bold text-ink dark:text-ink-dark">{value}</p>
    <p className="text-xs text-ink-muted dark:text-ink-dark-muted">{label}</p>
  </div>
);

const Profile = () => {
  const { theme, toggleTheme } = useAppContext();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const studyTime = useMemo(() => getStudyTimeStats(), []);

  useEffect(() => {
    analyticsService
      .getStats()
      .then((data) => setStats(data.stats))
      .catch(() => setStats(null))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Profile" description="Your account and preferences." />

      {/* Identity */}
      <Card className="mb-6">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-brand-secondary text-lg font-bold text-white">
            {user?.username?.slice(0, 2).toUpperCase() || "?"}
          </span>
          <div>
            <p className="font-display text-lg font-semibold text-ink dark:text-ink-dark">
              @{user?.username}
            </p>
            <p className="mt-0.5 text-sm text-ink-muted dark:text-ink-dark-muted">
              {user?.email}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4 dark:border-border-dark">
          <div>
            <p className="text-xs text-ink-faint dark:text-ink-dark-faint">Password</p>
            <p className="mt-0.5 text-sm text-ink dark:text-ink-dark">••••••••</p>
          </div>
          <div>
            <p className="text-xs text-ink-faint dark:text-ink-dark-faint">Joined</p>
            <p className="mt-0.5 text-sm text-ink dark:text-ink-dark">
              {formatDate(user?.createdAt)}
            </p>
          </div>
        </div>
      </Card>

      {/* Theme preference */}
      <Card className="mb-6">
        <h2 className="font-display text-base font-semibold text-ink dark:text-ink-dark">
          Theme preference
        </h2>
        <p className="mt-1 text-sm text-ink-muted dark:text-ink-dark-muted">
          Choose how StudyPlot looks on this device.
        </p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => theme === "dark" && toggleTheme()}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
              theme === "light"
                ? "border-transparent bg-brand-primary text-white"
                : "border-border text-ink-muted hover:text-ink dark:border-border-dark dark:text-ink-dark-muted dark:hover:text-ink-dark"
            }`}
          >
            <FiSun size={15} />
            Light
          </button>
          <button
            onClick={() => theme === "light" && toggleTheme()}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
              theme === "dark"
                ? "border-transparent bg-brand-primary text-white"
                : "border-border text-ink-muted hover:text-ink dark:border-border-dark dark:text-ink-dark-muted dark:hover:text-ink-dark"
            }`}
          >
            <FiMoon size={15} />
            Dark
          </button>
        </div>
      </Card>

      {/* Study statistics */}
      <Card>
        <h2 className="font-display text-base font-semibold text-ink dark:text-ink-dark">
          Study statistics
        </h2>

        {isLoading ? (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatBlock icon={FiFileText} label="Total PDFs" value={stats?.documentsCount ?? 0} />
            <StatBlock icon={FiEdit3} label="Total Notes" value={stats?.notesCount ?? 0} />
            <StatBlock icon={FiLayers} label="Flashcards Generated" value={stats?.flashcardsCount ?? 0} />
            <StatBlock icon={FiHelpCircle} label="Quizzes Generated" value={stats?.quizzesGeneratedCount ?? 0} />
            <StatBlock icon={FiMessageSquare} label="AI Chats" value={stats?.conversationsCount ?? 0} />
            <StatBlock icon={FiClock} label="Total Study Time" value={formatDuration(studyTime.totalSeconds)} />
          </div>
        )}
      </Card>
    </div>
  );
};

export default Profile;
