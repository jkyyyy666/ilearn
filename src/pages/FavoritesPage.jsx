import React, { useState, useMemo, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { useWords } from "../context/WordContext";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import WordCard from "../components/WordCard";
import EmptyState from "../components/EmptyState";
import ToastContainer, { useToastManager } from "../components/Toast";
import { DEFAULT_CATEGORIES } from "../utils/constants";

/**
 * 收藏页面
 * 展示所有收藏的单词
 */
export default function FavoritesPage() {
  const { lang } = useOutletContext();
  const isChinese = lang === "chinese";
  const words = useWords();

  const [toasts, setToasts] = useState([]);
  const { addToast } = useToastManager(setToasts);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  // 获取收藏单词
  const favWords = words.getFavoriteWords(lang);
  const favorites = words.getFavorites(lang);

  // 筛选
  const filtered = useMemo(() => {
    let result = favWords;

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
  }, [favWords, category, search, isChinese]);

  const handleToggleFav = useCallback(
    (wordId) => {
      words.toggleFavorite(lang, wordId);
      addToast("已更新收藏", "info");
    },
    [words, lang, addToast]
  );

  const categories = DEFAULT_CATEGORIES[lang] || [];

  return (
    <div>
      <ToastContainer toasts={toasts} />

      {/* 收藏总数 */}
      <div
        style={{
          fontSize: 14,
          color: "var(--text-secondary)",
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span>⭐</span>
        <span>
          共收藏 {favWords.length} 个单词
        </span>
      </div>

      {/* 搜索 */}
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder={
          isChinese
            ? "🔍 在收藏中搜索..."
            : "🔍 Search in favorites..."
        }
      />

      {/* 分类筛选 */}
      <CategoryFilter
        categories={categories}
        active={category}
        onChange={setCategory}
      />

      {/* 收藏列表 */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="⭐"
          title={
            favWords.length === 0
              ? "还没有收藏的单词"
              : "没有匹配的收藏"
          }
          description={
            favWords.length === 0
              ? "在单词库中点击 ☆ 收藏单词"
              : "试试其他筛选条件"
          }
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((word) => (
            <WordCard
              key={word.id}
              word={word}
              lang={lang}
              isFavorite={true}
              onToggleFav={() => handleToggleFav(word.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
