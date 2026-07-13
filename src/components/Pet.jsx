import React, { useState, useEffect, useCallback } from "react";
import "./pet.css";

/**
 * 圆头可爱小精灵
 * 圆圆的大脑袋 + 小身体，日系可爱风格
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
    const interval = setInterval(blink, 2000 + Math.random() * 4500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const walk = () => {
      setIsWalking(true);
      setPosition(6 + Math.random() * 76);
      setTimeout(() => setIsWalking(false), 2800);
    };
    const interval = setInterval(walk, 10000 + Math.random() * 14000);
    return () => clearInterval(interval);
  }, []);

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
      setTimeout(() => { setIsHappy(false); setEyeHappy(false); }, 3000);
      setTimeout(() => setHearts([]), 2600);
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

        {hearts.map(h => (
          <span key={h.id} className="pet-heart"
            style={{ left: h.x + "%", animationDelay: h.delay + "ms" }}>
            {h.emoji}
          </span>
        ))}

        <span className="pet-sparkle s1">✦</span>
        <span className="pet-sparkle s2">✧</span>
        <span className="pet-sparkle s3">✦</span>
        <span className="pet-sparkle s4">✧</span>

        {/* 👂 耳朵 */}
        <div className="pet-ears">
          <div className="pet-ear left" />
          <div className="pet-ear right" />
        </div>

        {/* 🤚 手臂 */}
        <div className="pet-arms">
          <div className="pet-arm left" />
          <div className="pet-arm right" />
        </div>

        {/* 🔵 圆头 */}
        <div className="pet-head" style={headAnim}>

          <div className="pet-eyes">
            <div className={"pet-eye" + (isBlinking ? " blink" : eyeHappy ? " happy" : "")} />
            <div className={"pet-eye" + (isBlinking ? " blink" : eyeHappy ? " happy" : "")} />
          </div>

          <div className="pet-cheek left" />
          <div className="pet-cheek right" />

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
        <div className="pet-body-wrap">
          <div className="pet-body" />
          <div className="pet-legs">
            <div className={"pet-leg" + (isWalking ? " walk" : "")} />
            <div className={"pet-leg" + (isWalking ? " walk-r" : "")} />
          </div>
        </div>

      </div>
    </div>
  );
}
