// Tracks genuine active study time in this browser using the Page
// Visibility API. No time is invented: seconds only accumulate while the
// tab is visible, the window is focused, and the user has interacted
// recently (idle periods longer than IDLE_LIMIT_MS are ignored).
//
// Data is persisted to localStorage as a day -> seconds map, plus a
// running "longest single session" length. Everything Analytics displays
// is derived from this real log.

const LOG_KEY = "studyplot-study-log";
const LONGEST_SESSION_KEY = "studyplot-longest-session";
const IDLE_LIMIT_MS = 3 * 60 * 1000; // 3 minutes of no interaction = idle
const FLUSH_INTERVAL_MS = 5000;

const todayKey = (date = new Date()) => date.toISOString().slice(0, 10);

const readLog = () => {
  try {
    const raw = window.localStorage.getItem(LOG_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeLog = (log) => {
  try {
    window.localStorage.setItem(LOG_KEY, JSON.stringify(log));
  } catch {
    // Storage unavailable (private mode, quota, etc.) — fail silently.
  }
};

const readLongestSession = () => {
  const raw = window.localStorage.getItem(LONGEST_SESSION_KEY);
  return raw ? Number(raw) || 0 : 0;
};

const writeLongestSession = (seconds) => {
  try {
    window.localStorage.setItem(LONGEST_SESSION_KEY, String(seconds));
  } catch {
    // ignore
  }
};

const addSeconds = (seconds) => {
  if (seconds <= 0) return;
  const log = readLog();
  const key = todayKey();
  log[key] = (log[key] || 0) + seconds;
  writeLog(log);
};

/**
 * Starts a tracking session. Returns a stop function to call on unmount.
 * Meant to be mounted once near the app root (inside the authenticated
 * shell) so it tracks real usage across the whole app.
 */
export const startStudyTimeSession = () => {
  let lastTickAt = Date.now();
  let lastActivityAt = Date.now();
  let currentSessionSeconds = 0;
  let isTabVisible = document.visibilityState === "visible";

  const markActivity = () => {
    lastActivityAt = Date.now();
  };

  const tick = () => {
    const now = Date.now();
    const elapsedSeconds = (now - lastTickAt) / 1000;
    lastTickAt = now;

    const isIdle = now - lastActivityAt > IDLE_LIMIT_MS;

    if (isTabVisible && !isIdle) {
      addSeconds(elapsedSeconds);
      currentSessionSeconds += elapsedSeconds;

      if (currentSessionSeconds > readLongestSession()) {
        writeLongestSession(Math.round(currentSessionSeconds));
      }
    } else {
      // Session interrupted — the next active tick starts a fresh session.
      currentSessionSeconds = 0;
    }
  };

  const handleVisibilityChange = () => {
    isTabVisible = document.visibilityState === "visible";
    lastTickAt = Date.now();
    if (isTabVisible) markActivity();
  };

  const activityEvents = ["mousemove", "keydown", "scroll", "touchstart"];
  activityEvents.forEach((evt) =>
    window.addEventListener(evt, markActivity, { passive: true })
  );
  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("focus", handleVisibilityChange);
  window.addEventListener("blur", handleVisibilityChange);

  const interval = setInterval(tick, FLUSH_INTERVAL_MS);

  return () => {
    clearInterval(interval);
    activityEvents.forEach((evt) => window.removeEventListener(evt, markActivity));
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("focus", handleVisibilityChange);
    window.removeEventListener("blur", handleVisibilityChange);
  };
};

const sumRange = (log, days) => {
  let total = 0;
  const cursor = new Date();
  for (let i = 0; i < days; i += 1) {
    total += log[todayKey(cursor)] || 0;
    cursor.setDate(cursor.getDate() - 1);
  }
  return total;
};

export const getStudyTimeStats = () => {
  const log = readLog();
  const days = Object.keys(log);

  const todaySeconds = log[todayKey()] || 0;
  const weekSeconds = sumRange(log, 7);
  const monthSeconds = sumRange(log, 30);
  const totalSeconds = days.reduce((sum, key) => sum + log[key], 0);
  const longestSessionSeconds = readLongestSession();

  return {
    todaySeconds,
    weekSeconds,
    monthSeconds,
    totalSeconds,
    longestSessionSeconds,
    hasAnyData: days.length > 0,
  };
};

export const getDailyStudyLog = (days = 7) => {
  const log = readLog();
  const result = [];
  const cursor = new Date();
  cursor.setDate(cursor.getDate() - (days - 1));

  for (let i = 0; i < days; i += 1) {
    const key = todayKey(cursor);
    result.push({
      date: key,
      label: cursor.toLocaleDateString(undefined, { weekday: "short" }),
      seconds: log[key] || 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
};

const MIN_SECONDS_FOR_STUDY_DAY = 30;

export const getStreakStats = () => {
  const log = readLog();
  const studiedDays = new Set(
    Object.entries(log)
      .filter(([, seconds]) => seconds >= MIN_SECONDS_FOR_STUDY_DAY)
      .map(([key]) => key)
  );

  // Current streak: walk backwards from today (or yesterday, if today has
  // no activity yet) while each day was studied.
  let currentStreak = 0;
  const cursor = new Date();
  if (!studiedDays.has(todayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (studiedDays.has(todayKey(cursor))) {
    currentStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  // Longest streak: scan all studied days for the longest consecutive run.
  const sortedDays = [...studiedDays].sort();
  let longestStreak = 0;
  let run = 0;
  let prevDate = null;
  sortedDays.forEach((dayKey) => {
    const date = new Date(dayKey);
    if (prevDate) {
      const diffDays = Math.round((date - prevDate) / 86400000);
      run = diffDays === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    longestStreak = Math.max(longestStreak, run);
    prevDate = date;
  });

  // Days studied this week (Sunday-start week).
  const weekCursor = new Date();
  weekCursor.setDate(weekCursor.getDate() - weekCursor.getDay());
  let daysStudiedThisWeek = 0;
  for (let i = 0; i < 7; i += 1) {
    if (studiedDays.has(todayKey(weekCursor))) daysStudiedThisWeek += 1;
    weekCursor.setDate(weekCursor.getDate() + 1);
  }

  return { currentStreak, longestStreak, daysStudiedThisWeek };
};
