import React, { useState, useEffect, useCallback } from "react";
import "./pet.css";

/**
 * 泡泡玛特星星人精灵 v2
 * 优化：更圆润的星星、立体感渐变、弯笑眼、高光瞳
 */
export default function Pet() {
  const [position, setPosition] = useState(() => 15 + Math.random() * 58);
  const [isHappy, setIsHappy] = useState(false);
  const [isHungry, setIsHungry] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [hearts, setHearts] = useState([]);
  const [isWalking, setIsWalking] = useState(false);
  const [eyeHappy, setEyeHappy] = useState(false);

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

  // 眨眼
  useEffect(() => {
    const blink = () => { setIsBlinking(true); setTimeout(() => setIsBlinking(false), 140); };
    const interval = setInterval(blink, 1800 + Math.random() * 5000);
    return () => clearInterval(interval);
  }, []);

  // 随机走动
  useEffect(() => {
    const walk = () => {
      setIsWalking(true);
      setPosition(6 + Math.random() * 76);
      setTimeout(() => setIsWalking(false), 2800);
    };
    const interval = setInterval(walk, 9000 + Math.random() * 15000);
    return () => clearInterval(interval);
  }, []);

  // 监听喂食
  useEffect(() => {
    const handleFeed = () => {
      const emojis = ["❤️", "💖", "💕", "✨", "💗", "⭐", "🌸"];
      const newHearts = Array.from({ length: 7 }, (_, i) => ({
        id: Date.now() + i,
        x: 5 + Math.random() * 90,
        delay: i * 160,
        emoji: emojis[i % emojis.length],
      }));
      setHearts(prev => [...prev, ...newHearts]);
      setIsHungry(false);
      setIsHappy(true);
      setEyeHappy(true);
      setTimeout(() => { setIsHappy(false); setEyeHappy(false); }, 3200);
      setTimeout(() => setHearts([]), 2800);
    };
    window.addEventListener("pet-feed", handleFeed);
    return () => window.removeEventListener("pet-feed", handleFeed);
  }, []);

  // 定时检查
  useEffect(() => {
    const interval = setInterval(() => { setIsHungry(!checkFedToday()); }, 300000);
    return () => clearInterval(interval);
  }, [checkFedToday]);

  // 头部动画
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

        {/* 💕 心形 */}
        {hearts.map(h => (
          <span key={h.id} className="pet-heart"
            style={{ left: h.x + "%", animationDelay: h.delay + "ms" }}>
            {h.emoji}
          </span>
        ))}

        {/* 💫 装饰星星 */}
        <span className="pet-sparkle s1">✦</span>
        <span className="pet-sparkle s2">✧</span>
        <span className="pet-sparkle s3">✦</span>
        <span className="pet-sparkle s4">✧</span>

        {/* 🤚 手臂 */}
        <div className="pet-arm left" />
        <div className="pet-arm right" />

        {/* ⭐ 星星头 */}
        <div className="pet-head" style={headAnim}>

          {/* 👁️ 眼睛 */}
          <div className="pet-eyes">
            <div className={"pet-eye" + (isBlinking ? " blink" : eyeHappy ? " happy" : "")} />
            <div className={"pet-eye" + (isBlinking ? " blink" : eyeHappy ? " happy" : "")} />
          </div>

          {/* 🥰 腮红 */}
          <div className="pet-cheek left" />
          <div className="pet-cheek right" />

          {/* 😊 微笑 */}
          <div className="pet-mouth">
            <svg width="24" height="10" viewBox="0 0 24 10">
              <path
                d={isHappy ? "M5,6 Q12,11 19,6" : "M7,5 Q12,8 17,5"}
                stroke={isHappy ? "#E06080" : "#D4607A"}
                strokeWidth={isHappy ? "2.5" : "2"}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
        </div>

        {/* 📦 身体 */}
        <div className="pet-body" />

        {/* 🦶 脚 */}
        <div className="pet-legs">
          <div className={"pet-leg" + (isWalking ? " walk" : "")} />
          <div className={"pet-leg" + (isWalking ? " walk-r" : "")} />
        </div>

      </div>
    </div>
  );
}
