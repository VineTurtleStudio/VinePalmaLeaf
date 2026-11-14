<div align="center">

# VinePalma Leaf 🍃

**本地优先的桌面电子书阅读器**

<a href="#-简体中文">简体中文</a> ·
<a href="#-繁體中文">繁體中文</a> ·
<a href="#-english">English</a> ·
<a href="#-日本語">日本語</a>

</div>

---

## 🇨🇳 简体中文

基于 **Tauri 2 + React + TypeScript** 的电子书阅读器。书库、阅读、标注、设置全部在本机完成，**书籍文件不会上传**。

### 当前实现状态

| 功能 | 状态 |
|---|---|
| EPUB 阅读 | ✅ 可用 |
| PDF 阅读 | ✅ 可用（含缩放与连续滚动） |
| 纯文本 / Markdown 阅读 | ✅ 可用 |
| 书库管理（封面、最近阅读、收藏） | ✅ 可用 |
| 阅读设置（字体、字号、行距、主题） | ✅ 可用 |
| 局域网 / 蓝牙同步 | 🚧 界面已就位，同步逻辑开发中 |
| MOBI / AZW3 / DJVU / CBZ / CBR / DOCX | 🚧 计划中 |

> 仓库不夸大能力：上表按代码实际实现标注。更完整的格式规划见 [docs/PLAN.md](./docs/PLAN.md)。

### 环境要求

| 依赖 | 版本 |
|---|---|
| Node.js | ≥ 20 |
| Rust | ≥ 1.77（Tauri 2 要求） |
| 系统 | Windows 10/11（需 WebView2）· macOS 13+ · Ubuntu 22+ |

### 快速开始

```bash
npm install
npm run tauri dev     # 开发模式
npm run tauri build   # 打包
```

只调前端：`npm run dev`

### 使用

1. 首次启动会创建本地书库目录
2. 点「导入」选择 EPUB / PDF / TXT 文件
3. 在书库中点击封面开始阅读
4. 阅读界面右侧可调字体、字号、行距、主题
5. 关闭时自动记住阅读位置

### 目录结构

```
src/
  components/
    library/        书库（书架、封面卡片）
    reader/         阅读器
      formats/      EPUB / PDF / 文本 三种渲染器
    favorites/      收藏
    recent/         最近阅读
    settings/       阅读与应用设置
    sync/           同步面板（开发中）
  stores/           状态（书籍、同步）
  types/            类型定义
  utils/            工具函数
src-tauri/
  src/commands/     书籍、格式、笔记、阅读、同步命令
docs/               文档与资源
```

### 常见问题

- **EPUB 打开空白**：确认文件未加密（DRM 的 EPUB 不支持）
- **PDF 渲染慢**：扫描版大文件首屏较慢，可先在设置里降低渲染比例
- **导入后书库不刷新**：退出重进，或在书库页下拉刷新

## 🇹🇼 繁體中文

以 **Tauri 2 + React + TypeScript** 打造的電子書閱讀器。書庫、閱讀、標註、設定全部在本機完成，**書籍檔案不會上傳**。

### 目前實作狀態

| 功能 | 狀態 |
|---|---|
| EPUB 閱讀 | ✅ 可用 |
| PDF 閱讀 | ✅ 可用（縮放與連續捲動） |
| 純文字 / Markdown | ✅ 可用 |
| 書庫管理（封面、最近閱讀、收藏） | ✅ 可用 |
| 閱讀設定（字體、字級、行距、主題） | ✅ 可用 |
| 區域網路 / 藍牙同步 | 🚧 介面就緒，同步邏輯開發中 |
| MOBI / AZW3 / DJVU / CBZ / CBR / DOCX | 🚧 規劃中 |

> 完整格式規劃見 [docs/PLAN.md](./docs/PLAN.md)。

### 環境需求

| 依賴 | 版本 |
|---|---|
| Node.js | ≥ 20 |
| Rust | ≥ 1.77（Tauri 2 需求） |
| 系統 | Windows 10/11（WebView2）· macOS 13+ · Ubuntu 22+ |

### 快速開始

```bash
npm install
npm run tauri dev
npm run tauri build
```

### 使用方式

1. 首次啟動會建立本機書庫目錄
2. 點「匯入」選擇 EPUB / PDF / TXT
3. 在書庫點封面開始閱讀
4. 右側面板可調字體、字級、行距、主題
5. 關閉時自動記住閱讀位置

## 🇬🇧 English

A **Tauri 2 + React + TypeScript** ebook reader. Library, reading, annotations and settings are all local — **your books are never uploaded**.

### Current status

| Feature | Status |
|---|---|
| EPUB reading | ✅ working |
| PDF reading | ✅ working (zoom + continuous scroll) |
| Plain text / Markdown | ✅ working |
| Library (covers, recent, favourites) | ✅ working |
| Reading settings (font, size, spacing, theme) | ✅ working |
| LAN / Bluetooth sync | 🚧 UI in place, sync logic in progress |
| MOBI / AZW3 / DJVU / CBZ / CBR / DOCX | 🚧 planned |

> The table reflects what the code actually does; the broader format plan lives in [docs/PLAN.md](./docs/PLAN.md).

### Requirements

| Dependency | Version |
|---|---|
| Node.js | ≥ 20 |
| Rust | ≥ 1.77 (Tauri 2) |
| OS | Windows 10/11 (WebView2) · macOS 13+ · Ubuntu 22+ |

### Quick start

```bash
npm install
npm run tauri dev
npm run tauri build
```

Frontend only: `npm run dev`

### Usage

1. First launch creates a local library folder
2. Click **Import** and pick EPUB / PDF / TXT files
3. Click a cover in the library to start reading
4. The right panel adjusts font, size, line spacing and theme
5. Reading position is saved on close

### Troubleshooting

- **Blank EPUB** — DRM-protected books are not supported
- **Slow PDF first paint** — large scanned files are heavy; lower the render scale in settings
- **Library not refreshing** — restart the app

## 🇯🇵 日本語

**Tauri 2 + React + TypeScript** 製の電子書籍リーダーです。書庫・閲覧・注釈・設定はすべてローカルで完結し、**書籍ファイルは送信されません**。

### 実装状況

| 機能 | 状態 |
|---|---|
| EPUB 閲覧 | ✅ 動作 |
| PDF 閲覧 | ✅ 動作（ズーム・連続スクロール） |
| プレーンテキスト / Markdown | ✅ 動作 |
| 書庫（表紙・最近読んだ本・お気に入り） | ✅ 動作 |
| 閲覧設定（フォント・サイズ・行間・テーマ） | ✅ 動作 |
| LAN / Bluetooth 同期 | 🚧 UI のみ、同期処理は開発中 |
| MOBI / AZW3 / DJVU / CBZ / CBR / DOCX | 🚧 計画中 |

> 表はコードの実装に合わせています。形式の計画は [docs/PLAN.md](./docs/PLAN.md) を参照。

### 必要なもの

| 依存 | バージョン |
|---|---|
| Node.js | ≥ 20 |
| Rust | ≥ 1.77（Tauri 2） |
| OS | Windows 10/11（WebView2）· macOS 13+ · Ubuntu 22+ |

### クイックスタート

```bash
npm install
npm run tauri dev
npm run tauri build
```

### 使い方

1. 初回起動でローカル書庫フォルダが作成されます
2. 「インポート」から EPUB / PDF / TXT を選択
3. 書庫の表紙をクリックして閲覧開始
4. 右パネルでフォント・サイズ・行間・テーマを調整
5. 終了時に読書位置を保存
