import React, { useState, useMemo, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { useWords } from "../context/WordContext";
import EmptyState from "../components/EmptyState";
import ConfirmModal from "../components/ConfirmModal";
import ToastContainer, { useToastManager } from "../components/Toast";

/**
 * 错题本页面
 * 展示所有不认识（答错）的单词
 * 单击单词卡片可翻转显示释义和拼音
 * 支持标记为已认识（从错题本移除）
 */
export default function WrongBookPage() {
  const { lang } = useOutletContext();
  const isChinese = lang === "chinese";
  const words = useWords();

  const [toasts, setToasts] = useState([]);
  const { addToast } = useToastManager(setToasts);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // 记录哪些单词已展开（显示释义），Set 存储 word.id
  const [revealedIds, setRevealedIds] = useState(() => new Set());

  const wrongWords = words.getWrongWords(lang);

  // 搜索过滤
  const filteredWords = useMemo(() => {
    if (!searchQuery.trim()) return wrongWords;
    const q = searchQuery.trim().toLowerCase();
    return wrongWords.filter((w) =>
      (w.chinese || "").toLowerCase().includes(q) ||
      (w.english || "").toLowerCase().includes(q) ||
      (w.pinyin || "").toLowerCase().includes(q) ||
      (w.ipa || "").toLowerCase().includes(q)
    );
  }, [wrongWords, searchQuery]);

  // 切换展开/折叠
  const toggleReveal = useCallback((wordId) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(wordId)) {
        next.delete(wordId);
      } else {
        next.add(wordId);
      }
      return next;
    });
  }, []);

  // 标记该词已认识，从错题本移除
  const handleMarkKnown = useCallback(
    (word) => {
      words.removeWrongWord(lang, word.id);
      addToast(`已认识「${isChinese ? word.chinese : word.english}」，已从错题本移除`, "success");
    },
    [words, lang, isChinese, addToast]
  );

  // 清空错题本
  const handleClear = () => {
    try {
      words.clearWrongWords(lang);
      setShowClearConfirm(false);
      setRevealedIds(new Set());
      setTimeout(() => addToast("错题本已清空", "success"), 50);
    } catch (e) {
      console.error("Clear failed:", e);
    }
  };

  // ===== 错题列表 =====
  return (
    <div>
      <ToastContainer toasts={toasts} />

      {/* 搜索框 */}
      <div
        style={{
          position: "relative",
          marginBottom: 12,
        }}
      >
        <input
          className="input-field"
          type="text"
          placeholder="🔍 搜索中文、英文或拼音..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            paddingLeft: 12,
            paddingRight: 32,
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              color: "var(--text-tertiary)",
              cursor: "pointer",
              fontSize: 16,
              padding: "4px 8px",
            }}
          >
            ✕
          </button>
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontSize: 14,
            color: "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>📝</span>
          <span>共 {filteredWords.length} 个待复习单词</span>
        </div>
        {filteredWords.length > 0 && (
          <button
            className="btn btn-sm btn-danger"
            onClick={() => setShowClearConfirm(true)}
          >
            🗑️ 清空
          </button>
        )}
      </div>

      {/* 说明 */}
      <div
        style={{
          fontSize: 13,
          color: "var(--text-tertiary)",
          marginBottom: 16,
          padding: "10px 14px",
          borderRadius: 10,
          background: "rgba(255,255,255,0.05)",
          lineHeight: 1.6,
        }}
      >
        👆 单击单词卡片查看释义和拼音
        <br />
        ✅ 点击"认识这个词了"可将单词移出错题本
      </div>

      {filteredWords.length === 0 ? (
        <EmptyState
          icon="🎉"
          title="暂无错题"
          description="太棒了！当前没有需要复习的单词"
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filteredWords.map((word, i) => {
            const isRevealed = revealedIds.has(word.id);
            return (
              <div
                key={word.id || i}
                className="word-card"
                style={{
                  position: "relative",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onClick={() => toggleReveal(word.id)}
              >
                <div className="word-top">
                  <div style={{ flex: 1 }}>
                    {/* 主词（始终显示） */}
                    <div className="word-chinese">
                      {isChinese ? word.chinese : word.english}
                    </div>

                    {/* 点击后展开的内容 */}
                    {isRevealed && (
                      <div style={{ animation: "fadeIn 0.2s ease" }}>
                        {/* 拼音 / IPA */}
                        {(word.pinyin || word.ipa) && (
                          <div className="word-pinyin" style={{ marginTop: 4 }}>
                            {word.pinyin || word.ipa}
                          </div>
                        )}
                        {/* 释义 */}
                        <div className="word-meaning" style={{ marginTop: 2 }}>
                          {isChinese ? word.english : word.chinese}
                        </div>
                        {/* 例句 */}
                        {(word.example || word.sentence) && (
                          <div
                            style={{
                              marginTop: 6,
                              fontSize: 13,
                              color: "var(--text-secondary)",
                              fontStyle: "italic",
                              padding: "8px 12px",
                              borderRadius: 8,
                              background: "rgba(255,255,255,0.06)",
                              lineHeight: 1.5,
                            }}
                          >
                            💬 {word.example || word.sentence}
                          </div>
                        )}
                        {/* 分类标签 */}
                        {word.category && (
                          <div
                            style={{
                              display: "inline-block",
                              marginTop: 6,
                              padding: "2px 10px",
                              borderRadius: 20,
                              background: "rgba(129, 140, 248, 0.2)",
                              color: "rgba(129, 140, 248, 0.9)",
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                          >
                            {word.category}
                          </div>
                        )}
                        {/* 用户答错的答案 */}
                        {word.wrongAnswer && (
                          <div
                            style={{
                              marginTop: 6,
                              fontSize: 12,
                              color: "var(--danger)",
                            }}
                          >
                            ❌ 你的答案：{word.wrongAnswer}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 未展开时的提示 */}
                    {!isRevealed && (
                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 12,
                          color: "var(--text-tertiary)",
                          opacity: 0.6,
                        }}
                      >
                        👆 点击查看释义
                      </div>
                    )}
                  </div>

                  {/* 标记已认识按钮 */}
                  <button
                    className="btn btn-sm btn-success"
                    onClick={(e) => {
                      e.stopPropagation(); // 阻止冒泡，避免触发切换展开
                      handleMarkKnown(word);
                    }}
                    style={{
                      whiteSpace: "nowrap",
                      alignSelf: "flex-start",
                      marginLeft: 8,
                      flexShrink: 0,
                    }}
                  >
                    ✅ 认识
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        show={showClearConfirm}
        title="清空错题本"
        message="确定要清空所有错题吗？此操作不可恢复。"
        danger
        confirmText="清空"
        onConfirm={handleClear}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
}
