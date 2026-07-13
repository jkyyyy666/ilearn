import React, { useState, useEffect, useCallback } from "react";
import "./pet.css";

/**
 * 泡泡玛特风格星星人小精灵
 * 五角星头 + 极简小身体，潮玩感设计
 */
export default function Pet() {
  const [position, setPosition] = useState(() => 15 + Math.random() * 60);
  const [isHappy, setIsHappy] = useState(false);
  const [isHungry, setIsHungry] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [hearts, setHearts] = useState([]);
  const [isWalking, setIsWalking] = useState(false);

  // ===== 检查今天是否已学习 =====
  const checkFedToday = useCallback(() => {
    try {
      for (const lang of ["chinese", "english"]) {
        const history = JSON.parse(localStorage.getItem(lang + "_quiz_history") || "[]");
        const today = new Date().toDateString();
        if (history.some(r => new Date(r.date).toDateString() === today)) return true;
        const words = JSON.parse(localStorage.getItem(lang + "_words") || "[]");
        if (words.some(w => new Date(w.createdAt).toDateString() === today)) return true;
      }
    } catch {}
    return false;
  }, []);

  useEffect(() => { setIsHungry(!checkFedToday()); }, [checkFedToday]);

  // ===== 眨眼 =====
  useEffect(() => {
    const blink = () => { setIsBlinking(true); setTimeout(() => setIsBlinking(false), 150); };
    const interval = setInterval(blink, 2000 + Math.random() * 5000);
    return () => clearInterval(interval);
  }, []);

  // ===== 随机走动 =====
  useEffect(() => {
    const walk = () => {
      setIsWalking(true);
      setPosition(8 + Math.random() * 74);
      setTimeout(() => setIsWalking(false), 3000);
    };
    const interval = setInterval(walk, 8000 + Math.random() * 16000);
    return () => clearInterval(interval);
  }, []);

  // ===== 监听喂食 =====
  useEffect(() => {
    const handleFeed = () => {
      const newHearts = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        x: 10 + Math.random() * 80,
        delay: i * 180,
        emoji: ["❤️", "💖", "💕", "✨", "💗", "⭐"][i],
      }));
      setHearts(prev => [...prev, ...newHearts]);
      setIsHungry(false);
      setIsHappy(true);
      setTimeout(() => setIsHappy(false), 3000);
      setTimeout(() => setHearts([]), 2500);
    };
    window.addEventListener("pet-feed", handleFeed);
    return () => window.removeEventListener("pet-feed", handleFeed);
  }, []);

  // ===== 定时检查 =====
  useEffect(() => {
    const interval = setInterval(() => {
      const fed = checkFedToday();
      setIsHungry(!fed);
    }, 300000);
    return () => clearInterval(interval);
  }, [checkFedToday]);

  // ===== 动画样式 =====
  const headAnim = isWalking
    ? { animation: "walkBounce 0.6s ease-in-out infinite" }
    : isHappy
    ? { animation: "happyBounce 0.6s ease-in-out" }
    : isHungry
    ? { animation: "hungryShake 3s ease-in-out infinite" }
    : {};

  return (
    <div className="pet-wrapper" style={{ left: position + "%" }}>
      <div className="pet-canvas">

        {/* 💕 心形特效 */}
        {hearts.map(h => (
          <span key={h.id} className="pet-heart" style={{ left: h.x + "%", animationDelay: h.delay + "ms" }}>
            {h.emoji}
          </span>
        ))}

        {/* ⭐ 装饰小星星 */}
        <span className="pet-sparkle s1">✦</span>
        <span className="pet-sparkle s2">✧</span>
        <span className="pet-sparkle s3">✦</span>

        {/* 🤚 手臂 */}
        <div className="pet-arm left" />
        <div className="pet-arm right" />

        {/* ⭐ 星星头 */}
        <div className="pet-head" style={headAnim}>
          {/* 👁️ 眼睛 */}
          <div className="pet-eyes">
            <div className={"pet-eye" + (isBlinking ? " blink" : "")} />
            <div className={"pet-eye" + (isBlinking ? " blink" : "")} />
          </div>

          {/* 🥰 腮红 */}
          <div className="pet-cheek left" />
          <div className="pet-cheek right" />

          {/* 😊 微笑 */}
          <div className={"pet-smile" + (isHappy ? " happy" : "")}>
            <svg width="24" height="10" viewBox="0 0 24 10" fill="none">
              <path
                d={isHappy ? "M6,6 Q12,10 18,6" : "M8,5 Q12,7 16,5"}
                stroke="#D4607A"
                strokeWidth={isHappy ? "2.5" : "2"}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
        </div>

        {/* 📦 小身体 */}
        <div className="pet-body" />

        {/* 🦶 小脚 */}
        <div className="pet-legs">
          <div className="pet-leg" />
          <div className="pet-leg" />
        </div>

      </div>
    </div>
  );
}
