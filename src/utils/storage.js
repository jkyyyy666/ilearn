/**
 * LocalStorage 工具函数
 * 提供安全的读写操作，支持 JSON 序列化/反序列化
 */

/**
 * 从 localStorage 读取数据
 * @param {string} key - 存储键名
 * @param {*} defaultValue - 默认值
 * @returns {*} 解析后的数据
 */
export function getStorageItem(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`Failed to read localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * 写入 localStorage
 * @param {string} key - 存储键名
 * @param {*} value - 要存储的值
 */
export function setStorageItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to write localStorage key "${key}":`, error);
  }
}

/**
 * 从 localStorage 删除数据
 * @param {string} key - 存储键名
 */
export function removeStorageItem(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Failed to remove localStorage key "${key}":`, error);
  }
}

/**
 * 获取所有存储键名
 * @param {string} prefix - 可选前缀过滤
 * @returns {string[]} 键名数组
 */
export function getStorageKeys(prefix = "") {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keys.push(key);
      }
    }
    return keys;
  } catch (error) {
    console.warn("Failed to list localStorage keys:", error);
    return [];
  }
}
