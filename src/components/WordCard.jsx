import React from "react";

/**
 * 单词卡片组件
 * 展示单个单词信息
 *
 * @param {Object} props
 * @param {Object} props.word - 单词数据
 * @param {string} props.lang - 语言
 * @param {boolean} props.isFavorite - 是否收藏
 * @param {Function} props.onToggleFav - 切换收藏
 * @param {Function} props.onClick - 点击卡片
 * @param {Function} props.onEdit - 编辑
 * @param {Function} props.onDelete - 删除
 * @param {boolean} props.selected - 是否选中（批量模式）
 * @param {Function} props.onToggleSelect - 切换选中
 */
export default function WordCard({
  word,
  lang,
  isFavorite,
  onToggleFav,
  onClick,
  onEdit,
  onDelete,
  selected,
  onToggleSelect,
}) {
  const isChinese = lang === "chinese";

  const mainText = isChinese ? word.chinese : word.english;
  const secondaryText = isChinese ? word.pinyin : word.ipa;
  const translation = isChinese ? word.english : word.chinese;
  const exampleText = isChinese ? word.example : word.sentence;

  const handleCardClick = (e) => {
    if (onToggleSelect) {
      // 批量模式下点击卡片切换选中
      onToggleSelect(word.id);
    } else {
      onClick?.(word);
    }
  };

  return (
    <div
      className="word-card"
      onClick={handleCardClick}
      style={selected ? { borderColor: "var(--primary)", background: "rgba(79, 70, 229, 0.05)" } : undefined}
    >
      <div className="word-top">
        {/* 批量选择复选框 */}
        {onToggleSelect && (
          <div
            onClick={(e) => { e.stopPropagation(); onToggleSelect(word.id); }}
            style={{
              width: 22, height: 22, borderRadius: 4, border: "2px solid var(--primary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0, marginRight: 12, marginTop: 2,
              background: selected ? "var(--primary)" : "transparent",
              transition: "all 0.15s",
            }}
          >
            {selected && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="word-chinese">{mainText}</div>
          {secondaryText && <div className="word-pinyin">{secondaryText}</div>}
          <div className="word-meaning">{translation}</div>
          {word.category && (
            <div className="word-category">
              <span className="badge badge-primary">{word.category}</span>
            </div>
          )}
        </div>
        <button
          className={"fav-btn " + (isFavorite ? "active" : "")}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFav?.(word.id);
          }}
        >
          {isFavorite ? "⭐" : "☆"}
        </button>
      </div>

      {exampleText && <div className="word-example">"{exampleText}"</div>}

      {/* 批量模式不显示操作按钮，减少干扰 */}
      {!onToggleSelect && (onEdit || onDelete) && (
        <div className="word-actions">
          {onEdit && (
            <button className="btn btn-sm btn-secondary" onClick={(e) => { e.stopPropagation(); onEdit(word); }}>
              ✏️ 编辑
            </button>
          )}
          {onDelete && (
            <button className="btn btn-sm btn-danger" onClick={(e) => { e.stopPropagation(); onDelete(word); }} style={{ opacity: 0.8 }}>
              🗑️ 删除
            </button>
          )}
        </div>
      )}
    </div>
  );
}
