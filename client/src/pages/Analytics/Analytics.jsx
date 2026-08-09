import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiClock,
  FiZap,
  FiTrendingUp,
  FiFileText,
  FiLayers,
  FiHelpCircle,
  FiEdit3,
  FiMessageSquare,
  FiBookOpen,
  FiBarChart2,
  FiAward,
  FiCalendar,
} from "react-icons/fi";
import PageHeader from "../../components/shared/PageHeader";
import Card from "../../components/shared/Card";
import EmptyState from "../../components/shared/EmptyState";
import Skeleton from "../../components/shared/Skeleton";
import { analyticsService } from "../../services/analyticsService";
import {
  getStudyTimeStats,
  getStreakStats,
  getDailyStudyLog,
} from "../../utils/studyTimeTracker";
import { formatDuration } from "../../utils/formatDuration";
import { getErrorMessage } from "../../utils/getErrorMessage";

const MOTIVATION_MESSAGES = [
  "Consistency beats intensity.",
  "One study session at a time.",
  "Keep your learning streak alive.",
  "Small daily progress adds up.",
];

const StatCard = ({ icon: Icon, label, value, sublabel }) => (
  <Card className="p-4 sm:p-5">
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-ink-muted dark:text-ink-dark-muted">
        {label}
      </span>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
        <Icon size={14} />
      </span>
    </div>
    <p className="mt-2 font-display text-2xl font-bold text-ink dark:text-ink-dark">
      {value}
    </p>
    {sublabel && (
      <p className="mt-0.5 text-xs text-ink-faint dark:text-ink-dark-faint">{sublabel}</p>
    )}
  </Card>
);

