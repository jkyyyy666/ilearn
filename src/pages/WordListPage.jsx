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
 * 支持批量删除
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

  // 批量删除状态
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [batchConfirm, setBatchConfirm] = useState(false);

  const allWords = words.getAllWords(lang);
  const favorites = words.getFavorites(lang);

  const filtered = useMemo(() => {
    let result = allWords;
    if (category) result = result.filter((w) => w.category === category);
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((w) => {
        const main = (isChinese ? w.chinese : w.english) || "";
        const secondary = (isChinese ? w.pinyin : w.ipa) || "";
        const translation = (isChinese ? w.english : w.chinese) || "";
        return main.toLowerCase().includes(q) || secondary.toLowerCase().includes(q) || translation.toLowerCase().includes(q);
      });
    }
    return result;
  }, [allWords, category, search, isChinese]);

  const handleDelete = useCallback(() => {
    if (deleteTarget) {
      words.deleteWord(lang, deleteTarget.id);
      addToast("已删除", "success");
      setDeleteTarget(null);
    }
  }, [deleteTarget, words, lang, addToast]);

  const handleEditSave = useCallback(() => {
    if (editWord) {
      words.updateWord(lang, editWord.id, editWord);
      addToast("已更新", "success");
      setEditWord(null);
    }
  }, [editWord, words, lang, addToast]);

  // 批量选择切换
  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // 全选/取消全选
  const toggleSelectAll = useCallback(() => {
    const customIds = filtered.filter((w) => w.id?.startsWith("custom_")).map((w) => w.id);
    setSelectedIds((prev) => {
      if (prev.size > 0 && customIds.every((id) => prev.has(id))) return new Set();
      return new Set(customIds);
    });
  }, [filtered]);

  // 执行批量删除
  const handleBatchDelete = useCallback(() => {
    selectedIds.forEach((id) => words.deleteWord(lang, id));
    addToast("已批量删除 " + selectedIds.size + " 个单词", "success");
    setSelectedIds(new Set());
    setBatchMode(false);
    setBatchConfirm(false);
  }, [selectedIds, words, lang, addToast]);

  // 进入/退出批量模式
  const toggleBatchMode = useCallback(() => {
    if (batchMode) {
      setSelectedIds(new Set());
    }
    setBatchMode((prev) => !prev);
  }, [batchMode]);

  const categories = DEFAULT_CATEGORIES[lang] || [];
  const customFiltered = filtered.filter((w) => w.id?.startsWith("custom_"));
  const selectedCount = selectedIds.size;

  return (
    <div>
      <ToastContainer toasts={toasts} removeToast={() => setToasts([])} />

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder={isChinese ? "🔍 搜索中文、拼音或英文..." : "🔍 Search English, IPA or Chinese..."}
      />

      <CategoryFilter categories={categories} active={category} onChange={setCategory} />

      {/* 操作栏 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          共 {filtered.length} 个单词
          {search && "（匹配 \"" + search + "\"）"}
          {category && " | " + category}
        </div>
        <button
          className={"btn btn-sm " + (batchMode ? "btn-danger" : "btn-secondary")}
          onClick={toggleBatchMode}
        >
          {batchMode ? "取消选择" : "☑️ 批量删除"}
        </button>
      </div>

      {/* 批量操作工具栏 */}
      {batchMode && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 14px", borderRadius: 12, marginBottom: 12,
          background: "rgba(79, 70, 229, 0.08)", border: "1px solid rgba(79, 70, 229, 0.2)",
        }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={customFiltered.length > 0 && customFiltered.every((w) => selectedIds.has(w.id))}
              onChange={toggleSelectAll}
              style={{ width: 16, height: 16 }}
            />
            全选
          </label>
          <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>已选 {selectedCount} 项</span>
          {selectedCount > 0 && (
            <button
              className="btn btn-sm btn-danger"
              onClick={() => setBatchConfirm(true)}
              style={{ marginLeft: "auto" }}
            >
              🗑️ 删除 {selectedCount} 项
            </button>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={search ? "🔍" : "📖"}
          title={search ? "没有找到匹配的单词" : "还没有单词"}
          description={search ? "试试其他关键词" : "点击「添加」按钮添加你的第一个单词"}
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
              onEdit={!batchMode && word.id?.startsWith("custom_") ? setEditWord : undefined}
              onDelete={!batchMode && word.id?.startsWith("custom_") ? () => setDeleteTarget(word) : undefined}
              selected={batchMode ? selectedIds.has(word.id) : undefined}
              onToggleSelect={batchMode ? toggleSelect : undefined}
            />
          ))}
        </div>
      )}

      {/* 单个删除确认 */}
      <ConfirmModal
        show={!!deleteTarget}
        title="删除单词"
        message={"确定要删除「" + (isChinese ? deleteTarget?.chinese : deleteTarget?.english) + "」吗？此操作不可恢复。"}
        danger
        confirmText="删除"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* 批量删除确认 */}
      <ConfirmModal
        show={batchConfirm}
        title="批量删除"
        message={"确定要删除选中的 " + selectedCount + " 个单词吗？此操作不可恢复。"}
        danger
        confirmText={"删除 " + selectedCount + " 项"}
        onConfirm={handleBatchDelete}
        onCancel={() => setBatchConfirm(false)}
      />

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
              <input className="input-field" value={word.chinese || ""} onChange={(e) => onChange({ chinese: e.target.value })} />
            </div>
            <div className="input-group" style={{ marginBottom: 12 }}>
              <label>拼音</label>
              <input className="input-field" value={word.pinyin || ""} onChange={(e) => onChange({ pinyin: e.target.value })} />
            </div>
            <div className="input-group" style={{ marginBottom: 12 }}>
              <label>英文释义 *</label>
              <input className="input-field" value={word.english || ""} onChange={(e) => onChange({ english: e.target.value })} />
            </div>
            <div className="input-group" style={{ marginBottom: 12 }}>
              <label>例句</label>
              <textarea className="input-field" value={word.example || ""} onChange={(e) => onChange({ example: e.target.value })} />
            </div>
            <div className="input-group" style={{ marginBottom: 12 }}>
              <label>分类</label>
              <input className="input-field" value={word.category || ""} onChange={(e) => onChange({ category: e.target.value })} />
            </div>
          </>
        ) : (
          <>
            <div className="input-group" style={{ marginBottom: 12 }}>
              <label>English *</label>
              <input className="input-field" value={word.english || ""} onChange={(e) => onChange({ english: e.target.value })} />
            </div>
            <div className="input-group" style={{ marginBottom: 12 }}>
              <label>IPA</label>
              <input className="input-field" value={word.ipa || ""} onChange={(e) => onChange({ ipa: e.target.value })} />
            </div>
            <div className="input-group" style={{ marginBottom: 12 }}>
              <label>中文释义 *</label>
              <input className="input-field" value={word.chinese || ""} onChange={(e) => onChange({ chinese: e.target.value })} />
            </div>
            <div className="input-group" style={{ marginBottom: 12 }}>
              <label>例句</label>
              <textarea className="input-field" value={word.sentence || ""} onChange={(e) => onChange({ sentence: e.target.value })} />
            </div>
            <div className="input-group" style={{ marginBottom: 12 }}>
              <label>Category</label>
              <input className="input-field" value={word.category || ""} onChange={(e) => onChange({ category: e.target.value })} />
            </div>
          </>
        )}
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button className="btn btn-secondary" onClick={onCancel} style={{ flex: 1 }}>取消</button>
          <button className="btn btn-primary" onClick={onSave} style={{ flex: 1 }}>保存</button>
        </div>
      </div>
    </div>
  );
}
