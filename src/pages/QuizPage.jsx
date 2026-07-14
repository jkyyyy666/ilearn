import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useWords } from "../context/WordContext";
import { useRef } from "react";
import ToastContainer, { useToastManager } from "../components/Toast";
import { recordActivity } from "../utils/streak";
import { isGithubConfigured, autoBackup } from "../utils/githubSync";
import EmptyState from "../components/EmptyState";

/**
 * 测验页面
 * 从收藏中抽取单词，判断是否认识
 * 不认识→加入错题本
 * 认识→从错题本移除（如果存在）
 */
export default function QuizPage() {
  const { lang } = useOutletContext();
  const isChinese = lang === "chinese";
  const words = useWords();
  const [toasts, setToasts] = useState([]);
  const countsRef = useRef({ known: 0, unknown: 0 });
  const { addToast } = useToastManager(setToasts);

  const [quizWords, setQuizWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [knownCount, setKnownCount] = useState(0);
  const [unknownCount, setUnknownCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const [isRevealed, setIsRevealed] = useState(false);

  const favWords = words.getFavoriteWords(lang);
  const wrongWords = words.getWrongWords(lang);
  const wrongIds = useMemo(() => new Set(wrongWords.map((w) => w.id)), [wrongWords]);

  const startQuiz = useCallback(() => {
    if (favWords.length === 0) {
      addToast("请先收藏单词再开始测验", "warning");
      return;
    }
    const knownWords = words.getKnownWords(lang);
    const knownIds = new Set(knownWords.map(w => w.id));
    const shuffled = [...favWords].filter(w => !knownIds.has(w.id)).sort(() => Math.random() - 0.5);

    if (shuffled.length === 0) {
      addToast("所有收藏单词都已认识啦！🎉去添加新词吧", "success");
      return;
    }

    setQuizWords(shuffled);
    setCurrentIndex(0);
    setKnownCount(0);
    setUnknownCount(0);
    setIsFinished(false);
    setLastAction(null);
  }, [favWords, words, lang, addToast]);

  const toggleReveal = useCallback(() => {
    setIsRevealed((prev) => !prev);
  }, []);

  const handleKnown = useCallback(() => {
    const word = quizWords[currentIndex];
    if (!word) return;

    if (wrongIds.has(word.id)) {
      words.removeWrongWord(lang, word.id);
    }
    words.addKnownWord(lang, word);

    setKnownCount((prev) => prev + 1);
    countsRef.current.known++;
    setLastAction({ type: "known", word });

    setTimeout(() => {
      if (currentIndex < quizWords.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setLastAction(null);
      } else {
        window.dispatchEvent(new CustomEvent("pet-feed"));
        recordActivity();
        words.addQuizRecord(lang, { correct: countsRef.current.known, total: countsRef.current.known + countsRef.current.unknown });
        if (isGithubConfigured()) autoBackup();
        setIsFinished(true);
        countsRef.current = { known: 0, unknown: 0 };
      }
    }, 400);
  }, [currentIndex, quizWords, wrongIds, words, lang]);

  const handleUnknown = useCallback(() => {
    const word = quizWords[currentIndex];
    if (!word) return;

    const wrongList = words.getWrongWords(lang);
    const alreadyWrong = wrongList.some((w) => w.id === word.id);
    if (!alreadyWrong) {
      words.addWrongWord(lang, word);
    }

    setUnknownCount((prev) => prev + 1);
    countsRef.current.unknown++;
    setLastAction({ type: "unknown", word });

    setTimeout(() => {
      if (currentIndex < quizWords.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setLastAction(null);
      } else {
        window.dispatchEvent(new CustomEvent("pet-feed"));
        recordActivity();
        words.addQuizRecord(lang, { correct: countsRef.current.known, total: countsRef.current.known + countsRef.current.unknown });
        if (isGithubConfigured()) autoBackup();
        setIsFinished(true);
        countsRef.current = { known: 0, unknown: 0 };
      }
    }, 400);
  }, [currentIndex, quizWords, words, lang]);

  const currentWord = quizWords[currentIndex];

  // 未开始状态
  if (quizWords.length === 0 && !isFinished) {
    return (
      <div>
        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, textAlign: "center" }}>
          📑 单词测验
        </h3>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", textAlign: "center", marginBottom: 16 }}>
          从收藏中随机抽取单词，认识就点✅，不认识就点❌
        </p>
        {favWords.length === 0 ? (
          <EmptyState icon="⭐" title="还没有收藏单词" description="先去单词库收藏一些单词吧" />
        ) : (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginBottom: 16 }}>
              共 {favWords.length} 个收藏单词
            </p>
            <button className="btn btn-primary" onClick={startQuiz}>
              🚀 开始测验
            </button>
          </div>
        )}
        <ToastContainer toasts={toasts} />
      </div>
    );
  }

  // 完成状态
  if (isFinished) {
    const total = knownCount + unknownCount;
    const rate = total > 0 ? Math.round((knownCount / total) * 100) : 0;

    return (
      <div>
        <div className="card" style={{ textAlign: "center", padding: "32px 20px", maxWidth: 360, margin: "0 auto" }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>测验完成！</h3>
          <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 20, lineHeight: 1.6 }}>
            本次测验共 {total} 个单词
          </div>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 20 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--success)" }}>{knownCount}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>认识 ✅</div>
            </div>
            <div style={{ width: 1, background: "var(--border)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--danger)" }}>{unknownCount}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>不认识 ❌</div>
            </div>
            <div style={{ width: 1, background: "var(--border)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--primary)" }}>{rate}%</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>正确率</div>
            </div>
          </div>

          <button className="btn btn-primary" onClick={startQuiz}>
            🔄 再来一次
          </button>
        </div>
        <ToastContainer toasts={toasts} />
      </div>
    );
  }

  if (!currentWord) return null;

  // 测验界面
  return (
    <div style={{ maxWidth: 400, margin: "0 auto" }}>
      {/* 进度条 */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-tertiary)", marginBottom: 6 }}>
          <span>✅ {knownCount}</span>
          <span>{currentIndex + 1}/{quizWords.length}</span>
          <span>❌ {unknownCount}</span>
        </div>
        <div style={{ height: 4, background: "var(--bg-secondary)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: ((currentIndex + 1) / quizWords.length * 100) + "%", background: "linear-gradient(90deg, var(--success), var(--primary))", borderRadius: 2, transition: "width 0.3s ease" }} />
        </div>
      </div>

      {/* 单词卡片 - 可点击展开 */}
      <div
        onClick={toggleReveal}
        style={{
          background: "linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(129, 140, 248, 0.15))",
          backdropFilter: "blur(12px)",
          borderRadius: 20,
          padding: "32px 24px",
          textAlign: "center",
          cursor: "pointer",
          border: "1px solid rgba(255,255,255,0.1)",
          transition: "all 0.3s ease",
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 36, fontWeight: 800, color: "white", marginBottom: 8, letterSpacing: isChinese ? 2 : 0 }}>
          {isChinese ? currentWord.chinese : currentWord.english}
        </div>

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

      {lastAction && (
        <div style={{
          textAlign: "center", marginBottom: 12, padding: "8px 16px", borderRadius: 12,
          fontSize: 14, fontWeight: 600, animation: "fadeIn 0.2s ease",
          background: lastAction.type === "known" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
          color: lastAction.type === "known" ? "var(--success)" : "var(--danger)",
        }}>
          {lastAction.type === "known"
            ? "✅ 已认识「" + (isChinese ? lastAction.word.chinese : lastAction.word.english) + "」"
            : "❌ 「" + (isChinese ? lastAction.word.chinese : lastAction.word.english) + "」已加入错题本"}
        </div>
      )}

      <div style={{ display: "flex", gap: 12 }}>
        <button
          className="btn"
          onClick={handleKnown}
          disabled={!!lastAction}
          style={{
            flex: 1, padding: "14px 20px", fontSize: 16, fontWeight: 700,
            border: "none", borderRadius: 14, cursor: "pointer",
            background: "rgba(16, 185, 129, 0.2)", color: "var(--success)",
            transition: "all 0.2s", opacity: lastAction ? 0.5 : 1,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(16, 185, 129, 0.3)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(16, 185, 129, 0.2)"; }}
        >
          ✅ 认识
        </button>
        <button
          className="btn"
          onClick={handleUnknown}
          disabled={!!lastAction}
          style={{
            flex: 1, padding: "14px 20px", fontSize: 16, fontWeight: 700,
            border: "none", borderRadius: 14, cursor: "pointer",
            background: "rgba(239, 68, 68, 0.2)", color: "var(--danger)",
            transition: "all 0.2s", opacity: lastAction ? 0.5 : 1,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239, 68, 68, 0.3)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)"; }}
        >
          ❌ 不认识
        </button>
      </div>

      <div style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: "var(--text-tertiary)" }}>
        {currentIndex + 1} / {quizWords.length}
      </div>

      <ToastContainer toasts={toasts} />
    </div>
  );
}
