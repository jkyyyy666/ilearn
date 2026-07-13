# 🀄 婉儿中文学习日记

一个现代化的中文和英文学习 Web 应用，支持词汇管理、多种测验模式、错题本、学习统计等完整功能。

## ✨ 功能特性

### 📖 词汇管理
- 内置 HSK 分级中文词汇和 Beginner 分级英文词汇
- 支持手动添加、编辑、删除自定义词汇
- 按分类（HSK1-6 / Beginner-Advanced）筛选
- 实时搜索（支持中文、拼音、英文）

### ⭐ 收藏系统
- 收藏重点单词
- 收藏列表支持搜索和分类筛选
- 仅测验收藏的单词

### 🎯 多种测验模式
1. **中文→英文** — 看中文，输入英文
2. **英文→中文** — 看英文，输入中文
3. **拼音→中文** — 看拼音，输入中文
4. **四选一** — 选择题
5. **拼写模式** — 完整拼写

### 📝 错题本
- 自动记录答错的单词
- 支持错题重新练习
- 一键清空错题本

### 📊 学习统计
- 总词汇数 / 收藏数量 / 测验次数
- 平均正确率
- 连续学习天数
- 30 天学习日历
- 每日学习目标

### 💾 数据管理
- 导出 JSON 备份
- 导入 JSON 恢复
- 一键清空数据

### 🎨 UI 特性
- 现代化圆角卡片设计
- 深色/浅色主题切换
- 响应式设计（手机 / 平板 / 桌面）
- 页面切换动画
- Toast 提示反馈
- 空状态页面

## 🚀 技术栈

- **React 18** — UI 框架
- **Vite 5** — 构建工具
- **React Router 6** — 路由管理
- **LocalStorage** — 数据持久化
- **CSS Variables** — 主题系统
- **GitHub Actions** — 自动部署

## 📁 项目结构

```
chinese-learning/
├── public/
│   └── manifest.json         # PWA 清单
├── src/
│   ├── assets/               # 静态资源
│   ├── components/           # 通用组件
│   │   ├── Layout.jsx        # 全局布局
│   │   ├── LanguageLayout.jsx
│   │   ├── SearchBar.jsx
│   │   ├── CategoryFilter.jsx
│   │   ├── WordCard.jsx
│   │   ├── ProgressBar.jsx
│   │   ├── EmptyState.jsx
│   │   ├── ConfirmModal.jsx
│   │   └── Toast.jsx
│   ├── pages/                # 页面组件
│   │   ├── Home.jsx
│   │   ├── WordListPage.jsx
│   │   ├── AddWordPage.jsx
│   │   ├── FavoritesPage.jsx
│   │   ├── QuizPage.jsx
│   │   ├── WrongBookPage.jsx
│   │   └── StatsPage.jsx
│   ├── hooks/                # 自定义 Hook
│   │   ├── useLocalStorage.js
│   │   └── useTheme.js
│   ├── context/              # React Context
│   │   ├── ThemeContext.jsx
│   │   └── WordContext.jsx
│   ├── utils/                # 工具函数
│   │   ├── constants.js
│   │   ├── storage.js
│   │   ├── quiz.js
│   │   └── exportImport.js
│   ├── data/                 # 内置词汇数据
│   │   ├── chinese-vocab.js
│   │   └── english-vocab.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .github/workflows/
│   └── deploy.yml            # GitHub Actions 部署
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🛠️ 安装与运行

### 环境要求

- Node.js 18+
- npm 9+

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm run dev
```

浏览器自动打开 http://localhost:3000

### 生产构建

```bash
npm run build
```

构建产物在 `dist/` 目录。

### 预览构建结果

```bash
npm run preview
```

## 🌐 部署到 GitHub Pages

### 方式一：自动部署（推荐）

项目已配置 GitHub Actions，推送代码到 `main` 分支后自动部署：

1. 在 GitHub 仓库 Settings → Pages → Source 选择 "GitHub Actions"
2. 推送代码到 main 分支即可自动构建和部署

### 方式二：手动部署

```bash
# 安装 gh-pages 工具
npm install

# 构建并部署
npm run build
npx gh-pages -d dist
```

### 方式三：部署到其他平台

```bash
# 构建项目
npm run build

# 将 dist/ 目录部署到任何静态托管服务
# 例如：Vercel、Netlify、Cloudflare Pages 等
```

## 📝 使用说明

1. 打开应用后选择「中文学习」或「English Learning」
2. 在「单词库」中查看和浏览内置词汇
3. 点击「添加」手动添加新词汇
4. 点击 ☆ 收藏需要重点记忆的单词
5. 进入「测验」选择模式开始测试
6. 答错的单词自动进入「错题本」
7. 在「统计」页面查看学习进度和数据管理

## 📄 许可证

MIT
