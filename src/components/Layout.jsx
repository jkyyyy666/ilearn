import React from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import StarBackground from "./StarBackground";

/**
 * 全局布局组件
 * 包含顶部导航栏、底部 Tab 栏、主要内容区
 */
export default function Layout() {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <>
      <StarBackground />
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", background: "transparent" }}>
        {/* 顶部导航 */}
        <header
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "var(--header-height)",
            background: "rgba(15, 23, 42, 0.6)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            zIndex: 1000,
            backdropFilter: "blur(10px)",
          }}
        >
          <NavLink
            to="/"
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "white",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            🀄 婉儿中文学习日记
          </NavLink>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              className="btn-icon"
              onClick={toggleTheme}
              title={isDark ? "切换到浅色模式" : "切换到深色模式"}
              style={{ fontSize: 18, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white" }}
            >
              {isDark ? "☀️" : "🌙"}
            </button>
          </div>
        </header>

        {/* 主内容区 */}
        <main
          style={{
            flex: 1,
            paddingTop: "var(--header-height)",
            paddingBottom: isHome ? 0 : "80px",
          }}
        >
          <Outlet />
        </main>

        {/* 底部 Tab 栏（首页不显示） */}
        {!isHome && (
          <nav
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              background: "rgba(15, 23, 42, 0.7)",
              backdropFilter: "blur(12px)",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              zIndex: 1000,
              paddingBottom: "env(safe-area-inset-bottom, 0)",
            }}
          >
            {[
              { to: "/chinese", icon: "🇨🇳", label: "中文" },
              { to: "/english", icon: "🇺🇸", label: "English" },
            ].map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end
                className={({ isActive }) =>
                  `tab-item ${isActive ? "active" : ""}`
                }
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px 4px",
                  border: "none",
                  background: "none",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 10,
                  fontWeight: 500,
                  cursor: "pointer",
                  gap: 2,
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
              >
                <span style={{ fontSize: 22, lineHeight: 1 }}>{tab.icon}</span>
                <span>{tab.label}</span>
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </>
  );
}
