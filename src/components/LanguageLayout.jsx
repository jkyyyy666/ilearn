import React from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

/**
 * 语言模块布局
 * 提供子页面导航（单词库、添加、收藏、测验、错题本、统计）
 */
export default function LanguageLayout() {
  const location = useLocation();
  const lang = location.pathname.split("/")[1] || "chinese";
  const isChinese = lang === "chinese";
  const navigate = useNavigate();
  const langLabel = isChinese ? "中文" : "English";
  const flag = isChinese ? "🇨🇳" : "🇺🇸";

  const tabs = [
    { to: `/${lang}/words`, icon: "📖", label: "单词库" },
    { to: `/${lang}/add`, icon: "➕", label: "添加" },
    { to: `/${lang}/favorites`, icon: "⭐", label: "收藏" },
    { to: `/${lang}/quiz`, icon: "🎯", label: "测验" },
    { to: `/${lang}/known`, icon: "✅", label: "已认识" },
    { to: `/${lang}/wrong`, icon: "📝", label: "错题" },
    { to: `/${lang}/stats`, icon: "📊", label: "统计" },
  ];

  return (
    <div>
      {/* 页面标题 + 返回 */}
      <div
        style={{
          padding: "16px 16px 0",
          maxWidth: "var(--max-width)",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <button className="back-btn" onClick={() => navigate("/")}>
          ← 返回首页
        </button>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {flag} {langLabel}学习
        </h2>
      </div>

      {/* 子导航 */}
      <div
        style={{
          display: "flex",
          gap: 4,
          padding: "0 16px",
          overflowX: "auto",
          maxWidth: "var(--max-width)",
          margin: "0 auto",
          width: "100%",
          paddingBottom: 12,
        }}
      >
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `btn btn-sm ${isActive ? "btn-primary" : "btn-secondary"}`
            }
            style={{
              whiteSpace: "nowrap",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            {tab.icon} {tab.label}
          </NavLink>
        ))}
      </div>

      {/* 子页面内容 */}
      <div className="page" style={{ paddingTop: 8 }}>
        <Outlet context={{ lang }} />
      </div>
    </div>
  );
}
