/**
 * 测验逻辑工具
 * 提供题目生成、答案检查、分数计算等功能
 */

/**
 * 生成测验题目
 * @param {Array} words - 单词列表
 * @param {string} mode - 测验模式
 * @param {number} count - 题目数量
 * @returns {Array} 题目数组
 */
export function generateQuiz(words, mode, count = 10) {
  // 随机打乱并取指定数量
  const shuffled = [...words].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, words.length));

  return selected.map((word, index) => {
    const question = buildQuestion(word, mode);
    return {
      ...question,
      word,
      index,
      userAnswer: null,
      isCorrect: null,
    };
  });
}

/**
 * 根据模式构建题目
 * @param {Object} word - 单词对象
 * @param {string} mode - 模式
 * @returns {{ prompt: string, answer: string, options?: string[] }}
 */
function buildQuestion(word, mode) {
  switch (mode) {
    case "cn2en":
      // 显示中文，输入英文
      return {
        prompt: word.chinese || word.english,
        hint: `请输入${word.pinyin ? word.pinyin + " 的" : ""}英文`,
        answer: (word.english || word.chinese).toLowerCase().trim(),
        promptLabel: "中文",
        answerLabel: "英文",
      };

    case "en2cn":
      // 显示英文，输入中文
      return {
        prompt: word.english || word.chinese,
        hint: "请输入中文释义",
        answer: (word.chinese || word.english).trim(),
        promptLabel: "英文",
        answerLabel: "中文",
      };

    case "pinyin2cn":
      // 显示拼音，输入中文
      return {
        prompt: word.pinyin || word.english,
        hint: "请输入对应的中文",
        answer: (word.chinese || "").trim(),
        promptLabel: "拼音",
        answerLabel: "中文",
      };

    case "multiple":
      // 四选一
      return buildMultipleChoice(word);

    case "spelling":
      // 拼写模式 - 显示中文，输入完整英文
      return {
        prompt: word.chinese || word.english,
        hint: `请完整拼写${
          word.fieldMain === "chinese" ? "中文" : "英文"
        }`,
        answer: (word.english || word.chinese).toLowerCase().trim(),
        promptLabel: "中文",
        answerLabel: "拼写",
      };

    default:
      return {
        prompt: word.chinese,
        hint: "请输入答案",
        answer: word.english,
        promptLabel: "题目",
        answerLabel: "答案",
      };
  }
}

/**
 * 构建四选一题目
 * @param {Object} correctWord - 正确答案的单词
 * @returns {{ prompt: string, options: string[], answer: string }}
 */
function buildMultipleChoice(correctWord) {
  // 从可用单词列表中生成干扰项
  const correct = correctWord.english || correctWord.chinese;
  const prompt = correctWord.chinese || correctWord.english;

  // 干扰项用常见的其他选项
  const distractors = getDistractors(correctWord).slice(0, 3);

  const options = [correct, ...distractors].sort(() => Math.random() - 0.5);

  return {
    prompt,
    hint: "请选择正确答案",
    options,
    answer: correct,
    promptLabel: "题目",
    answerLabel: "选项",
  };
}

/**
 * 获取干扰项
 * @param {Object} word - 当前单词
 * @returns {string[]} 干扰项列表
 */
function getDistractors(word) {
  const pool = [
    "study", "work", "school", "teacher", "student", "book",
    "water", "food", "house", "family", "friend", "money",
    "time", "day", "year", "morning", "night", "happy",
    "beautiful", "big", "small", "good", "bad", "new",
    "学习", "工作", "学校", "老师", "学生", "书本",
    "水", "食物", "房子", "家人", "朋友", "钱",
    "时间", "天", "年", "早上", "晚上", "开心",
    "漂亮", "大", "小", "好", "坏", "新",
  ];
  return pool.filter((d) => d !== word.english && d !== word.chinese).sort(() => Math.random() - 0.5);
}

/**
 * 检查答案
 * @param {string} userAnswer - 用户答案
 * @param {string} correctAnswer - 正确答案
 * @param {string} mode - 测验模式
 * @returns {boolean} 是否正确
 */
export function checkAnswer(userAnswer, correctAnswer, mode = "cn2en") {
  if (!userAnswer || !correctAnswer) return false;

  const user = userAnswer.trim().toLowerCase();
  const correct = correctAnswer.trim().toLowerCase();

  // 精确匹配
  if (user === correct) return true;

  // 去除空格后匹配
  if (user.replace(/\s+/g, "") === correct.replace(/\s+/g, "")) return true;

  // 对中文模式，允许拼音容错
  if (mode === "en2cn" || mode === "pinyin2cn" || mode === "spelling") {
    // 部分匹配（用户输入包含正确答案的一部分）
    if (correct.includes(user) || user.includes(correct)) return true;
  }

  return false;
}

/**
 * 计算测验结果
 * @param {Array} questions - 题目数组
 * @returns {{ total: number, correct: number, wrong: number, rate: number, wrongWords: Array }}
 */
export function calculateResult(questions) {
  const total = questions.length;
  const correct = questions.filter((q) => q.isCorrect === true).length;
  const wrong = questions.filter((q) => q.isCorrect === false).length;
  const wrongWords = questions
    .filter((q) => q.isCorrect === false)
    .map((q) => ({ ...q.word, wrongAnswer: q.userAnswer }));

  return {
    total,
    correct,
    wrong,
    rate: total > 0 ? Math.round((correct / total) * 100) : 0,
    wrongWords,
  };
}
