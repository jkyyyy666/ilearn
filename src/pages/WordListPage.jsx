import React, { useState, useMemo, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { useWords } from "../context/WordContext";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import WordCard from "../components/WordCard";
import EmptyState from "../components/EmptyState";
import ConfirmModal from "../components/ConfirmModal";
import ToastContainer, { useToastManager } from "../components/Toast";
import { DEFAULT_CATEGORIES } from "../utils/constants";

/**
 * 单词库页面
 * 查看、搜索、筛选、编辑、删除所有单词
 */
export default function WordListPage() {
  const { lang } = useOutletContext();
  const isChinese = lang === "chinese";
  const words = useWords();

  const [toasts, setToasts] = useState([]);
  const { addToast } = useToastManager(setToasts);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editWord, setEditWord] = useState(null);

  // 获取所有单词
  const allWords = words.getAllWords(lang);
  const favorites = words.getFavorites(lang);

  // 筛选
  const filtered = useMemo(() => {
    let result = allWords;

    if (category) {
      result = result.filter((w) => w.category === category);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((w) => {
        const main = (isChinese ? w.chinese : w.english) || "";
        const secondary = (isChinese ? w.pinyin : w.ipa) || "";
        const translation = (isChinese ? w.english : w.chinese) || "";
        return (
          main.toLowerCase().includes(q) ||
          secondary.toLowerCase().includes(q) ||
          translation.toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [allWords, category, search, isChinese]);

  // 处理删除
  const handleDelete = useCallback(() => {
    if (deleteTarget) {
      words.deleteWord(lang, deleteTarget.id);
      addToast("已删除", "success");
      setDeleteTarget(null);
    }
  }, [deleteTarget, words, lang, addToast]);

  // 处理编辑保存
  const handleEditSave = useCallback(() => {
    if (editWord) {
      words.updateWord(lang, editWord.id, editWord);
      addToast("已更新", "success");
      setEditWord(null);
    }
  }, [editWord, words, lang, addToast]);

  const categories = DEFAULT_CATEGORIES[lang] || [];

  return (
    <div>
      <ToastContainer toasts={toasts} removeToast={() => setToasts([])} />

      {/* 搜索 */}
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder={
          isChinese ? "🔍 搜索中文、拼音或英文..." : "🔍 Search English, IPA or Chinese..."
        }
      />

      {/* 分类筛选 */}
      <CategoryFilter
        categories={categories}
        active={category}
        onChange={setCategory}
      />

      {/* 单词计数 */}
      <div
        style={{
          fontSize: 13,
          color: "var(--text-secondary)",
          marginBottom: 12,
        }}
      >
        共 {filtered.length} 个单词
        {search && `（匹配 "${search}"）`}
        {category && ` | ${category}`}
      </div>

      {/* 单词列表 */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={search ? "🔍" : "📖"}
          title={search ? "没有找到匹配的单词" : "还没有单词"}
          description={
            search
              ? "试试其他关键词"
              : "点击「添加」按钮添加你的第一个单词"
          }
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((word) => (
            <WordCard
              key={word.id}
              word={word}
              lang={lang}
              isFavorite={favorites.includes(word.id)}
              onToggleFav={() => words.toggleFavorite(lang, word.id)}
              onEdit={word.id?.startsWith("custom_") ? setEditWord : undefined}
              onDelete={
                word.id?.startsWith("custom_")
                  ? () => setDeleteTarget(word)
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {/* 删除确认 */}
      <ConfirmModal
        show={!!deleteTarget}
        title="删除单词"
        message={`确定要删除「${
          isChinese ? deleteTarget?.chinese : deleteTarget?.english
        }」吗？此操作不可恢复。`}
        danger
        confirmText="删除"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* 编辑弹窗 */}
      {editWord && (
        <EditModal
          word={editWord}
          lang={lang}
          onSave={handleEditSave}
          onCancel={() => setEditWord(null)}
          onChange={(updates) => setEditWord((prev) => ({ ...prev, ...updates }))}
        />
      )}
    </div>
  );
}

/**
 * 编辑单词弹窗
 */
function EditModal({ word, lang, onSave, onCancel, onChange }) {
  const isChinese = lang === "chinese";

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>✏️ 编辑单词</h2>

        {isChinese ? (
          <>
            <div className="input-group" style={{ marginBottom: 12 }}>
              <label>中文 *</label>
              <input
                className="input-field"
                value={word.chinese || ""}
                onChange={(e) => onChange({ chinese: e.target.value })}
              />
            </div>
            <div className="input-group" style={{ marginBottom: 12 }}>
              <label>拼音</label>
              <input
                className="input-field"
                value={word.pinyin || ""}
                onChange={(e) => onChange({ pinyin: e.target.value })}
              />
            </div>
            <div className="input-group" style={{ marginBottom: 12 }}>
              <label>英文释义 *</label>
              <input
                className="input-field"
                value={word.english || ""}
                onChange={(e) => onChange({ english: e.target.value })}
              />
            </div>
            <div className="input-group" style={{ marginBottom: 12 }}>
              <label>例句</label>
              <textarea
                className="input-field"
                value={word.example || ""}
                onChange={(e) => onChange({ example: e.target.value })}
              />
            </div>
            <div className="input-group" style={{ marginBottom: 12 }}>
              <label>分类</label>
              <input
                className="input-field"
                value={word.category || ""}
                onChange={(e) => onChange({ category: e.target.value })}
              />
            </div>
          </>
        ) : (
          <>
            <div className="input-group" style={{ marginBottom: 12 }}>
              <label>English *</label>
              <input
                className="input-field"
                value={word.english || ""}
                onChange={(e) => onChange({ english: e.target.value })}
              />
            </div>
            <div className="input-group" style={{ marginBottom: 12 }}>
              <label>IPA</label>
              <input
                className="input-field"
                value={word.ipa || ""}
                onChange={(e) => onChange({ ipa: e.target.value })}
              />
            </div>
            <div className="input-group" style={{ marginBottom: 12 }}>
              <label>中文释义 *</label>
              <input
                className="input-field"
                value={word.chinese || ""}
                onChange={(e) => onChange({ chinese: e.target.value })}
              />
            </div>
            <div className="input-group" style={{ marginBottom: 12 }}>
              <label>例句</label>
              <textarea
                className="input-field"
                value={word.sentence || ""}
                onChange={(e) => onChange({ sentence: e.target.value })}
              />
            </div>
            <div className="input-group" style={{ marginBottom: 12 }}>
              <label>Category</label>
              <input
                className="input-field"
                value={word.category || ""}
                onChange={(e) => onChange({ category: e.target.value })}
              />
            </div>
          </>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button className="btn btn-secondary" onClick={onCancel} style={{ flex: 1 }}>
            取消
          </button>
          <button className="btn btn-primary" onClick={onSave} style={{ flex: 1 }}>
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
