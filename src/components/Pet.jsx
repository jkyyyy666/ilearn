import React, { useState, useEffect, useCallback } from "react";
import "./pet.css";

/**
 * 团子小精灵 - 点击会逃跑
 */
export default function Pet() {
  const [position, setPosition] = useState(() => 15 + Math.random() * 55);
  const [isHappy, setIsHappy] = useState(false);
  const [isHungry, setIsHungry] = useState(false);
  const [hearts, setHearts] = useState([]);
  const [isWalking, setIsWalking] = useState(false);
  const [isScared, setIsScared] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [sweats, setSweats] = useState([]);

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

  // 随机走动
  useEffect(() => {
    const walk = () => {
      if (isScared) return;
      setIsWalking(true);
      setPosition(5 + Math.random() * 78);
      setTimeout(() => setIsWalking(false), 2800);
    };
    const interval = setInterval(walk, 10000 + Math.random() * 14000);
    return () => clearInterval(interval);
  }, [isScared]);

  // 喂食
  useEffect(() => {
    const handleFeed = () => {
      const emojis = ["❤️", "💖", "💕", "✨", "⭐"];
      const newHearts = Array.from({ length: 5 }, (_, i) => ({
        id: Date.now() + i,
        x: 15 + Math.random() * 70,
        delay: i * 180,
        emoji: emojis[i],
      }));
      setHearts(prev => [...prev, ...newHearts]);
      setIsHungry(false);
      setIsHappy(true);
      setTimeout(() => setIsHappy(false), 3000);
      setTimeout(() => setHearts([]), 2600);
    };
    window.addEventListener("pet-feed", handleFeed);
    return () => window.removeEventListener("pet-feed", handleFeed);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => { setIsHungry(!checkFedToday()); }, 300000);
    return () => clearInterval(interval);
  }, [checkFedToday]);

  // ===== 点击逃跑 =====
  const handleClick = useCallback(() => {
    if (isScared) return;

    setIsScared(true);
    setIsRunning(true);

    // 生成汗滴
    const newSweats = Array.from({ length: 3 }, (_, i) => ({
      id: Date.now() + i,
      x: 30 + Math.random() * 40,
      delay: i * 150,
    }));
    setSweats(prev => [...prev, ...newSweats]);

    // 快速逃跑到随机位置
    const newX = 5 + Math.random() * 78;
    setPosition(newX);

    setTimeout(() => {
      setIsScared(false);
      setIsRunning(false);
      setSweats([]);
    }, 1200);
  }, [isScared]);

  const imgClass = isRunning ? "pet-img scared"
    : isWalking ? "pet-img walking"
    : isHappy ? "pet-img happy"
    : isHungry ? "pet-img hungry"
    : "pet-img";

  const wrapperClass = "pet-wrapper" + (isRunning ? " running" : "") + (isScared ? " scared" : "");

  const imgUrl = import.meta.env.BASE_URL + "pet/star-guardian.svg";

  return (
    <div className={wrapperClass} style={{ left: position + "%" }}>
      <div className="pet-canvas" onClick={handleClick}>

        {hearts.map(h => (
          <span key={h.id} className="pet-heart"
            style={{ left: h.x + "%", animationDelay: h.delay + "ms" }}>
            {h.emoji}
          </span>
        ))}

        {sweats.map(s => (
          <span key={s.id} className="pet-sweat"
            style={{ left: s.x + "%", animationDelay: s.delay + "ms" }}>
            💦
          </span>
        ))}

        <img
          src={imgUrl}
          className={imgClass}
          alt="小精灵"
          draggable={false}
        />
      </div>
    </div>
  );
}
