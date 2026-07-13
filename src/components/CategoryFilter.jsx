import React from "react";

/**
 * 分类筛选器组件
 * 显示分类按钮列表，支持选中状态
 *
 * @param {Object} props
 * @param {Array} props.categories - 分类列表
 * @param {string} props.active - 当前选中分类
 * @param {Function} props.onChange - 切换分类回调
 */
export default function CategoryFilter({ categories = [], active, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        flexWrap: "wrap",
        marginBottom: 16,
      }}
    >
      <button
        className={`btn btn-sm ${!active ? "btn-primary" : "btn-secondary"}`}
        onClick={() => onChange("")}
      >
        全部
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          className={`btn btn-sm ${
            active === cat ? "btn-primary" : "btn-secondary"
          }`}
          onClick={() => onChange(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
