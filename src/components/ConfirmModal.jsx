import React from "react";

/**
 * 确认弹窗组件
 * 用于删除等需要用户确认的操作
 *
 * @param {Object} props
 * @param {boolean} props.show - 是否显示
 * @param {string} props.title - 标题
 * @param {string} props.message - 消息
 * @param {Function} props.onConfirm - 确认回调
 * @param {Function} props.onCancel - 取消回调
 * @param {string} props.confirmText - 确认按钮文本
 * @param {boolean} props.danger - 是否为危险操作
 */
export default function ConfirmModal({
  show,
  title = "确认操作",
  message = "确定要执行此操作吗？",
  onConfirm,
  onCancel,
  confirmText = "确定",
  danger = false,
}) {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: 20, lineHeight: 1.6 }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            style={{ flex: 1 }}
          >
            取消
          </button>
          <button
            className={`btn ${danger ? "btn-danger" : "btn-primary"}`}
            onClick={onConfirm}
            style={{ flex: 1 }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
