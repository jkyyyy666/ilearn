import React, { useState, useEffect, useRef, useCallback } from "react";
import "./pet.css";

/**
 * 可爱团子小精灵宠物组件
 * 在页面中浮动，学习单词 = 喂食
 * 有开心/饥饿/行走/眨眼等丰富动画
 */
export default function Pet() {
  const [position, setPosition] = useState(() => 20 + Math.random() * 55);
  const [isHappy, setIsHappy] = useState(false);
  const [isHungry, setIsHungry] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [hearts, setHearts] = useState([]);
  const [mouthClass, setMouthClass] = useState("");
  const [isWalking, setIsWalking] = useState(false);

  // ===== 检查今天是否已学习 =====
  const checkFedToday = useCallback(() => {
    try {
      const langs = ["chinese", "english"];
      for (const lang of langs) {
        const history = JSON.parse(localStorage.getItem(lang + "_quiz_history") || "[]");
        const today = new Date().toDateString();
        if (history.some((r) => new Date(r.date).toDateString() === today)) return true;
        const words = JSON.parse(localStorage.getItem(lang + "_words") || "[]");
        if (words.some((w) => new Date(w.createdAt).toDateString() === today)) return true;
      }
      return false;
    } catch { return false; }
  }, []);

  // 初始化状态
  useEffect(() => {
    const fed = checkFedToday();
    setIsHungry(!fed);
    setMouthClass(fed ? "" : "hungry");
  }, [checkFedToday]);

  // ===== 眨眼 =====
  useEffect(() => {
    const blink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    };
    const interval = setInterval(blink, 2500 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, []);

  // ===== 随机走动 =====
  useEffect(() => {
    const walk = () => {
      setIsWalking(true);
      const newX = 10 + Math.random() * 72;
      setPosition(newX);
      setTimeout(() => setIsWalking(false), 2500);
    };
    const interval = setInterval(walk, 10000 + Math.random() * 14000);
    return () => clearInterval(interval);
  }, []);

  // ===== 监听喂食 =====
  useEffect(() => {
    const handleFeed = () => {
      const newHearts = Array.from({ length: 5 }, (_, i) => ({
        id: Date.now() + i,
        x: 15 + Math.random() * 70,
        delay: i * 200,
        emoji: ["❤️", "💖", "💕", "✨", "💗"][i],
      }));
      setHearts((prev) => [...prev, ...newHearts]);
      setIsHungry(false);
      setIsHappy(true);
      setMouthClass("happy");

      setTimeout(() => {
        setIsHappy(false);
        setMouthClass("");
      }, 3500);
      setTimeout(() => setHearts([]), 2800);
    };

    window.addEventListener("pet-feed", handleFeed);
    return () => window.removeEventListener("pet-feed", handleFeed);
  }, []);

  // ===== 定时检查喂食状态 =====
  useEffect(() => {
    const interval = setInterval(() => {
      const fed = checkFedToday();
      setIsHungry(!fed);
      if (!fed && !isHappy) setMouthClass("hungry");
      else if (!isHappy) setMouthClass("");
    }, 300000);
    return () => clearInterval(interval);
  }, [checkFedToday, isHappy]);

  // ===== 动画样式 =====
  const bodyAnim = isWalking
    ? { animation: "petWalk 0.5s ease-in-out infinite" }
    : isHappy
    ? { animation: "petHappyJump 0.6s ease-in-out" }
    : isHungry
    ? { animation: "petShiver 3s ease-in-out infinite" }
    : {};

  return (
    <div
      className="pet-wrapper"
      style={{ left: position + "%" }}
    >
      <div className="pet-canvas">
        {/* 💕 心形 */}
        {hearts.map((h) => (
          <span
            key={h.id}
            className="pet-heart"
            style={{ left: h.x + "%", animationDelay: h.delay + "ms" }}
          >
            {h.emoji}
          </span>
        ))}

        {/* ⭐ 星星头饰 */}
        <div className="pet-star">{isHappy ? "💖" : "⭐"}</div>

        {/* 👂 耳朵 */}
        <div className="pet-ears">
          <div className="pet-ear left" />
          <div className="pet-ear right" />
        </div>

        {/* 🍡 身体 */}
        <div className="pet-body" style={bodyAnim}>
          {/* 👣 小脚 */}
          {isWalking && (
            <>
              <div className="pet-foot left" />
              <div className="pet-foot right" />
            </>
          )}

          {/* 👁️ 眼睛 */}
          <div className="pet-eyes">
            <div className={"pet-eye" + (isBlinking ? " blink" : "")} />
            <div className={"pet-eye" + (isBlinking ? " blink" : "")} />
          </div>

          {/* 🥰 腮红 */}
          <div className="pet-blush left" />
          <div className="pet-blush right" />

          {/* 😊 嘴巴 */}
          <div className={"pet-mouth" + (mouthClass ? " " + mouthClass : "")} />
        </div>

        {/* 🔮 阴影 */}
        <div className="pet-shadow" />
      </div>
    </div>
  );
}
