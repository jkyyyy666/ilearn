import React, { useState, useCallback } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useWords } from "../context/WordContext";
import ToastContainer, { useToastManager } from "../components/Toast";

/**
 * 添加单词页面
 * 手动添加新词汇
 */
export default function AddWordPage() {
  const { lang } = useOutletContext();
  const isChinese = lang === "chinese";
  const words = useWords();
  const navigate = useNavigate();

  const [toasts, setToasts] = useState([]);
  const { addToast } = useToastManager(setToasts);

  const [form, setForm] = useState({
    chinese: "",
    pinyin: "",
    english: "",
    example: "",
    sentence: "",
    ipa: "",
    category: isChinese ? "简单" : "简单",
  });

  const handleChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(() => {
    // 验证必填字段
    if (isChinese) {
      if (!form.chinese.trim() || !form.english.trim()) {
        addToast("请填写中文和英文释义", "error");
        return;
      }
    } else {
      if (!form.english.trim() || !form.chinese.trim()) {
        addToast("请填写英文和中文释义", "error");
        return;
      }
    }

    // 检查重复 - 中文模块按中文查重，英文模块按英文查重
    const allWords = words.getAllWords(lang);
    if (isChinese) {
      const duplicate = allWords.some(
        (w) => w.chinese?.trim()?.toLowerCase() === form.chinese.trim().toLowerCase()
      );
      if (duplicate) {
        addToast(`「${form.chinese.trim()}」已存在，请勿重复添加`, "error");
        return;
      }
    } else {
      const duplicate = allWords.some(
        (w) => w.english?.trim()?.toLowerCase() === form.english.trim().toLowerCase()
      );
      if (duplicate) {
        addToast(`「${form.english.trim()}」already exists`, "error");
        return;
      }
    }

    // 构建单词对象
    const wordData = isChinese
      ? {
          chinese: form.chinese.trim(),
          pinyin: form.pinyin.trim(),
          english: form.english.trim(),
          example: form.example.trim(),
          category: form.category.trim() || "简单",
        }
      : {
          english: form.english.trim(),
          ipa: form.ipa.trim(),
          chinese: form.chinese.trim(),
          sentence: form.sentence.trim(),
          category: form.category.trim() || "简单",
        };

    words.addWord(lang, wordData);
    addToast("单词已添加！", "success");

    // 重置表单
    setForm({
      chinese: "",
      pinyin: "",
      english: "",
      example: "",
      sentence: "",
      ipa: "",
      category: isChinese ? "简单" : "简单",
    });
  }, [form, isChinese, words, lang, addToast]);

  return (
    <div>
      <ToastContainer toasts={toasts} />

      <div
        className="card"
        style={{ maxWidth: 400, margin: "0 auto" }}
      >
        <h3
          style={{
            fontSize: 17,
            fontWeight: 700,
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          ➕ 添加{isChinese ? "中文" : "English"}词汇
        </h3>

        {isChinese ? (
          <>
            <div className="input-group" style={{ marginBottom: 14 }}>
              <label>中文 *</label>
              <input
                className="input-field"
                value={form.chinese}
                onChange={(e) => handleChange("chinese", e.target.value)}
                placeholder="如：学习"
              />
            </div>
            <div className="input-group" style={{ marginBottom: 14 }}>
              <label>拼音</label>
              <input
                className="input-field"
                value={form.pinyin}
                onChange={(e) => handleChange("pinyin", e.target.value)}
                placeholder="如：xué xí"
              />
            </div>
            <div className="input-group" style={{ marginBottom: 14 }}>
              <label>英文释义 *</label>
              <input
                className="input-field"
                value={form.english}
                onChange={(e) => handleChange("english", e.target.value)}
                placeholder="如：study"
              />
            </div>
            <div className="input-group" style={{ marginBottom: 14 }}>
              <label>例句</label>
              <textarea
                className="input-field"
                value={form.example}
                onChange={(e) => handleChange("example", e.target.value)}
                placeholder="如：我要学习中文。"
              />
            </div>
            <div className="input-group" style={{ marginBottom: 14 }}>
              <label>分类</label>
              <select
                className="input-field"
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
              >
                <option value="简单">简单</option>
                <option value="常用">常用</option>
                <option value="复杂">复杂</option>
                <option value="自定义">自定义</option>
              </select>
            </div>
          </>
        ) : (
          <>
            <div className="input-group" style={{ marginBottom: 14 }}>
              <label>English *</label>
              <input
                className="input-field"
                value={form.english}
                onChange={(e) => handleChange("english", e.target.value)}
                placeholder="e.g. study"
              />
            </div>
            <div className="input-group" style={{ marginBottom: 14 }}>
              <label>IPA</label>
              <input
                className="input-field"
                value={form.ipa}
                onChange={(e) => handleChange("ipa", e.target.value)}
                placeholder="e.g. /ˈstʌd.i/"
              />
            </div>
            <div className="input-group" style={{ marginBottom: 14 }}>
              <label>中文释义 *</label>
              <input
                className="input-field"
                value={form.chinese}
                onChange={(e) => handleChange("chinese", e.target.value)}
                placeholder="e.g. 学习"
              />
            </div>
            <div className="input-group" style={{ marginBottom: 14 }}>
              <label>Sentence</label>
              <textarea
                className="input-field"
                value={form.sentence}
                onChange={(e) => handleChange("sentence", e.target.value)}
                placeholder="e.g. I study Chinese every day."
              />
            </div>
            <div className="input-group" style={{ marginBottom: 14 }}>
              <label>Category</label>
              <select
                className="input-field"
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
              >
                <option value="简单">简单</option>
                <option value="常用">常用</option>
                <option value="复杂">复杂</option>
                <option value="自定义">Custom</option>
              </select>
            </div>
          </>
        )}

        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          style={{ width: "100%", marginTop: 8 }}
        >
          💾 保存
        </button>
      </div>
    </div>
  );
}
