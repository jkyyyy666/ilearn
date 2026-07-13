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
 */
export default function WordCard({
  word,
  lang,
  isFavorite,
  onToggleFav,
  onClick,
  onEdit,
  onDelete,
}) {
  const isChinese = lang === "chinese";

  // 根据语言显示不同字段
  const mainText = isChinese ? word.chinese : word.english;
  const secondaryText = isChinese ? word.pinyin : word.ipa;
  const translation = isChinese ? word.english : word.chinese;
  const exampleText = isChinese ? word.example : word.sentence;

  return (
    <div className="word-card" onClick={onClick}>
      <div className="word-top">
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
          className={`fav-btn ${isFavorite ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFav?.(word.id);
          }}
        >
          {isFavorite ? "⭐" : "☆"}
        </button>
      </div>

      {exampleText && <div className="word-example">"{exampleText}"</div>}

      {(onEdit || onDelete) && (
        <div className="word-actions">
          {onEdit && (
            <button
              className="btn btn-sm btn-secondary"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(word);
              }}
            >
              ✏️ 编辑
            </button>
          )}
          {onDelete && (
            <button
              className="btn btn-sm btn-danger"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(word);
              }}
              style={{ opacity: 0.8 }}
            >
              🗑️ 删除
            </button>
          )}
        </div>
      )}
    </div>
  );
}
