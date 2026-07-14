import React, { useState, useEffect } from "react";
import ToastContainer, { useToastManager } from "../components/Toast";
import {
  getGithubConfig, saveGithubConfig, clearGithubConfig,
  isGithubConfigured, verifyToken,
  uploadBackup, downloadBackup, setBackupCallback
} from "../utils/githubSync";

/**
 * GitHub 数据同步页面
 * 支持登录/登出/手动备份/恢复/自动备份
 */
export default function GithubSyncPage() {
  const [toasts, setToasts] = useState([]);
  const { addToast } = useToastManager(setToasts);
  const [config, setConfig] = useState(() => getGithubConfig() || { token: "", repo: "" });
  const [isVerified, setIsVerified] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(() => localStorage.getItem("cl_auto_backup") === "true");

  // 注册自动备份回调，在自动备份完成时显示 Toast
  useEffect(() => {
    setBackupCallback((result) => {
      addToast(result.message, result.success ? "success" : "error");
    });
    return () => setBackupCallback(null);
  }, [addToast]);

  // 自动验证已保存的 Token
  useEffect(() => {
    if (config.token && config.repo) {
      verifyToken(config.token).then(r => {
        setIsVerified(r.valid);
        if (r.valid) setUserInfo(r.login);
      });
    }
  }, []);

  const handleLogin = async () => {
    if (!config.token.trim() || !config.repo.trim()) {
      addToast("请填写 GitHub Token 和仓库地址", "error");
      return;
    }
    setIsLoading(true);
    const result = await verifyToken(config.token.trim());
    if (result.valid) {
      saveGithubConfig({ token: config.token.trim(), repo: config.repo.trim() });
      setIsVerified(true);
      setUserInfo(result.login);
      addToast("登录成功！欢迎 " + result.login + " 🎉", "success");
    } else {
      addToast("Token 无效，请检查后重试", "error");
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    clearGithubConfig();
    setIsVerified(false);
    setUserInfo(null);
    setConfig({ token: "", repo: "" });
    addToast("已退出登录", "info");
  };

  const handleBackup = async () => {
    setIsLoading(true);
    const result = await uploadBackup();
    addToast(result.message, result.success ? "success" : "error");
    setIsLoading(false);
  };

  const handleRestore = async () => {
    setIsLoading(true);
    const result = await downloadBackup();
    addToast(result.message, result.success ? "success" : "info");
    setIsLoading(false);
  };

  const toggleAutoBackup = () => {
    const newVal = !autoBackupEnabled;
    setAutoBackupEnabled(newVal);
    localStorage.setItem("cl_auto_backup", String(newVal));
    addToast(newVal ? "自动备份已开启 🔄" : "自动备份已关闭", "info");
  };

  return (
    <div>
      <ToastContainer toasts={toasts} />

      <div className="card" style={{ maxWidth: 400, margin: "0 auto" }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20, textAlign: "center" }}>
          🔄 GitHub 数据同步
        </h3>

        {!isVerified ? (
          <>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.6 }}>
              配置 GitHub Token 后，你的单词数据会自动备份到仓库，换浏览器也不会丢失 🎯
            </p>

            <div className="input-group" style={{ marginBottom: 14 }}>
              <label>GitHub Token *</label>
              <input
                className="input-field"
                type="password"
                value={config.token}
                onChange={e => setConfig(c => ({ ...c, token: e.target.value }))}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              />
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4 }}>
                需在 GitHub Settings → Developer settings → Personal access tokens 创建
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 14 }}>
              <label>仓库地址 *</label>
              <input
                className="input-field"
                value={config.repo}
                onChange={e => setConfig(c => ({ ...c, repo: e.target.value }))}
                placeholder="jkyyyy666/ilearn"
              />
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4 }}>
                格式：用户名/仓库名，如 jkyyyy666/ilearn
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleLogin}
              disabled={isLoading}
              style={{ width: "100%", marginTop: 8 }}
            >
              {isLoading ? "验证中..." : "🔆 连接 GitHub"}
            </button>
          </>
        ) : (
          <>
            <div style={{
              textAlign: "center", padding: 16, borderRadius: 12,
              background: "rgba(16, 185, 129, 0.1)", marginBottom: 16
            }}>
              <div style={{ fontSize: 36, marginBottom: 4 }}>✅</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--success)" }}>
                已连接 GitHub
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                {userInfo} / {config.repo}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                className="btn btn-primary"
                onClick={handleBackup}
                disabled={isLoading}
              >
                {isLoading ? "上传中..." : "📛 手动备份到 GitHub"}
              </button>

              <button
                className="btn"
                onClick={handleRestore}
                disabled={isLoading}
                style={{
                  padding: "12px 20px", border: "2px solid var(--border)",
                  borderRadius: 12, cursor: "pointer", fontWeight: 600,
                  background: "var(--bg-card)", color: "var(--text)",
                }}
              >
                {isLoading ? "下载中..." : "📜 从 GitHub 恢复"}
              </button>

              <label style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 16px", borderRadius: 12,
                background: "var(--bg-secondary)", cursor: "pointer",
              }}>
                <input
                  type="checkbox"
                  checked={autoBackupEnabled}
                  onChange={toggleAutoBackup}
                  style={{ width: 18, height: 18 }}
                />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>自动备份</div>
                  <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                    每次添加单词或完成测验时自动备份
                  </div>
                </div>
              </label>
            </div>

            <button
              className="btn"
              onClick={handleLogout}
              style={{
                width: "100%", marginTop: 16, padding: "10px",
                background: "none", border: "1px solid var(--danger)",
                color: "var(--danger)", borderRadius: 10, cursor: "pointer", fontSize: 13,
              }}
            >
              退出登录
            </button>
          </>
        )}
      </div>
    </div>
  );
}
