/**
 * 连续学习天数工具
 * 每天首次访问/学习时自动记录
 * 数据存储在 localStorage
 */

const STREAK_KEY = "cl_streak_dates";

/**
 * 记录今天的学习活动
 * 每天只记录一次
 */
export function recordActivity() {
  try {
    const today = getDateStr(new Date());
    const dates = getStreakDates();
    if (dates[dates.length - 1] === today) return; // 今天已记录
    dates.push(today);
    localStorage.setItem(STREAK_KEY, JSON.stringify(dates));
  } catch (e) {
    console.warn("Streak record failed:", e);
  }
}

/**
 * 获取所有活跃日期（已排序）
 */
function getStreakDates() {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * 计算连续学习天数
 * @returns {number}
 */
export function calculateStreak() {
  const dates = getStreakDates();
  if (dates.length === 0) return 0;

  const today = getDateStr(new Date());
  const lastDate = dates[dates.length - 1];

  // 如果最新记录不是今天也不是昨天，断签了
  const diff = dayDiff(lastDate, today);
  if (diff > 1) return 0;

  // 从最后一天往前数连续天数
  let streak = 1;
  for (let i = dates.length - 2; i >= 0; i--) {
    const prevDate = dates[i];
    const currDate = dates[i + 1];
    const d = dayDiff(prevDate, currDate);
    if (d === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/**
 * 获取今天的日期字符串 YYYY-MM-DD
 */
function getDateStr(date) {
  return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
}

/**
 * 计算两个日期字符串相差的天数
 */
function dayDiff(dateStr1, dateStr2) {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}
