import React, { useState, useMemo, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { useWords } from "../context/WordContext";
import EmptyState from "../components/EmptyState";
import ToastContainer, { useToastManager } from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";

/**
 * 已认识单词页面
 * 展示用户在测验中标记为"认识"的单词
 */
export default function KnownWordsPage() {
  const { lang } = useOutletContext();
  const isChinese = lang === "chinese";
  const words = useWords();

  const [toasts, setToasts] = useState([]);
  const { addToast } = useToastManager(setToasts);
  const [searchQuery, setSearchQuery] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [revealedIds, setRevealedIds] = useState(() => new Set());

  const knownWords = words.getKnownWords(lang);

  // 搜索过滤
  const filteredWords = useMemo(() => {
    if (!searchQuery.trim()) return knownWords;
    const q = searchQuery.trim().toLowerCase();
    return knownWords.filter((w) =>
      (w.chinese || "").toLowerCase().includes(q) ||
      (w.english || "").toLowerCase().includes(q) ||
      (w.pinyin || "").toLowerCase().includes(q) ||
      (w.ipa || "").toLowerCase().includes(q)
    );
  }, [knownWords, searchQuery]);

  const handleRemoveKnown = useCallback((word) => {
    words.removeKnownWord(lang, word.id);
    addToast(`已移除「${isChinese ? word.chinese : word.english}」`, "info");
  }, [words, lang, isChinese, addToast]);

  const handleClearKnown = () => {
    words.clearKnownWords(lang);
    setShowClearConfirm(false);
    addToast("已认识列表已清空", "success");
  };

  const toggleReveal = useCallback((wordId) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(wordId)) next.delete(wordId);
      else next.add(wordId);
      return next;
    });
  }, []);

  return (
    <div>
      <ToastContainer toasts={toasts} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 14, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
          <span>✅</span>
          <span>共 {filteredWords.length} 个已认识单词</span>
        {filteredWords.length > 0 && (
          <button className="btn btn-sm btn-danger" onClick={() => setShowClearConfirm(true)}>🗑️ 清空</button>
        )}
        </div>
      </div>

      {/* 搜索框 */}
      <div style={{ position: "relative", marginBottom: 12 }}>
        <input
          className="input-field"
          type="text"
          placeholder="🔍 搜索中文、英文或拼音..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ paddingLeft: 12, paddingRight: 32 }}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: 16, padding: "4px 8px" }}>✕</button>
        )}
      </div>

      {filteredWords.length === 0 ? (
        <EmptyState icon="✅" title="还没有已认识的单词" description="在测验中标记认识后会自动出现在这里" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filteredWords.map((word, i) => {
            const isRevealed = revealedIds.has(word.id);
            return (
              <div key={word.id || i} className="word-card" style={{ cursor: "pointer" }} onClick={() => toggleReveal(word.id)}>
                <div className="word-top">
                  <div style={{ flex: 1 }}>
                    <div className="word-chinese">{isChinese ? word.chinese : word.english}</div>
                    {isRevealed && (
                      <div style={{ animation: "fadeIn 0.2s ease" }}>
                        {(word.pinyin || word.ipa) && <div className="word-pinyin" style={{ marginTop: 4 }}>{word.pinyin || word.ipa}</div>}
                        <div className="word-meaning" style={{ marginTop: 2 }}>{isChinese ? word.english : word.chinese}</div>
                        {(word.example || word.sentence) && (
                          <div style={{ marginTop: 6, fontSize: 13, color: "var(--text-secondary)", fontStyle: "italic", padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.06)" }}>
                            💬 {word.example || word.sentence}
                          </div>
                        )}
                        {word.category && <div style={{ display: "inline-block", marginTop: 6, padding: "2px 10px", borderRadius: 20, background: "rgba(129, 140, 248, 0.2)", color: "rgba(129, 140, 248, 0.9)", fontSize: 11, fontWeight: 600 }}>{word.category}</div>}
                      </div>
                    )}
                    {!isRevealed && <div style={{ marginTop: 6, fontSize: 12, color: "var(--text-tertiary)", opacity: 0.6 }}>👆 点击查看详情</div>}
                  </div>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveKnown(word);
                    }}
                    style={{
                      whiteSpace: "nowrap",
                      alignSelf: "flex-start",
                      marginLeft: 8,
                      flexShrink: 0,
                    }}
                  >
                    ✕ 移除
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <ConfirmModal
        show={showClearConfirm}
        title="清空已认识列表"
        message="确定要清空所有已认识的单词吗？此操作不可恢复。"
        danger
        confirmText="清空"
        onConfirm={handleClearKnown}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
}

