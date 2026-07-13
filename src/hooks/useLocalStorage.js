import { useState, useCallback } from "react";

/**
 * 自定义 Hook：localStorage 状态管理
 * 将 React state 与 localStorage 同步
 *
 * @param {string} key - localStorage 键名
 * @param {*} initialValue - 初始值
 * @returns {[*, Function]} [value, setValue]
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`useLocalStorage: Error reading "${key}"`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        // 使用 React 的函数式更新，保证 prev 始终是最新状态
        setStoredValue((prev) => {
          const newValue = value instanceof Function ? value(prev) : value;
          localStorage.setItem(key, JSON.stringify(newValue));
          return newValue;
        });
      } catch (error) {
        console.warn(`useLocalStorage: Error setting "${key}"`, error);
      }
    },
    [key]
  );

  return [storedValue, setValue];
}
