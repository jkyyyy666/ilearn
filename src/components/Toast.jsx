import React, { useCallback, useEffect, useRef } from "react";

/**
 * Toast 提示组件
 * 支持成功、错误、警告、信息四种类型
 *
 * @param {Object} props
 * @param {Array} props.toasts - Toast 列表 [{ id, type, message }]
 * @param {Function} props.removeToast - 移除 Toast
 */
let toastId = 0;

/**
 * 使用 Toast 的 Hook
 * @param {Function} setToasts - 设置 Toast 列表的 setter
 */
export function useToastManager(setToasts) {
  const addToast = useCallback(
    (message, type = "info", duration = 2500) => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    [setToasts]
  );

  const removeToast = useCallback(
    (id) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    },
    [setToasts]
  );

  return { addToast, removeToast };
}

/**
 * Toast 渲染组件
 */
export default function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          onClick={() => removeToast(toast.id)}
          style={{ cursor: "pointer" }}
        >
          <span>
            {toast.type === "success"
              ? "✅"
              : toast.type === "error"
              ? "❌"
              : toast.type === "warning"
              ? "⚠️"
              : "ℹ️"}
          </span>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
