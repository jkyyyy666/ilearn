import React, { createContext, useContext, useCallback, useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { getBuiltinChineseVocab } from "../data/chinese-vocab";
import { getBuiltinEnglishVocab } from "../data/english-vocab";
import { STORAGE_KEYS } from "../utils/constants";

/**
 * 单词管理 Context
 * 管理中文和英文的词汇、收藏、错题等数据
 */

const WordContext = createContext(null);

/**
 * 内置词汇映射
 */
const BUILTIN_WORDS = {
  chinese: getBuiltinChineseVocab(),
  english: getBuiltinEnglishVocab(),
};

export function WordProvider({ children }) {
  // ===== 中文数据 =====
  const [zhCustomWords, setZhCustomWords] = useLocalStorage("chinese_words", []);
  const [zhFavorites, setZhFavorites] = useLocalStorage("chinese_favorites", []);
  const [zhWrongWords, setZhWrongWords] = useLocalStorage("chinese_wrong_words", []);
  const [zhKnownWords, setZhKnownWords] = useLocalStorage("chinese_known_words", []);
  const [zhQuizHistory, setZhQuizHistory] = useLocalStorage("chinese_quiz_history", []);

  // ===== 英文数据 =====
  const [enKnownWords, setEnKnownWords] = useLocalStorage("english_known_words", []);
  const [enCustomWords, setEnCustomWords] = useLocalStorage("english_words", []);
  const [enFavorites, setEnFavorites] = useLocalStorage("english_favorites", []);
  const [enWrongWords, setEnWrongWords] = useLocalStorage("english_wrong_words", []);
  const [enQuizHistory, setEnQuizHistory] = useLocalStorage("english_quiz_history", []);

  // ===== 通用操作 =====

  /**
   * 获取所有词汇（内置 + 自定义）
   * @param {string} lang - 语言
   * @returns {Array} 词汇数组
   */
  const getAllWords = useCallback(
    (lang) => {
      const builtin = BUILTIN_WORDS[lang] || [];
      const custom = lang === "chinese" ? zhCustomWords : enCustomWords;
      return [...builtin, ...custom];
    },
    [zhCustomWords, enCustomWords]
  );

  /**
   * 获取自定义词汇
   * @param {string} lang - 语言
   * @returns {Array}
   */
  const getCustomWords = useCallback(
    (lang) => (lang === "chinese" ? zhCustomWords : enCustomWords),
    [zhCustomWords, enCustomWords]
  );

  /**
   * 添加自定义词汇
   * @param {string} lang - 语言
   * @param {Object} word - 词汇对象
   */
  const addWord = useCallback(
    (lang, word) => {
      const newWord = {
        ...word,
        id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        createdAt: Date.now(),
      };
      if (lang === "chinese") {
        setZhCustomWords((prev) => [...prev, newWord]);
      } else {
        setEnCustomWords((prev) => [...prev, newWord]);
      }
      return newWord;
    },
    [setZhCustomWords, setEnCustomWords]
  );

  /**
   * 更新词汇
   * @param {string} lang - 语言
   * @param {string} wordId - 词汇 ID
   * @param {Object} updates - 更新内容
   */
  const updateWord = useCallback(
    (lang, wordId, updates) => {
      const updater = (prev) =>
        prev.map((w) => (w.id === wordId ? { ...w, ...updates } : w));
      if (lang === "chinese") {
        setZhCustomWords(updater);
      } else {
        setEnCustomWords(updater);
      }
    },
    [setZhCustomWords, setEnCustomWords]
  );

  /**
   * 删除词汇
   * @param {string} lang - 语言
   * @param {string} wordId - 词汇 ID
   */
  const deleteWord = useCallback(
    (lang, wordId) => {
      const filterer = (prev) => prev.filter((w) => w.id !== wordId);
      if (lang === "chinese") {
        setZhCustomWords(filterer);
        // 同时从收藏中移除
        setZhFavorites((prev) => prev.filter((id) => id !== wordId));
      } else {
        setEnCustomWords(filterer);
        setEnFavorites((prev) => prev.filter((id) => id !== wordId));
      }
    },
    [setZhCustomWords, setZhFavorites, setEnCustomWords, setEnFavorites]
  );

  // ===== 收藏操作 =====

  /**
   * 获取收藏列表
   * @param {string} lang - 语言
   * @returns {Array} 收藏单词 ID 列表
   */
  const getFavorites = useCallback(
    (lang) => (lang === "chinese" ? zhFavorites : enFavorites),
    [zhFavorites, enFavorites]
  );

  /**
   * 切换收藏状态
   * @param {string} lang - 语言
   * @param {string} wordId - 词汇 ID
   */
  const toggleFavorite = useCallback(
    (lang, wordId) => {
      const toggle = (prev) => {
        const idx = prev.indexOf(wordId);
        if (idx > -1) {
          return prev.filter((id) => id !== wordId);
        }
        return [...prev, wordId];
      };
      if (lang === "chinese") {
        setZhFavorites(toggle);
      } else {
        setEnFavorites(toggle);
      }
    },
    [setZhFavorites, setEnFavorites]
  );

  /**
   * 获取收藏的完整单词列表
   * @param {string} lang - 语言
   * @returns {Array}
   */
  const getFavoriteWords = useCallback(
    (lang) => {
      const all = getAllWords(lang);
      const favIds = lang === "chinese" ? zhFavorites : enFavorites;
      return all.filter((w) => favIds.includes(w.id));
    },
    [getAllWords, zhFavorites, enFavorites]
  );

  // ===== 错题操作 =====

  const getKnownWords = useCallback(
    (lang) => (lang === "chinese" ? zhKnownWords : enKnownWords),
    [zhKnownWords, enKnownWords]
  );

  const getWrongWords = useCallback(
    (lang) => (lang === "chinese" ? zhWrongWords : enWrongWords),
    [zhWrongWords, enWrongWords]
  );

  /**
   * 添加错题
   * @param {string} lang - 语言
   * @param {Object} word - 错误单词
   */
  const addWrongWord = useCallback(
    (lang, word) => {
      const adder = (prev) => {
        // 避免重复
        if (prev.some((w) => w.id === word.id)) return prev;
        return [{ ...word, wrongAt: Date.now() }, ...prev];
      };
      if (lang === "chinese") {
        setZhWrongWords(adder);
      } else {
        setEnWrongWords(adder);
      }
    },
    [setZhWrongWords, setEnWrongWords]
  );

  /**
   * 批量添加错题
   * @param {string} lang - 语言
   * @param {Array} words - 错误单词列表
   */
  const addKnownWord = useCallback(
    (lang, word) => {
      const adder = (prev) => {
        if (prev.some((w) => w.id === word.id)) return prev;
        return [{ ...word, knownAt: Date.now() }, ...prev];
      };
      if (lang === "chinese") {
        setZhKnownWords(adder);
      } else {
        setEnKnownWords(adder);
      }
    },
    [setZhKnownWords, setEnKnownWords]
  );

  const addWrongWords = useCallback(
    (lang, words) => {
      words.forEach((w) => addWrongWord(lang, w));
    },
    [addWrongWord]
  );

  /**
   * 从错题本中移除指定单词（用户确认已掌握）
   * @param {string} lang - 语言
   * @param {string} wordId - 单词 ID
   */
  const removeWrongWord = useCallback(
    (lang, wordId) => {
      const filterer = (prev) => prev.filter((w) => w.id !== wordId);
      if (lang === "chinese") {
        setZhWrongWords(filterer);
      } else {
        setEnWrongWords(filterer);
      }
    },
    [setZhWrongWords, setEnWrongWords]
  );

  /**
   * 清空错题本
   * @param {string} lang - 语言
   */
  const removeKnownWord = useCallback(
    (lang, wordId) => {
      const filterer = (prev) => prev.filter((w) => w.id !== wordId);
      if (lang === "chinese") {
        setZhKnownWords(filterer);
      } else {
        setEnKnownWords(filterer);
      }
    },
    [setZhKnownWords, setEnKnownWords]
  );

  const clearKnownWords = useCallback(
    (lang) => {
      if (lang === "chinese") {
        setZhKnownWords([]);
      } else {
        setEnKnownWords([]);
      }
    },
    [setZhKnownWords, setEnKnownWords]
  );

  const clearWrongWords = useCallback(
    (lang) => {
      if (lang === "chinese") {
        setZhWrongWords([]);
      } else {
        setEnWrongWords([]);
      }
    },
    [setZhWrongWords, setEnWrongWords]
  );

  // ===== 测验历史 =====

  const getQuizHistory = useCallback(
    (lang) => (lang === "chinese" ? zhQuizHistory : enQuizHistory),
    [zhQuizHistory, enQuizHistory]
  );

  /**
   * 添加测验记录
   * @param {string} lang - 语言
   * @param {Object} record - 测验记录
   */
  const addQuizRecord = useCallback(
    (lang, record) => {
      const adder = (prev) => [
        { ...record, date: Date.now() },
        ...prev.slice(0, 99), // 最多保留 100 条
      ];
      if (lang === "chinese") {
        setZhQuizHistory(adder);
      } else {
        setEnQuizHistory(adder);
      }
    },
    [setZhQuizHistory, setEnQuizHistory]
  );

  // ===== 统计信息 =====

  /**
   * 获取学习统计
   * @param {string} lang - 语言
   * @returns {Object} 统计数据
   */
  const getStats = useCallback(
    (lang) => {
      const all = getAllWords(lang);
      const favs = getFavorites(lang);
      const wrong = getWrongWords(lang);
      const history = getQuizHistory(lang);

      const totalQuizzes = history.length;
      const totalCorrect = history.reduce((s, r) => s + (r.correct || 0), 0);
      const totalQuestions = history.reduce((s, r) => s + (r.total || 0), 0);
      const avgRate =
        totalQuestions > 0
          ? Math.round((totalCorrect / totalQuestions) * 100)
          : 0;

      // 连续学习天数
      const streak = calculateStreak(history);

      return {
        totalWords: all.length,
        builtinCount: BUILTIN_WORDS[lang]?.length || 0,
        customCount:
          lang === "chinese" ? zhCustomWords.length : enCustomWords.length,
        favoriteCount: favs.length,
        wrongCount: wrong.length,
        totalQuizzes,
        avgRate,
        streak,
      };
    },
    [
      getAllWords,
      getFavorites,
      getWrongWords,
      getQuizHistory,
      zhCustomWords,
      enCustomWords,
    ]
  );

  // ===== Context value =====

  const value = useMemo(
    () => ({
      // 中文
      zhCustomWords,
      zhFavorites,
      zhWrongWords,
      zhQuizHistory,
      // 英文
      enCustomWords,
      enFavorites,
      enWrongWords,
      enQuizHistory,
      // 通用操作
      getAllWords,
      getCustomWords,
      addWord,
      updateWord,
      deleteWord,
      // 收藏
      getFavorites,
      toggleFavorite,
      getFavoriteWords,
      // 已认识
      getKnownWords,
      addKnownWord,
      clearKnownWords,
      removeKnownWord,
      // 错题
      getWrongWords,
      addWrongWord,
      addWrongWords,
      removeWrongWord,
      clearWrongWords,
      // 测验
      getQuizHistory,
      addQuizRecord,
      // 统计
      getStats,
    }),
    [
      zhCustomWords,
      zhFavorites,
      zhWrongWords,
      zhQuizHistory,
      enCustomWords,
      enFavorites,
      enWrongWords,
      enQuizHistory,
      getAllWords,
      getCustomWords,
      addWord,
      updateWord,
      deleteWord,
      getFavorites,
      toggleFavorite,
      getFavoriteWords,
      getKnownWords,
      addKnownWord,
      removeKnownWord,
      clearKnownWords,
      getWrongWords,
      addWrongWords,
      removeWrongWord,
      clearWrongWords,
      getQuizHistory,
      addQuizRecord,
      getStats,
    ]
  );

  return <WordContext.Provider value={value}>{children}</WordContext.Provider>;
}

/**
 * 计算连续学习天数
 * @param {Array} history - 测验历史
 * @returns {number}
 */
function calculateStreak(history) {
  if (!history || history.length === 0) return 0;

  const dates = history.map((r) => {
    const d = new Date(r.date);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  });

  const uniqueDates = [...new Set(dates)].sort().reverse();
  if (uniqueDates.length === 0) return 0;

  let streak = 1;
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  // 如果最近学习日期不是今天也不是昨天，连续天数为 0
  const mostRecent = new Date(uniqueDates[0]);
  const diffDays = Math.floor(
    (today - new Date(mostRecent)) / (1000 * 60 * 60 * 24)
  );
  if (diffDays > 1) return 0;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1]);
    const curr = new Date(uniqueDates[i]);
    const diff = Math.floor((prev - curr) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * 使用单词管理的 Hook
 */
export function useWords() {
  const context = useContext(WordContext);
  if (!context) {
    throw new Error("useWords must be used within WordProvider");
  }
  return context;
}
