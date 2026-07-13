import React, { useState, useEffect, useRef, useCallback } from "react";
import "./pet.css";

/**
 * 小精灵宠物组件
 * 在页面背景中浮动，学习单词 = 喂食
 * 有开心/饥饿/行走/眨眼等动画反馈
 */
export default function Pet() {
  const [position, setPosition] = useState(() => 30 + Math.random() * 40); // x 位置百分比
  const [isHappy, setIsHappy] = useState(false);   // 开心状态
  const [isHungry, setIsHungry] = useState(false);  // 饥饿状态
  const [isBlinking, setIsBlinking] = useState(false);
  const [hearts, setHearts] = useState([]);         // 心形列表
  const [antenna, setAntenna] = useState("⭐");     // 天线表情
  const [direction, setDirection] = useState(1);    // 面朝方向 1=右 -1=左
  const isWalking = useRef(false);

  // ===== 检查今天是否已学习 =====
  const checkFedToday = useCallback(() => {
    try {
      const langs = ["chinese", "english"];
      for (const lang of langs) {
        const history = JSON.parse(localStorage.getItem(lang + "_quiz_history") || "[]");
        const today = new Date().toDateString();
        if (history.some((r) => new Date(r.date).toDateString() === today)) {
          return true;
        }
        // 也检查自定义单词添加
        const words = JSON.parse(localStorage.getItem(lang + "_words") || "[]");
        if (words.some((w) => new Date(w.createdAt).toDateString() === today)) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // 初始化饥饿状态
  useEffect(() => {
    setIsHungry(!checkFedToday());
  }, [checkFedToday]);

  // ===== 眨眼动画 =====
  useEffect(() => {
    const blink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    };
    const interval = setInterval(blink, 3000 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, []);

  // ===== 行走动画 - 随机左右移动 =====
  useEffect(() => {
    const walk = () => {
      isWalking.current = true;
      const newX = 10 + Math.random() * 75; // 10%~85%
      setDirection(newX > position ? 1 : -1);
      setPosition(newX);
      setTimeout(() => {
        isWalking.current = false;
      }, 3000);
    };
    const interval = setInterval(walk, 8000 + Math.random() * 12000);
    return () => clearInterval(interval);
  }, [position]);

  // ===== 天线随机变化 =====
  useEffect(() => {
    const icons = ["⭐", "✨", "💫", "🌟", "🌸"];
    const interval = setInterval(() => {
      setAntenna(icons[Math.floor(Math.random() * icons.length)]);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // ===== 监听喂食事件 =====
  useEffect(() => {
    const handleFeed = () => {
      // 生成心形
      const newHearts = Array.from({ length: 4 }, (_, i) => ({
        id: Date.now() + i,
        x: 20 + Math.random() * 60,
        delay: i * 250,
        emoji: ["❤️", "💖", "💕", "✨"][i],
      }));
      setHearts((prev) => [...prev, ...newHearts]);
      setIsHungry(false);
      setIsHappy(true);
      setAntenna("💖");

      // 开心跳跃一段时间后恢复
      setTimeout(() => {
        setIsHappy(false);
        setAntenna("⭐");
      }, 4000);

      // 清除心形
      setTimeout(() => setHearts([]), 3000);
    };

    window.addEventListener("pet-feed", handleFeed);
    return () => window.removeEventListener("pet-feed", handleFeed);
  }, []);

  // ===== 每5分钟检查一次喂食状态 =====
  useEffect(() => {
    const interval = setInterval(() => {
      setIsHungry(!checkFedToday());
    }, 300000); // 5分钟
    return () => clearInterval(interval);
  }, [checkFedToday]);

  // ===== 行走样式 =====
  const walkStyle = isWalking.current
    ? { animation: "petWalk 0.6s ease-in-out infinite" }
    : {};

  // ===== 开心跳跃样式 =====
  const happyStyle = isHappy
    ? { animation: "petHappy 0.5s ease-in-out 3" }
    : {};

  return (
    <div
      className="pet-wrapper"
      style={{
        left: position + "%",
        transform: "translateX(-50%) scaleX(" + direction + ")",
      }}
    >
      <div className="pet-sprite">
        {/* 心形动画 */}
        {hearts.map((h) => (
          <span
            key={h.id}
            className="pet-heart"
            style={{
              left: h.x + "%",
              animationDelay: h.delay + "ms",
            }}
          >
            {h.emoji}
          </span>
        ))}

        {/* 精灵主体 */}
        <div
          className={"pet-body" + (isHungry ? " pet-hungry" : "")}
          style={{ ...walkStyle, ...happyStyle }}
        >
          {/* 光晕 */}
          <div className="pet-glow" />

          {/* 眼睛 */}
          <div className="pet-eyes">
            <div className={"pet-eye" + (isBlinking ? " blink" : "")} />
            <div className={"pet-eye" + (isBlinking ? " blink" : "")} />
          </div>

          {/* 腮红 */}
          <div className="pet-blush left" />
          <div className="pet-blush right" />

          {/* 嘴巴 */}
          <div
            className={"pet-mouth" + (isHappy ? " happy" : "")}
          />
        </div>

        {/* 天线 */}
        <div className="pet-antenna">{antenna}</div>
      </div>
    </div>
  );
}