const Analytics = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const studyTime = useMemo(() => getStudyTimeStats(), []);
  const streaks = useMemo(() => getStreakStats(), []);
  const dailyLog = useMemo(() => getDailyStudyLog(7), []);
  const motivation = useMemo(
    () => MOTIVATION_MESSAGES[new Date().getDate() % MOTIVATION_MESSAGES.length],
    []
  );

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await analyticsService.getStats();
        if (isMounted) setStats(data.stats);
      } catch (err) {
        if (isMounted) {
          setError(getErrorMessage(err, "Couldn't load your analytics."));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const activityItems = stats
    ? [
        { label: "PDFs Uploaded", value: stats.documentsCount, icon: FiFileText },
        { label: "Summaries Generated", value: stats.summariesGeneratedCount, icon: FiBookOpen },
        { label: "Flashcards Generated", value: stats.flashcardsCount, icon: FiLayers },
        { label: "Quizzes Generated", value: stats.quizzesGeneratedCount, icon: FiHelpCircle },
        { label: "Notes Saved", value: stats.notesCount, icon: FiEdit3 },
        { label: "AI Conversations", value: stats.conversationsCount, icon: FiMessageSquare },
        { label: "Questions Asked", value: stats.questionsAskedCount, icon: FiZap },
      ]
    : [];

  const hasAnyActivity = activityItems.some((item) => item.value > 0);
  const hasStudyTimeData = studyTime.hasAnyData;
  const maxDailySeconds = Math.max(...dailyLog.map((d) => d.seconds), 1);

  const insights = [];
  if (stats) {
    if (studyTime.todaySeconds >= 60) {
      insights.push(`You studied for ${formatDuration(studyTime.todaySeconds)} today.`);
    }
    if (streaks.currentStreak > 0) {
      insights.push(
        `You're on a ${streaks.currentStreak}-day learning streak.`
      );
    }
    if (stats.flashcardsCount > 0) {
      insights.push(`You've generated ${stats.flashcardsCount} flashcards.`);
    }
    if (stats.quizzesGeneratedCount > 0) {
      insights.push(
        `You've generated ${stats.quizzesGeneratedCount} ${
          stats.quizzesGeneratedCount === 1 ? "quiz" : "quizzes"
        }.`
      );
    }
    if (stats.summariesGeneratedCount > 0) {
      insights.push(
        `You've generated ${stats.summariesGeneratedCount} ${
          stats.summariesGeneratedCount === 1 ? "summary" : "summaries"
        }.`
      );
    }
    if (stats.questionsAskedCount > 0) {
      insights.push(
        `You've asked Gemini ${stats.questionsAskedCount} ${
          stats.questionsAskedCount === 1 ? "question" : "questions"
        }.`
      );
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Analytics"
        description="Your real study activity — no fabricated numbers."
      />

      {/* Motivation widget */}
      <Card className="mb-6 flex items-center gap-3 py-3.5">
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
          <FiAward size={15} />
        </span>
        <p className="text-sm font-medium text-ink dark:text-ink-dark">{motivation}</p>
      </Card>

      {/* Study time */}
      <div className="mb-8">
        <h2 className="mb-4 font-display text-lg font-bold text-ink dark:text-ink-dark">
          Study time
        </h2>
        {hasStudyTimeData ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard icon={FiClock} label="Today" value={formatDuration(studyTime.todaySeconds)} />
            <StatCard icon={FiClock} label="This week" value={formatDuration(studyTime.weekSeconds)} />
            <StatCard icon={FiClock} label="This month" value={formatDuration(studyTime.monthSeconds)} />
            <StatCard icon={FiClock} label="Total" value={formatDuration(studyTime.totalSeconds)} />
            <StatCard
              icon={FiTrendingUp}
              label="Longest session"
              value={formatDuration(studyTime.longestSessionSeconds)}
            />
          </div>
        ) : (
          <Card>
            <EmptyState
              icon={FiClock}
              title="No study time tracked yet"
              description="StudyPlot tracks your active time in this browser as you use it — come back after a study session to see it here."
            />
          </Card>
        )}
      </div>

      {/* Streaks */}
      <div className="mb-8">
        <h2 className="mb-4 font-display text-lg font-bold text-ink dark:text-ink-dark">
          Streaks
        </h2>
        {hasStudyTimeData ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard icon={FiZap} label="Current streak" value={`${streaks.currentStreak}d`} sublabel="days in a row" />
            <StatCard icon={FiAward} label="Longest streak" value={`${streaks.longestStreak}d`} sublabel="personal best" />
            <StatCard icon={FiCalendar} label="This week" value={`${streaks.daysStudiedThisWeek}/7`} sublabel="days studied" />
          </div>
        ) : (
          <Card>
            <EmptyState
              icon={FiZap}
              title="No streak yet"
              description="Study on consecutive days to start building a streak."
            />
          </Card>
        )}
      </div>

      {/* Daily study time chart */}
      <div className="mb-8">
        <h2 className="mb-4 font-display text-lg font-bold text-ink dark:text-ink-dark">
          Daily study time
        </h2>
        {hasStudyTimeData ? (
          <Card>
            <div className="mx-auto flex max-w-xs items-end justify-between gap-2 sm:max-w-sm sm:gap-3">
              {dailyLog.map((day) => (
                <div key={day.date} className="flex flex-col items-center gap-2">
                  <span className="text-[11px] text-ink-faint dark:text-ink-dark-faint">
                    {day.seconds > 0 ? formatDuration(day.seconds) : ""}
                  </span>
                  <div className="flex h-20 w-5 items-end sm:w-6">
                    <div
                      className="w-full rounded-full bg-brand-primary/80"
                      style={{
                        height: `${Math.max(4, (day.seconds / maxDailySeconds) * 80)}px`,
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-ink-faint dark:text-ink-dark-faint">
                    {day.label}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card>
            <EmptyState
              icon={FiBarChart2}
              title="Nothing to chart yet"
              description="Your daily study time will appear here once you've spent some time in StudyPlot."
            />
          </Card>
        )}
      </div>

      {/* Learning activity */}
      <div className="mb-8">
        <h2 className="mb-4 font-display text-lg font-bold text-ink dark:text-ink-dark">
          Learning activity
        </h2>
        {isLoading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        )}

        {!isLoading && error && (
          <EmptyState icon={FiBarChart2} title="Couldn't load your activity" description={error} />
        )}

        {!isLoading && !error && !hasAnyActivity && (
          <Card>
            <EmptyState
              icon={FiBarChart2}
              title="No activity yet"
              description="Upload a document and start generating summaries, flashcards, or quizzes to see your learning activity here."
              actionLabel="Upload PDF"
              onAction={() => navigate("/upload")}
            />
          </Card>
        )}

        {!isLoading && !error && hasAnyActivity && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {activityItems.map((item) => (
              <StatCard key={item.label} icon={item.icon} label={item.label} value={item.value} />
            ))}
          </div>
        )}
      </div>

      {/* Productivity insights */}
      <div>
        <h2 className="mb-4 font-display text-lg font-bold text-ink dark:text-ink-dark">
          Productivity insights
        </h2>
        <Card>
          {insights.length > 0 ? (
            <ul className="space-y-2.5">
              {insights.map((insight) => (
                <li
                  key={insight}
                  className="flex items-start gap-2.5 text-sm text-ink-muted dark:text-ink-dark-muted"
                >
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-primary" />
                  {insight}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-muted dark:text-ink-dark-muted">
              Your productivity insights will appear as you continue studying.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
