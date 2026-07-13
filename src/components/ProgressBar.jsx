import React from "react";

/**
 * 进度条组件
 *
 * @param {Object} props
 * @param {number} props.value - 当前值
 * @param {number} props.max - 最大值
 * @param {string} props.label - 标签文本
 * @param {boolean} props.showPercent - 是否显示百分比
 */
export default function ProgressBar({
  value = 0,
  max = 100,
  label,
  showPercent = true,
}) {
  const percent = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div>
      {(label || showPercent) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 13,
            color: "var(--text-secondary)",
            marginBottom: 4,
          }}
        >
          {label && <span>{label}</span>}
          {showPercent && (
            <span style={{ fontWeight: 600, color: "var(--text)" }}>
              {value} / {max}
            </span>
          )}
        </div>
      )}
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
