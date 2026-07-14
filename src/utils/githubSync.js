/**
 * GitHub 数据同步服务
 * 将 LocalStorage 数据备份到 GitHub 仓库
 * 使用 Personal Access Token (PAT) 认证
 */

const GITHUB_CONFIG_KEY = "cl_github_config";
const BACKUP_FILE = "data/chinese-learning-backup.json";

/**
 * 保存 GitHub 配置
 */
export function saveGithubConfig(config) {
  localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify(config));
}

/**
 * 获取 GitHub 配置
 */
export function getGithubConfig() {
  try {
    const raw = localStorage.getItem(GITHUB_CONFIG_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/**
 * 清除 GitHub 配置（退出登录）
 */
export function clearGithubConfig() {
  localStorage.removeItem(GITHUB_CONFIG_KEY);
}

/**
 * 是否已配置 GitHub
 */
export function isGithubConfigured() {
  const config = getGithubConfig();
  return config && config.token && config.repo;
}

/**
 * 收集所有需要备份的数据
 */
function collectBackupData() {
  const keys = [
    "chinese_words", "chinese_favorites", "chinese_wrong_words", "chinese_known_words", "chinese_quiz_history",
    "english_words", "english_favorites", "english_wrong_words", "english_known_words", "english_quiz_history",
    "cl_streak_dates", "cl_daily_goal"
  ];
  const data = {};
  keys.forEach(key => {
    try {
      const val = localStorage.getItem(key);
      if (val) data[key] = JSON.parse(val);
    } catch {}
  });
  return data;
}

/**
 * 将备份数据写入 localStorage
 */
function restoreBackupData(data) {
  Object.entries(data).forEach(([key, value]) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("Failed to restore key:", key, e);
    }
  });
}

/**
 * 调用 GitHub API
 */
async function githubApi(path, method, body, token) {
  const url = "https://api.github.com" + path;
  const headers = {
    "Authorization": "token " + token,
    "Accept": "application/vnd.github.v3+json",
  };
  if (body) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(url, {
    method: method || "GET",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error("GitHub API error (" + res.status + "): " + err.slice(0, 200));
  }
  return res.json();
}

/**
 * 获取仓库中备份文件的 SHA（用于更新文件）
 */
async function getBackupFileSha(owner, repo, token) {
  try {
    const res = await githubApi(
      "/repos/" + owner + "/" + repo + "/contents/" + BACKUP_FILE,
      "GET",
      null,
      token
    );
    return res.sha;
  } catch {
    return null; // 文件还不存在
  }
}

/**
 * 上传备份到 GitHub
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function uploadBackup() {
  const config = getGithubConfig();
  if (!config) return { success: false, message: "未配置 GitHub" };

  const [owner, repo] = config.repo.split("/").slice(-2);
  if (!owner || !repo) return { success: false, message: "仓库地址格式错误" };

  try {
    const backupData = collectBackupData();
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(backupData, null, 2))));

    const existingSha = await getBackupFileSha(owner, repo, config.token);

    const body = {
      message: "备份学习数据 - " + new Date().toLocaleString("zh-CN"),
      content: content,
    };
    if (existingSha) body.sha = existingSha;

    // 确保目录存在
    try {
      await githubApi(
        "/repos/" + owner + "/" + repo + "/contents/data/.gitkeep",
        "PUT",
        { message: "初始化数据目录", content: btoa("") },
        config.token
      );
    } catch {}

    await githubApi(
      "/repos/" + owner + "/" + repo + "/contents/" + BACKUP_FILE,
      "PUT",
      body,
      config.token
    );

    return { success: true, message: "备份成功！" };
  } catch (e) {
    return { success: false, message: "备份失败: " + e.message };
  }
}

/**
 * 从 GitHub 恢复备份
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function downloadBackup() {
  const config = getGithubConfig();
  if (!config) return { success: false, message: "未配置 GitHub" };

  const [owner, repo] = config.repo.split("/").slice(-2);
  if (!owner || !repo) return { success: false, message: "仓库地址格式错误" };

  try {
    const res = await githubApi(
      "/repos/" + owner + "/" + repo + "/contents/" + BACKUP_FILE,
      "GET",
      null,
      config.token
    );

    const decoded = decodeURIComponent(escape(atob(res.content)));
    const data = JSON.parse(decoded);
    restoreBackupData(data);

    return { success: true, message: "恢复成功！已加载 " + Object.keys(data).length + " 项数据" };
  } catch (e) {
    return { success: false, message: "恢复失败: " + e.message };
  }
}

/**
 * 验证 Token 是否有效
 */
export async function verifyToken(token) {
  try {
    const res = await githubApi("/user", "GET", null, token);
    return { valid: true, login: res.login };
  } catch {
    return { valid: false, login: null };
  }
}
