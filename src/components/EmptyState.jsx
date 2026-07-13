import React from "react";

/**
 * 空状态组件 - 当列表为空时显示
 * @param {Object} props
 * @param {string} props.icon - 图标
 * @param {string} props.title - 标题
 * @param {string} props.description - 描述
 * @param {React.ReactNode} props.action - 操作按钮
 */
export default function EmptyState({ icon = "📭", title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      {title && <div className="empty-title">{title}</div>}
      {description && <div className="empty-desc">{description}</div>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}
