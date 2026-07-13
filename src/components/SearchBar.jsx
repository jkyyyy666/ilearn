import React from "react";

/**
 * 搜索栏组件
 * 支持实时搜索，可配置搜索占位文本
 *
 * @param {Object} props
 * @param {string} props.value - 搜索值
 * @param {Function} props.onChange - 值变化回调
 * @param {string} props.placeholder - 占位文本
 */
export default function SearchBar({
  value,
  onChange,
  placeholder = "🔍 搜索...",
}) {
  return (
    <div className="search-bar">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
    </div>
  );
}
