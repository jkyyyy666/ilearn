import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import LanguageLayout from "./components/LanguageLayout";
import Home from "./pages/Home";
import WordListPage from "./pages/WordListPage";
import AddWordPage from "./pages/AddWordPage";
import FavoritesPage from "./pages/FavoritesPage";
import QuizPage from "./pages/QuizPage";
import WrongBookPage from "./pages/WrongBookPage";
import KnownWordsPage from "./pages/KnownWordsPage";
import StatsPage from "./pages/StatsPage";
import GithubSyncPage from "./pages/GithubSyncPage";

/**
 * 应用根组件
 * 定义路由结构
 */
export default function App() {
  return (
    <Routes>
      {/* 首页 - 独立布局 */}
      <Route path="/" element={<Home />} />

      {/* 语言模块 - 共享布局 */}
      <Route element={<Layout />}>
        {/* 中文学习 */}
        <Route path="chinese" element={<LanguageLayout />}>
          <Route index element={<Navigate to="words" replace />} />
          <Route path="words" element={<WordListPage />} />
          <Route path="add" element={<AddWordPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="quiz" element={<QuizPage />} />
          <Route path="known" element={<KnownWordsPage />} />
          <Route path="wrong" element={<WrongBookPage />} />
          <Route path="stats" element={<StatsPage />} />
          <Route path="sync" element={<GithubSyncPage />} />
        </Route>

        {/* 英文学习 */}
        <Route path="english" element={<LanguageLayout />}>
          <Route index element={<Navigate to="words" replace />} />
          <Route path="words" element={<WordListPage />} />
          <Route path="add" element={<AddWordPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="quiz" element={<QuizPage />} />
          <Route path="known" element={<KnownWordsPage />} />
          <Route path="wrong" element={<WrongBookPage />} />
          <Route path="stats" element={<StatsPage />} />
          <Route path="sync" element={<GithubSyncPage />} />
        </Route>
      </Route>

      {/* 404 重定向到首页 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
