import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useWords } from "../context/WordContext";
import ToastContainer, { useToastManager } from "../components/Toast";
import EmptyState from "../components/EmptyState";

/**
 * 测验页面
 * 从收藏中抽取单词，判断是否认识
 * 不认识 → 加入错题本
 * 认识 → 从错题本移除（如果存在）
 */
export default function QuizPage() {
  const { lang } = useOutletContext();
  const isChinese = lang === "chinese";
  const words = useWords();
  const [toasts, setToasts] = useState([]);
  const { addToast } = useToastManager(setToasts);

  // 测验状态
  const [quizWords, setQuizWords] = useState([]);       // 待测单词列表
  const [currentIndex, setCurrentIndex] = useState(0);  // 当前索引
  const [knownCount, setKnownCount] = useState(0);      // 认识计数
  const [unknownCount, setUnknownCount] = useState(0);  // 不认识计数
  const [isFinished, setIsFinished] = useState(false);  // 是否完成
  const [lastAction, setLastAction] = useState(null);
  const [isRevealed, setIsRevealed] = useState(false);   // 最后一次操作反馈

  // 收藏单词
  const favWords = words.getFavoriteWords(lang);
  const wrongWords = words.getWrongWords(lang);
  const wrongIds = useMemo(() => new Set(wrongWords.map((w) => w.id)), [wrongWords]);

  // 初始化 / 重新开始
  const startQuiz = useCallback(() => {
    if (favWords.length === 0) {
      addToast("请先收藏单词再开始测验", "warning");
      return;
    }
    // 打乱收藏单词
    const knownWords = words.getKnownWords(lang);
    const knownIds = new Set(knownWords.map(w => w.id));
    const shuffled = [...favWords].filter(w => !knownIds.has(w.id)).sort(() => Math.random() - 0.5);
    setQuizWords(shuffled);
    setCurrentIndex(0);
    setKnownCount(0);
    setUnknownCount(0);
    setIsFinished(false);
    setLastAction(null);
  }, [favWords, addToast]);

  // 点击卡片切换显示释义
  const toggleReveal = useCallback(() => {
    setIsRevealed((prev) => !prev);
  }, []);

  // 点击"认识"
  const handleKnown = useCallback(() => {
    const word = quizWords[currentIndex];
    if (!word) return;

    // 如果该词在错题本中，移除
    if (wrongIds.has(word.id)) {
      words.removeWrongWord(lang, word.id);
    }
    words.addKnownWord(lang, word);

    setKnownCount((prev) => prev + 1);
    setLastAction({ type: "known", word });

    setTimeout(() => {
      if (currentIndex < quizWords.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setLastAction(null);
      } else {
        window.dispatchEvent(new CustomEvent("pet-feed"));
        setIsFinished(true);
      }
    }, 400);
  }, [currentIndex, quizWords, wrongIds, words, lang]);

  // 点击"不认识"
  const handleUnknown = useCallback(() => {
    const word = quizWords[currentIndex];
    if (!word) return;

    // 加入错题本（去重）
    const wrongList = words.getWrongWords(lang);
    const alreadyWrong = wrongList.some((w) => w.id === word.id);
    if (!alreadyWrong) {
      words.addWrongWord(lang, word);
    }

    setUnknownCount((prev) => prev + 1);
    setLastAction({ type: "unknown", word });

    setTimeout(() => {
      if (currentIndex < quizWords.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setLastAction(null);
      } else {
        window.dispatchEvent(new CustomEvent("pet-feed"));
        setIsFinished(true);
      }
    }, 400);
  }, [currentIndex, quizWords, words, lang]);

  // 当前单词
  const currentWord = quizWords[currentIndex];

  // ===== 初始状态 - 未开始 =====
  if (quizWords.length === 0 && !isFinished) {
    return (
      <div>
        <h3
          style={{
            fontSize: 17,
            fontWeight: 700,
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          📝 单词测验
        </h3>
        <p
          style={{
            fontSize: 14,
            color: "var(--text-secondary)",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          从收藏中逐个判断是否认识（已认识的不再出现）
        </p>

        {favWords.length === 0 ? (
          <EmptyState
            icon="📭"
            title="还没有收藏的单词"
            description="先去单词库收藏一些单词再来测验吧"
          />
        ) : (
          <>
            {/* 测验说明卡片 */}
            <div
              style={{
                background: "rgba(30, 41, 59, 0.6)",
                backdropFilter: "blur(12px)",
                borderRadius: 16,
                padding: 24,
                marginBottom: 20,
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "white" }}>
                📖 规则说明
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.8 }}>
                <div>✅ <strong>认识</strong> → 跳过该词，从错题本中自动移除</div>
                <div>❌ <strong>不认识</strong> → 自动加入错题本，方便复习</div>
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={startQuiz}
              style={{ width: "100%", padding: "14px 20px", fontSize: 16 }}
            >
              🚀 开始测验
            </button>
          </>
        )}

        <ToastContainer toasts={toasts} />
      </div>
    );
  }

  // ===== 完成页面 =====
  if (isFinished) {
    const total = knownCount + unknownCount;
    const rate = total > 0 ? Math.round((knownCount / total) * 100) : 0;

    return (
      <div className="quiz-container">
        <div
          className="quiz-result-card"
          style={{
            background: "rgba(30, 41, 59, 0.8)",
            backdropFilter: "blur(16px)",
            borderRadius: 16,
            padding: "32px 24px",
            textAlign: "center",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          <div style={{ fontSize: 56, marginBottom: 12 }}>
            {rate >= 80 ? "🎉" : rate >= 50 ? "📚" : "💪"}
          </div>
          <div
            style={{
              fontSize: 48,
              fontWeight: 800,
              color: "var(--primary)",
            }}
          >
            {rate}%
          </div>
          <div style={{ fontSize: 16, color: "var(--text-secondary)", marginTop: 4 }}>
            测验完成！
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 24,
              marginTop: 16,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "var(--success)" }}>
                {knownCount}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>认识</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "var(--danger)" }}>
                {unknownCount}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>不认识</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>
                {total}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>总词数</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 20 }}>
            <button
              className="btn btn-primary"
              onClick={startQuiz}
              style={{ width: "100%" }}
            >
              🔄 再来一轮
            </button>
          </div>
        </div>

        {/* 新加入错题的提示 */}
        {unknownCount > 0 && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 12,
              background: "rgba(239, 68, 68, 0.1)",
              color: "var(--danger)",
              fontSize: 13,
              textAlign: "center",
            }}
          >
            📝 {unknownCount} 个单词已加入错题本，记得去复习哦
          </div>
        )}

        <ToastContainer toasts={toasts} />
      </div>
    );
  }

  // ===== 测验进行中 =====
  if (!currentWord) return null;

  return (
    <div className="quiz-container">
      {/* 进度条 */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 4,
          marginBottom: 16,
        }}
      >
        {quizWords.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              maxWidth: 24,
              height: 4,
              borderRadius: 2,
              background:
                i < currentIndex
                  ? "var(--success)"
                  : i === currentIndex
                  ? "var(--primary)"
                  : "var(--border)",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>

      {/* 单词卡片 */}
      <div
        onClick={toggleReveal}
        style={{
          cursor: "pointer",
          background: "rgba(30, 41, 59, 0.7)",
          backdropFilter: "blur(16px)",
          borderRadius: 20,
          padding: "32px 24px",
          textAlign: "center",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          animation: "fadeIn 0.3s ease",
          marginBottom: 16,
        }}
      >
        {/* 主词 */}
        <div
          style={{
            fontSize: 36,
            fontWeight: 800,
            color: "white",
            marginBottom: 8,
            letterSpacing: isChinese ? 2 : 0,
          }}
        >
          {isChinese ? currentWord.chinese : currentWord.english}
        </div>

        {/* 点击后展开的详细信息 */}
        {isRevealed && (
          <div style={{ animation: "fadeIn 0.2s ease", marginTop: 16 }}>
            {(currentWord.pinyin || currentWord.ipa) && (
              <div style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", marginBottom: 8, fontStyle: "italic" }}>
                {currentWord.pinyin || currentWord.ipa}
              </div>
            )}
            <div style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", marginBottom: 8 }}>
              {isChinese ? currentWord.english : currentWord.chinese}
            </div>
            {(currentWord.example || currentWord.sentence) && (
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontStyle: "italic", padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.06)", marginTop: 4 }}>
                💬 {currentWord.example || currentWord.sentence}
              </div>
            )}
            {currentWord.category && (
              <div style={{ display: "inline-block", marginTop: 8, padding: "3px 12px", borderRadius: 20, background: "rgba(129, 140, 248, 0.2)", color: "rgba(129, 140, 248, 0.9)", fontSize: 12, fontWeight: 600 }}>
                {currentWord.category}
              </div>
            )}
          </div>
        )}

        {!isRevealed && !lastAction && (
          <div style={{ marginTop: 12, fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
            👆 点击查看详情
          </div>
        )}
      </div>

      {/* 操作反馈 */}
      {lastAction && (
        <div
          style={{
            textAlign: "center",
            marginBottom: 12,
            padding: "8px 16px",
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            animation: "fadeIn 0.2s ease",
            background:
              lastAction.type === "known"
                ? "rgba(16, 185, 129, 0.15)"
                : "rgba(239, 68, 68, 0.15)",
            color:
              lastAction.type === "known"
                ? "var(--success)"
                : "var(--danger)",
          }}
        >
          {lastAction.type === "known"
            ? `✅ 已认识「${isChinese ? lastAction.word.chinese : lastAction.word.english}」`
            : `❌ 「${isChinese ? lastAction.word.chinese : lastAction.word.english}」已加入错题本`}
        </div>
      )}

      {/* 操作按钮 */}
      <div style={{ display: "flex", gap: 12 }}>
        <button
          className="btn"
          onClick={handleKnown}
          disabled={!!lastAction}
          style={{
            flex: 1,
            padding: "14px 20px",
            fontSize: 16,
            fontWeight: 700,
            border: "none",
            borderRadius: 14,
            cursor: "pointer",
            background: "rgba(16, 185, 129, 0.2)",
            color: "var(--success)",
            transition: "all 0.2s",
            opacity: lastAction ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(16, 185, 129, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(16, 185, 129, 0.2)";
          }}
        >
          ✅ 认识
        </button>
        <button
          className="btn"
          onClick={handleUnknown}
          disabled={!!lastAction}
          style={{
            flex: 1,
            padding: "14px 20px",
            fontSize: 16,
            fontWeight: 700,
            border: "none",
            borderRadius: 14,
            cursor: "pointer",
            background: "rgba(239, 68, 68, 0.2)",
            color: "var(--danger)",
            transition: "all 0.2s",
            opacity: lastAction ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239, 68, 68, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
          }}
        >
          ❌ 不认识
        </button>
      </div>

      {/* 进度文字 */}
      <div
        style={{
          textAlign: "center",
          marginTop: 12,
          fontSize: 12,
          color: "var(--text-tertiary)",
        }}
      >
        {currentIndex + 1} / {quizWords.length}
      </div>

      <ToastContainer toasts={toasts} />
    </div>
  );
}
