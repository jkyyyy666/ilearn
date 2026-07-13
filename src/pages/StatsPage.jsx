import React, { useState, useCallback, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { useWords } from "../context/WordContext";
import ProgressBar from "../components/ProgressBar";
import ConfirmModal from "../components/ConfirmModal";
import ToastContainer, { useToastManager } from "../components/Toast";
import { exportData, importData, clearAllData, downloadFile } from "../utils/exportImport";

/**
 * 学习统计 + 数据管理页面
 * 展示学习统计数据，支持数据导入/导出
 */
export default function StatsPage() {
  const { lang } = useOutletContext();
  const isChinese = lang === "chinese";
  const words = useWords();

  const [toasts, setToasts] = useState([]);
  const { addToast } = useToastManager(setToasts);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef(null);

  const stats = words.getStats(lang);
  const dailyGoal = parseInt(localStorage.getItem("cl_daily_goal") || "10");

  // 学习日历数据（最近30天）
  const calendarData = getCalendarData(words.getQuizHistory(lang));

  // 导出数据
  const handleExport = useCallback(() => {
    const json = exportData(lang);
    const filename = `${lang}_vocab_backup_${new Date().toISOString().slice(0, 10)}.json`;
    downloadFile(json, filename);
    addToast("数据导出成功", "success");
  }, [lang, addToast]);

  // 导入数据
  const handleImport = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = importData(event.target.result, lang);
        if (result.success) {
          addToast(result.message, "success");
          // 强制刷新
          window.location.reload();
        } else {
          addToast(result.message, "error");
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [lang, addToast]
  );

  // 清空数据
  const handleClear = useCallback(() => {
    clearAllData(lang);
    addToast("数据已清空", "info");
    setShowClearConfirm(false);
    // 强制刷新
    window.location.reload();
  }, [lang, addToast]);

  const flag = isChinese ? "🇨🇳" : "🇺🇸";
  const langName = isChinese ? "中文" : "English";

  return (
    <div>
      <ToastContainer toasts={toasts} />

      {/* ===== 统计卡片 ===== */}
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
        📊 {langName}学习统计
      </h3>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div className="stat-card">
          <div className="stat-value">{stats.totalWords}</div>
          <div className="stat-label">总单词数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.favoriteCount}</div>
          <div className="stat-label">收藏数量</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalQuizzes}</div>
          <div className="stat-label">测验次数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: stats.avgRate >= 70 ? "var(--success)" : stats.avgRate >= 40 ? "var(--warning)" : "var(--danger)" }}>
            {stats.avgRate}%
          </div>
          <div className="stat-label">平均正确率</div>
        </div>
      </div>

      {/* 进度条 */}
      <div className="card" style={{ marginBottom: 16 }}>
        <ProgressBar
          value={Math.min(calendarData.thisMonth, dailyGoal * 30)}
          max={dailyGoal * 30}
          label={`📈 本月学习进度（已学 ${calendarData.thisMonth} 天）`}
          showPercent={false}
        />
      </div>

      {/* 连续学习 */}
      <div className="card" style={{ marginBottom: 16, textAlign: "center" }}>
        <div style={{ fontSize: 36, fontWeight: 800, color: "var(--primary)" }}>
          🔥 {stats.streak}
        </div>
        <div style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>
          连续学习天数
        </div>
      </div>

      {/* 学习日历 */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>📅 最近学习记录</h4>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {calendarData.days.map((day, i) => (
            <div
              key={i}
              title={day.date}
              style={{
                width: 14,
                height: 14,
                borderRadius: 3,
                background: day.studied ? "var(--primary)" : "var(--border)",
                opacity: day.studied ? 1 : 0.4,
                transition: "all 0.2s",
              }}
            />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "var(--text-tertiary)" }}>
          <span>30 天前</span>
          <span>今天</span>
        </div>
      </div>

      {/* 详细统计 */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-light)" }}>
          <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>内置词汇</span>
          <span style={{ fontWeight: 600 }}>{stats.builtinCount}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-light)" }}>
          <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>自定义词汇</span>
          <span style={{ fontWeight: 600 }}>{stats.customCount}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
          <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>错题数量</span>
          <span style={{ fontWeight: 600, color: stats.wrongCount > 0 ? "var(--danger)" : "var(--success)" }}>
            {stats.wrongCount}
          </span>
        </div>
      </div>

      {/* ===== 数据管理 ===== */}
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, marginTop: 20, display: "flex", alignItems: "center", gap: 6 }}>
        💾 数据管理
      </h3>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button className="btn btn-primary" onClick={handleExport} style={{ width: "100%" }}>
            📤 导出 {langName} 数据 (JSON)
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => fileInputRef.current?.click()}
            style={{ width: "100%" }}
          >
            📥 导入 {langName} 数据
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: "none" }}
          />

          <button
            className="btn btn-danger"
            onClick={() => setShowClearConfirm(true)}
            style={{ width: "100%" }}
          >
            🗑️ 清空 {langName} 数据
          </button>
        </div>

        <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 12, textAlign: "center" }}>
          建议定期导出备份，防止数据丢失
        </p>
      </div>

      <ConfirmModal
        show={showClearConfirm}
        title="清空全部数据"
        message={`确定要清空所有${langName}数据吗？包括单词、收藏、测验记录和错题。此操作不可恢复！`}
        danger
        confirmText="确认清空"
        onConfirm={handleClear}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
}

/**
 * 获取日历数据
 * @param {Array} history - 测验历史
 * @returns {{ days: Array, thisMonth: number }}
 */
function getCalendarData(history) {
  const days = [];
  let thisMonth = 0;

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10);

    const studied = history.some((r) => {
      const rDate = new Date(r.date).toISOString().slice(0, 10);
      return rDate === dateStr;
    });

    days.push({ date: dateStr, studied });

    const now = new Date();
    if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
      if (studied) thisMonth++;
    }
  }

  return { days, thisMonth };
}
