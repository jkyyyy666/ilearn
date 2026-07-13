import React, { useState, useEffect, useCallback } from "react";
import "./pet.css";

/**
 * 星空小精灵 - 梦幻盲盒公仔风格
 * 圆头 / 深蓝渐变发 / 银河大眼 / 白色短裙 / 星星月亮环绕
 */
export default function Pet() {
  const [position, setPosition] = useState(() => 12 + Math.random() * 60);
  const [isHappy, setIsHappy] = useState(false);
  const [isHungry, setIsHungry] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [hearts, setHearts] = useState([]);
  const [isWalking, setIsWalking] = useState(false);
  const [eyeHappy, setEyeHappy] = useState(false);

  const checkFedToday = useCallback(() => {
    try {
      for (const lang of ["chinese", "english"]) {
        const h = JSON.parse(localStorage.getItem(lang + "_quiz_history") || "[]");
        const t = new Date().toDateString();
        if (h.some(r => new Date(r.date).toDateString() === t)) return true;
        const w = JSON.parse(localStorage.getItem(lang + "_words") || "[]");
        if (w.some(x => new Date(x.createdAt).toDateString() === t)) return true;
      }
    } catch {}
    return false;
  }, []);

  useEffect(() => { setIsHungry(!checkFedToday()); }, [checkFedToday]);

  useEffect(() => {
    const blink = () => { setIsBlinking(true); setTimeout(() => setIsBlinking(false), 140); };
    const interval = setInterval(blink, 1800 + Math.random() * 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const walk = () => {
      setIsWalking(true);
      setPosition(5 + Math.random() * 78);
      setTimeout(() => setIsWalking(false), 3000);
    };
    const interval = setInterval(walk, 10000 + Math.random() * 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleFeed = () => {
      const emojis = ["❤️", "💖", "💕", "✨", "💗", "⭐", "🌙"];
      const newHearts = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        x: 5 + Math.random() * 90,
        delay: i * 140,
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

  useEffect(() => {
    const interval = setInterval(() => { setIsHungry(!checkFedToday()); }, 300000);
    return () => clearInterval(interval);
  }, [checkFedToday]);

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

        {/* 全身光晕 */}
        <div className="pet-glow" />

        {/* 心形特效 */}
        {hearts.map(h => (
          <span key={h.id} className="pet-heart"
            style={{ left: h.x + "%", animationDelay: h.delay + "ms" }}>
            {h.emoji}
          </span>
        ))}

        {/* 🌙 月亮装饰 */}
        <div className="pet-moon">🌙</div>

        {/* ⭐ 环绕小星星 */}
        <span className="pet-star-deco d1">✦</span>
        <span className="pet-star-deco d2">✧</span>
        <span className="pet-star-deco d3">✦</span>
        <span className="pet-star-deco d4">✧</span>
        <span className="pet-star-deco d5">✦</span>
        <span className="pet-star-deco d6">✦</span>

        {/* 手臂 */}
        <div className="pet-arms">
          <div className="pet-arm left" />
          <div className="pet-arm right" />
        </div>

        {/* 头 */}
        <div className="pet-head" style={headAnim}>

          {/* 后面头发 */}
          <div className="pet-hair-back" />

          {/* 刘海 */}
          <div className="pet-bangs" />

          {/* ⭐ 星星发饰 */}
          <div className="pet-hairpin">⭐</div>

          {/* 眼睛 */}
          <div className="pet-eyes">
            <div className={"pet-eye" + (isBlinking ? " blink" : eyeHappy ? " happy" : "")}>
              <span className="eye-sparkle2" />
            </div>
            <div className={"pet-eye" + (isBlinking ? " blink" : eyeHappy ? " happy" : "")}>
              <span className="eye-sparkle2" />
            </div>
          </div>

          {/* 腮红 */}
          <div className="pet-cheek left" />
          <div className="pet-cheek right" />

          {/* 微笑 */}
          <div className="pet-mouth">
            <svg width="24" height="10" viewBox="0 0 24 10">
              <path
                d={isHappy ? "M5,6 Q12,11 19,6" : "M7,5 Q12,8 17,5"}
                stroke={isHappy ? "#D4607A" : "#C06070"}
                strokeWidth={isHappy ? "2.5" : "2"}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
        </div>

        {/* 身体 + 裙子 */}
        <div className="pet-body">
          <div className="pet-torso" />
          <div className="pet-skirt">
            <span className="skirt-star s1">✦</span>
            <span className="skirt-star s2">✧</span>
            <span className="skirt-star s3">✦</span>
          </div>
          <div className="pet-legs">
            <div className={"pet-leg" + (isWalking ? " walk" : "")} />
            <div className={"pet-leg" + (isWalking ? " walk-r" : "")} />
          </div>
        </div>

      </div>
    </div>
  );
}
