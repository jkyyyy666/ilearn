/**
 * 内置中文词汇库（已清空，可自行添加）
 * 每个词汇包含：中文、拼音、英文释义、例句、等级
 */
const CHINESE_VOCAB = [];

/**
 * 获取所有内置中文词汇
 * @returns {Array} 词汇数组
 */
export function getBuiltinChineseVocab() {
  return CHINESE_VOCAB.map((w, i) => ({ ...w, id: `ch_builtin_${i}` }));
}
