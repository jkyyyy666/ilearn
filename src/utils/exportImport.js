/**
 * 数据导入导出工具
 * 支持导出 JSON 和导入 JSON
 */

import { getStorageItem, setStorageItem } from "./storage";

/**
 * 导出指定语言的所有数据为 JSON 字符串
 * @param {string} lang - 语言标识
 * @returns {string} JSON 字符串
 */
export function exportData(lang) {
  const data = {
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    language: lang,
    words: getStorageItem(`${lang}_words`, []),
    favorites: getStorageItem(`${lang}_favorites`, []),
    quizHistory: getStorageItem(`${lang}_quiz_history`, []),
    wrongWords: getStorageItem(`${lang}_wrong_words`, []),
    stats: getStorageItem(`${lang}_stats`, {}),
  };
  return JSON.stringify(data, null, 2);
}

/**
 * 导入 JSON 数据
 * @param {string} jsonStr - JSON 字符串
 * @param {string} lang - 目标语言
 * @returns {{ success: boolean, message: string }}
 */
export function importData(jsonStr, lang) {
  try {
    const data = JSON.parse(jsonStr);

    // 基本校验
    if (!data || typeof data !== "object") {
      return { success: false, message: "无效的 JSON 格式" };
    }

    // 导入单词
    if (Array.isArray(data.words)) {
      setStorageItem(`${lang}_words`, data.words);
    }

    // 导入收藏
    if (Array.isArray(data.favorites)) {
      setStorageItem(`${lang}_favorites`, data.favorites);
    }

    // 导入测验历史
    if (Array.isArray(data.quizHistory)) {
      setStorageItem(`${lang}_quiz_history`, data.quizHistory);
    }

    // 导入错题
    if (Array.isArray(data.wrongWords)) {
      setStorageItem(`${lang}_wrong_words`, data.wrongWords);
    }

    // 导入统计
    if (data.stats && typeof data.stats === "object") {
      setStorageItem(`${lang}_stats`, data.stats);
    }

    return {
      success: true,
      message: "数据导入成功",
    };
  } catch (error) {
    return {
      success: false,
      message: `导入失败：${error.message}`,
    };
  }
}

/**
 * 清空指定语言的所有数据
 * @param {string} lang - 语言标识
 */
export function clearAllData(lang) {
  localStorage.removeItem(`${lang}_words`);
  localStorage.removeItem(`${lang}_favorites`);
  localStorage.removeItem(`${lang}_quiz_history`);
  localStorage.removeItem(`${lang}_wrong_words`);
  localStorage.removeItem(`${lang}_stats`);
}

/**
 * 下载文件
 * @param {string} content - 文件内容
 * @param {string} filename - 文件名
 * @param {string} mimeType - MIME 类型
 */
export function downloadFile(content, filename, mimeType = "application/json") {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
