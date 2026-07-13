import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import "./pet.css";

/** 鼓励语列表 */
const CHEER_MESSAGES = [
  "主人太棒了！🎉",
  "好厉害呀！💪",
  "继续加油哦！🌟",
  "今天也进步了呢！📚",
  "你真的很努力！✨",
  "真了不起呀！🌈",
  "太优秀了吧！🏆",
  "离目标又近一步！🎯",
  "主人最厉害了！💖",
  "每天都在一起进步呢！🌻",
  "被主人的努力感动了 😢",
  "好想和主人一直学习！🤗",
];

/**
 * 团子小精灵 - 点击会逃跑，学习会鼓励
 */
export default function Pet() {
  const [position, setPosition] = useState(() => 72 + Math.random() * 18);
  const [isHappy, setIsHappy] = useState(false);
  const [isHungry, setIsHungry] = useState(false);
  const [hearts, setHearts] = useState([]);
  const [isWalking, setIsWalking] = useState(false);
  const [isScared, setIsScared] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [sweats, setSweats] = useState([]);
  const [bubble, setBubble] = useState(null); // { text, key }
  const [hasWelcomed, setHasWelcomed] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const bubbleTimeout = useRef(null);

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
      setPosition(isHome ? 5 + Math.random() * 85 : 55 + Math.random() * 38);
      setTimeout(() => setIsWalking(false), 2800);
    };
    const interval = setInterval(walk, 10000 + Math.random() * 14000);
    return () => clearInterval(interval);
  }, [isScared]);

  // ===== 弹气泡 =====
  const showBubble = useCallback((text) => {
    if (bubbleTimeout.current) clearTimeout(bubbleTimeout.current);
    setBubble({ text, key: Date.now() });
    bubbleTimeout.current = setTimeout(() => {
      setBubble(null);
    }, 3000);
  }, []);

  // 随机鼓励
  const randomCheer = useCallback(() => {
    const msg = CHEER_MESSAGES[Math.floor(Math.random() * CHEER_MESSAGES.length)];
    showBubble(msg);
  }, [showBubble]);

  // ===== 首页欢迎主人回家 =====
  useEffect(() => {
    if (!isHome || hasWelcomed) return;
    // 延迟一下等页面加载完再打招呼
    const timer = setTimeout(() => {
      const hour = new Date().getHours();
      let greeting = "主人，欢迎回家！🥰";
      if (hour < 6) greeting = "这么晚还在学习，好努力呀！🌙";
      else if (hour < 9) greeting = "主人早安！今天也要加油哦！☀️";
      else if (hour < 12) greeting = "上午好呀主人！一起学习吧！📚";
      else if (hour < 14) greeting = "主人中午好！吃饱了才有力气学习！🍚";
      else if (hour < 18) greeting = "下午好主人！来学点新词吧！✨";
      else if (hour < 21) greeting = "主人晚上好！今天学了多少呀？🌟";
      else greeting = "主人辛苦了！要不要再复习一下？💪";
      showBubble(greeting);
      setHasWelcomed(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [isHome, hasWelcomed, showBubble]);

  // 监听喂食（学习完成）
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
      // 弹出鼓励
      randomCheer();
      setTimeout(() => setIsHappy(false), 3000);
      setTimeout(() => setHearts([]), 2600);
    };
    window.addEventListener("pet-feed", handleFeed);
    return () => window.removeEventListener("pet-feed", handleFeed);
  }, [randomCheer]);

  // 监听自定义消息
  useEffect(() => {
    const handleMessage = (e) => {
      showBubble(e.detail || "主人加油！🌟");
    };
    window.addEventListener("pet-message", handleMessage);
    return () => window.removeEventListener("pet-message", handleMessage);
  }, [showBubble]);

  // 定时互动 - 如果今天学习了，偶尔夸夸主人
  useEffect(() => {
    const interval = setInterval(() => {
      if (!checkFedToday()) return; // 没学习就不打扰
      if (bubble) return; // 已经在说话就不重复
      // 15% 概率触发
      if (Math.random() < 0.15) {
        randomCheer();
      }
    }, 45000); // 每45秒检查一次
    return () => clearInterval(interval);
  }, [checkFedToday, bubble, randomCheer]);

  // 定时检查饥饿
  useEffect(() => {
    const interval = setInterval(() => { setIsHungry(!checkFedToday()); }, 300000);
    return () => clearInterval(interval);
  }, [checkFedToday]);

  // ===== 点击逃跑 =====
  const handleClick = useCallback(() => {
    if (isScared) return;
    setIsScared(true);
    setIsRunning(true);
    showBubble("呀！被发现了 😰");

    const newSweats = Array.from({ length: 3 }, (_, i) => ({
      id: Date.now() + i,
      x: 30 + Math.random() * 40,
      delay: i * 150,
    }));
    setSweats(prev => [...prev, ...newSweats]);

    setPosition(isHome ? 5 + Math.random() * 85 : 55 + Math.random() * 38);

    setTimeout(() => {
      setIsScared(false);
      setIsRunning(false);
      setSweats([]);
    }, 1200);
  }, [isScared, showBubble]);

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

        {/* 对话气泡 */}
        {bubble && (
          <div className="pet-bubble" key={bubble.key}
            style={{
              animation: "bubbleIn 0.3s ease-out forwards",
            }}>
            <div className="pet-bubble-inner">{bubble.text}</div>
          </div>
        )}

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

        <img src={imgUrl} className={imgClass} alt="小精灵" draggable={false} />
      </div>
    </div>
  );
}
