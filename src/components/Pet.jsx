import React, { useState, useEffect, useCallback } from "react";
import "./pet.css";

/**
 * 星空守护精灵
 * 使用 SVG 矢量图展示，二头身盲盒公仔风格
 */
export default function Pet() {
  const [position, setPosition] = useState(() => 15 + Math.random() * 55);
  const [isHappy, setIsHappy] = useState(false);
  const [isHungry, setIsHungry] = useState(false);
  const [hearts, setHearts] = useState([]);
  const [isWalking, setIsWalking] = useState(false);

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
    const walk = () => {
      setIsWalking(true);
      setPosition(5 + Math.random() * 78);
      setTimeout(() => setIsWalking(false), 2800);
    };
    const interval = setInterval(walk, 10000 + Math.random() * 14000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleFeed = () => {
      const emojis = ["❤️", "💖", "💕", "✨", "⭐", "🌙"];
      const newHearts = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        x: 10 + Math.random() * 80,
        delay: i * 150,
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

  // Build the SVG URL using BASE_URL for GitHub Pages support
  const imgUrl = import.meta.env.BASE_URL + "pet/star-guardian.svg";

  const imgClass = isWalking ? "pet-img walking"
    : isHappy ? "pet-img happy"
    : isHungry ? "pet-img hungry"
    : "pet-img";

  return (
    <div className="pet-wrapper" style={{ left: position + "%" }}>
      <div className="pet-canvas">

        {hearts.map(h => (
          <span key={h.id} className="pet-heart"
            style={{ left: h.x + "%", animationDelay: h.delay + "ms" }}>
            {h.emoji}
          </span>
        ))}

        <img
          src={imgUrl}
          className={imgClass}
          alt="星空守护精灵"
          draggable={false}
        />
      </div>
    </div>
  );
}
