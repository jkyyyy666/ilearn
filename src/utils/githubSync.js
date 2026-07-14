/**
 * GitHub 数据同步服务
 * 将 LocalStorage 数据备份到 GitHub 仓库
 * 使用 Personal Access Token (PAT) 认证
 */

const GITHUB_CONFIG_KEY = "cl_github_config";
const BACKUP_FILE = "data/chinese-learning-backup.json";

export function saveGithubConfig(config) {
  localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify(config));
}

export function getGithubConfig() {
  try {
    const raw = localStorage.getItem(GITHUB_CONFIG_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearGithubConfig() {
  localStorage.removeItem(GITHUB_CONFIG_KEY);
}

export function isGithubConfigured() {
  const config = getGithubConfig();
  return config && config.token && config.repo;
}

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

function restoreBackupData(data) {
  Object.entries(data).forEach(([key, value]) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("Failed to restore key:", key, e);
    }
  });
}

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

function parseRepo(repoStr) {
  const parts = repoStr.split("/").filter(Boolean);
  const repo = (parts[parts.length - 1] || "").replace(/\.git$/, "").replace(/\/$/, "");
  const owner = parts[parts.length - 2] || "";
  return { owner, repo };
}

function getFriendlyError(e) {
  const msg = e.message || "";
  if (msg.includes("404")) {
    return "仓库访问失败（404）：Token 缺少仓库写入权限，请在 GitHub Token 设置中勾选 repo 或 public_repo 权限";
  }
  if (msg.includes("401")) {
    return "Token 认证失败：Token 已过期或无效，请重新创建";
  }
  if (msg.includes("403")) {
    return "GitHub API 访问被拒：Token 权限不足或触发频率限制，请检查 Token 权限或稍后重试";
  }
  if (msg.includes("422")) {
    return "数据提交失败：备份文件格式问题，请联系开发者";
  }
  return msg;
}

export async function uploadBackup() {
  const config = getGithubConfig();
  if (!config) return { success: false, message: "未配置 GitHub" };
  const { owner, repo } = parseRepo(config.repo);
  if (!owner || !repo) return { success: false, message: "仓库地址格式错误" };
  try {
    const backupData = collectBackupData();
    const jsonStr = JSON.stringify(backupData, null, 2);
    const content = btoa(unescape(encodeURIComponent(jsonStr)));
    const existingSha = await getBackupFileSha(owner, repo, config.token);
    const body = { message: "备份学习数据 - " + new Date().toLocaleString("zh-CN"), content: content };
    if (existingSha) body.sha = existingSha;
    try {
      await githubApi("/repos/" + owner + "/" + repo + "/contents/data/.gitkeep", "PUT", { message: "初始化数据目录", content: btoa("") }, config.token);
    } catch {}
    await githubApi("/repos/" + owner + "/" + repo + "/contents/" + BACKUP_FILE, "PUT", body, config.token);
    return { success: true, message: "备份成功！共 " + Object.keys(backupData).length + " 项数据已同步" };
  } catch (e) {
    console.error("[GitHub Sync] 备份失败:", e);
    return { success: false, message: getFriendlyError(e) };
  }
}

export async function downloadBackup() {
  const config = getGithubConfig();
  if (!config) return { success: false, message: "未配置 GitHub" };
  const { owner, repo } = parseRepo(config.repo);
  if (!owner || !repo) return { success: false, message: "仓库地址格式错误" };
  try {
    const res = await githubApi("/repos/" + owner + "/" + repo + "/contents/" + BACKUP_FILE, "GET", null, config.token);
    const rawContent = (res.content || "").replace(/\n/g, "");
    const decoded = decodeURIComponent(escape(atob(rawContent)));
    const data = JSON.parse(decoded);
    restoreBackupData(data);
    console.log("[GitHub Sync] 恢复成功:", Object.keys(data).length, "项数据");
    return { success: true, message: "恢复成功！已加载 " + Object.keys(data).length + " 项数据", data: data };
  } catch (e) {
    console.error("[GitHub Sync] 恢复失败:", e);
    return { success: false, message: getFriendlyError(e), data: null };
  }
}

export async function verifyToken(token, repoStr) {
  try {
    const res = await githubApi("/user", "GET", null, token);
    if (!repoStr) return { valid: true, login: res.login, msg: "" };

    // 额外验证 Token 对仓库的访问权限
    const { owner, repo } = parseRepo(repoStr);
    if (owner && repo) {
      try {
        await githubApi("/repos/" + owner + "/" + repo, "GET", null, token);
        return { valid: true, login: res.login, msg: "" };
      } catch {
        return {
          valid: true,
          login: res.login,
          msg: "Token 验证通过，但无法访问仓库「" + owner + "/" + repo + "」\n\n请确保：\n1. Token 有 repo 或 public_repo 权限\n2. 仓库地址填写正确\n3. 仓库存在且是公开的"
        };
      }
    }
    return { valid: true, login: res.login, msg: "" };
  } catch {
    return { valid: false, login: null, msg: "Token 无效，无法连接 GitHub" };
  }
}

let _backupCallback = null;

export function setBackupCallback(cb) {
  _backupCallback = cb;
}

export async function autoBackup() {
  if (!isGithubConfigured()) return null;
  const result = await uploadBackup();
  if (_backupCallback) _backupCallback(result);
  return result;
}
