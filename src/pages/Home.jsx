import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ToastContainer, { useToastManager } from "../components/Toast";
import StarBackground from "../components/StarBackground";

/**
 * 首页
 * 展示两个学习入口
 */
export default function Home() {
  const navigate = useNavigate();
  const [toasts, setToasts] = useState([]);
  const { addToast } = useToastManager(setToasts);
  const [dailyGoal, setDailyGoal] = useState(() => {
    return parseInt(localStorage.getItem("cl_daily_goal") || "10");
  });

  return (
    <>
      <StarBackground />
      <div
        style={{
          minHeight: "100vh",
          position: "relative",
          background: "transparent",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
        }}
      >
        <ToastContainer toasts={toasts} />

        {/* Logo 区域 */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <img
            src="/bg/xinxin.jpg"
            alt="星星人"
            style={{
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              objectFit: "cover",
              marginBottom: "16px",
              boxShadow: "0 0 30px rgba(200, 180, 255, 0.4)",
              border: "3px solid rgba(255,255,255,0.2)",
            }}
          />
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: "#0F172A",
              marginBottom: 8,
            }}
          >
            婉❤️学习日记
          </h1>
          <p
            style={{
              fontSize: 16,
              color: "#475569",
              maxWidth: 300,
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            --天行健，君子以自强不息
          </p>
        </div>

        {/* 学习入口卡片 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            width: "100%",
            maxWidth: 360,
          }}
        >
          <button
            className="card"
            onClick={() => navigate("/chinese")}
            style={{
              padding: "28px 24px",
              cursor: "pointer",
              border: "2px solid rgba(255,255,255,0.1)",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: 20,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--primary-light)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              e.currentTarget.style.transform = "none";
            }}
          >
            <span style={{ fontSize: 48 }}>🇨🇳</span>
            <div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#0F172A",
                  marginBottom: 4,
                }}
              >
                中文学习
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
                词汇管理、测验、错题本、学习统计
              </div>
            </div>
          </button>

          <button
            className="card"
            onClick={() => navigate("/english")}
            style={{
              padding: "28px 24px",
              cursor: "pointer",
              border: "2px solid rgba(255,255,255,0.1)",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: 20,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--primary-light)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              e.currentTarget.style.transform = "none";
            }}
          >
            <span style={{ fontSize: 48 }}>🇺🇸</span>
            <div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#0F172A",
                  marginBottom: 4,
                }}
              >
                English Learning
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
                Vocabulary, Quizzes, Wrong Book, Statistics
              </div>
            </div>
          </button>
        </div>

        {/* 每日目标 */}
        <div
          className="card"
          style={{
            marginTop: 32,
            padding: "16px 20px",
            width: "100%",
            maxWidth: 360,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#475569",
              marginBottom: 8,
            }}
          >
            🎯 每日学习目标
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            {[5, 10, 15, 20, 30].map((n) => (
              <button
                key={n}
                className={`btn btn-sm ${
                  dailyGoal === n ? "btn-primary" : "btn-secondary"
                }`}
                onClick={() => {
                  setDailyGoal(n);
                  localStorage.setItem("cl_daily_goal", String(n));
                  addToast(`每日目标已设为 ${n} 个`, "success");
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* 底部信息 */}
        <div
          style={{
            marginTop: 40,
            fontSize: 12,
            color: "rgba(255,255,255,0.4)",
            textAlign: "center",
          }}
        >
          <p>数据存储在浏览器中，清除缓存会丢失数据</p>
          <p style={{ marginTop: 4 }}>建议定期导出备份</p>
        </div>
      </div>
    </>
  );
}
