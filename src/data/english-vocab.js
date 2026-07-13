/**
 * 内置英文词汇库（已清空，可自行添加）
 * 每个词汇包含：英语、IPA音标、中文释义、例句、等级
 */
const ENGLISH_VOCAB = [];

/**
 * 获取所有内置英文词汇
 * @returns {Array} 词汇数组
 */
export function getBuiltinEnglishVocab() {
  return ENGLISH_VOCAB.map((w, i) => ({ ...w, id: `en_builtin_${i}` }));
}
