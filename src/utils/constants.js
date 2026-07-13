/**
 * 常量配置
 * 定义语言配置、存储键名、分类列表等
 */

// 语言配置
export const LANGUAGES = {
  chinese: {
    key: "chinese",
    label: "中文",
    flag: "🇨🇳",
    fieldMain: "chinese",
    fieldSecondary: "pinyin",
    fieldTranslation: "english",
    fieldExample: "example",
    fieldCategory: "category",
    builtinSource: "ch_vocab",
    storagePrefix: "cl_zh_",
    categories: ["简单", "常用", "复杂", "自定义"],
  },
  english: {
    key: "english",
    label: "English",
    flag: "🇺🇸",
    fieldMain: "english",
    fieldSecondary: "ipa",
    fieldTranslation: "chinese",
    fieldExample: "sentence",
    fieldCategory: "category",
    builtinSource: "en_vocab",
    storagePrefix: "cl_en_",
    categories: ["简单", "常用", "复杂", "自定义"],
  },
};

// 存储键名
export const STORAGE_KEYS = {
  words: (lang) => `${lang}_words`,
  favorites: (lang) => `${lang}_favorites`,
  quizHistory: (lang) => `${lang}_quiz_history`,
  wrongWords: (lang) => `${lang}_wrong_words`,
  stats: (lang) => `${lang}_stats`,
};

// 测验模式
export const QUIZ_MODES = [
  { id: "cn2en", label: "中文→英文", icon: "📝", desc: "看中文，写英文" },
  { id: "en2cn", label: "英文→中文", icon: "🔤", desc: "看英文，写中文" },
  { id: "pinyin2cn", label: "拼音→中文", icon: "🔊", desc: "看拼音，写中文" },
  { id: "multiple", label: "四选一", icon: "🎯", desc: "选择正确答案" },
  { id: "spelling", label: "拼写模式", icon: "✍️", desc: "完整拼写" },
];

// 默认分类
export const DEFAULT_CATEGORIES = {
  chinese: ["简单", "常用", "复杂", "自定义"],
  english: ["简单", "常用", "复杂", "自定义"],
};

// 应用配置
export const APP_CONFIG = {
  dailyGoalKey: "cl_daily_goal",
  themeKey: "cl_theme",
  streakKey: "cl_streak",
  version: "1.0.0",
};
