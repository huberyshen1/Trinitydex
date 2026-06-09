# 🃏 Trinitydex - Trinity Draft 三一轮抽汉化助手 & 移动端/电脑端离线 App

<div align="center">
  <img src="./dist/assets/images/icon-192.png" alt="Trinitydex Logo" width="120" style="border-radius: 24px; box-shadow: 0 8px 24px rgba(0,0,0,0.2);"/>
  <h3>三一轮抽 (Trinity Draft) 汉化数据库、中文规则书与离线辅助工具</h3>
  <p>支持 <b>Blaze (红莲)</b> 与 <b>Phantom (幽冥)</b> 双卡池合并、高级多维筛选、Service Worker 100% 离线缓存、支持打包为手机 App (APK) 运行。</p>
</div>

---

## 🌟 核心特色 (Core Features)

* 🌌 **双卡池深度融合**：完美合并 **Blaze (红莲)** 与 **Phantom (幽冥)** 双卡池数据。支持通过侧边栏一键切换、同时查看或交叉比对。
* 🔍 **高级多维过滤器**：
  * **属性过滤**：支持卡包（Blaze / Phantom）、卡牌稀有度（LEG / Epic / R / U / C）、费用（0-8+）以及卡牌颜色（红 / 黄 / 蓝 / 绿）。
  * **一键控制**：对颜色、费用、稀有度加入了 **“全选” / “全不选”** 功能，极大地提升了筛选效率。
  * **自适应文本搜索**：支持拼音、英文或汉字直接检索卡牌名称或效果。
* 🎨 **极简轻奢美学 UI**：
  * **自适应发光效果**：卡牌悬浮时根据所属包展现对应的科幻微光（Blaze 展现烈焰红光，Phantom 展现幽冥紫光）。
  * **彩色费用徽章**：多色卡牌的费用徽章采用 4 色线性渐变完美呈现。
  * **卡池来源标记**：卡牌下方带有一目了然的卡池来源徽记（`🔥 红莲` 与 `💀 幽冥`）。
* 📖 **交互式中文规则书**：
  * 内置 **79 页原版精美汉化规则书**。
  * 引入智能图片预加载技术，翻页秒开。
  * 支持规则关键字全文快速搜索与精准翻页。
* 📱 **PWA 移动端 100% 离线支持**：
  * 配置了完备的 `manifest.json` 与 Service Worker 缓存机制。
  * 首次加载后，不论是卡牌数据还是规则书高清图片，均可在**无网络（飞行模式）**下完美离线浏览！
  * 可直接添加至 iOS/Android 手机主屏幕，享受原生 App 般的无边框全屏体验。

---

## 🚀 自动 Release 编译工作流 (GitHub Actions)

项目仓库中已深度集成 **GitHub Actions 自动化 CI/CD 构建工作流** (`.github/workflows/release.yml`)。

由于本地无需安装配置繁琐的 Java JDK、Android SDK 以及 Gradle 编译链环境，您只需要将代码推送至 GitHub 仓库：
1. **自动压缩 PC 端离线版**：工作流会自动将 `dist/` 静态网页目录打包为 `trinity-draft-pc.zip`。
2. **云端自动编译 Android APK**：基于 **Capacitor 移动框架**，GitHub Actions 会在云端自动初始化 Android 宿主环境，为您构建出开箱即用的安卓安装包 `trinity-draft-android.apk`。
3. **自动发布 Release**：在每次推送代码到 `main` 分支时，云端将自动生成名为 `Release v[Build_Number]` 的 GitHub Release，并将 **PC版 ZIP 压缩包** 和 **Android版 APK 安装包** 挂载为附件，供所有玩家直接下载！

---

## 🖥️ 电脑端直接使用

由于本项目采用 **无跨域 (Zero-CORS)** 架构设计：
* 下载 `trinity-draft-pc.zip` 并解压后，**直接双击运行 [dist/index.html](file:///c:/Users/Administrator/Desktop/TrinityDraft/dist/index.html)** 即可在任意电脑浏览器中完美离线运行，无需启动任何本地服务器。

---

## 🌐 GitHub Pages 托管与分享

如果您想把这个工具分享给您的朋友，可以通过 GitHub Pages 免费托管它，生成一个网页链接：

1. **推送代码**：将本项目推送至您的 GitHub 公开仓库（例如本仓库 `huberyshen1/Trinitydex`）。
2. **开启 Pages 服务**：
   * 进入该仓库的 **Settings (设置)** 选项卡。
   * 在左侧菜单栏中点击 **Pages**。
   * 将 **Build and deployment** 下的 Branch 改为 **`gh-pages`** 分支，目录选择 **`/ (root)`**，点击 **Save**（注意：分支是 `gh-pages` 而不是 `main`，这样可以直接访问根目录，不需要加上 `/dist/` 后缀）。
3. **获取网址**：稍等 1 分钟后刷新页面，即可在上方获得专属于您的在线卡库链接（例如 `https://huberyshen1.github.io/Trinitydex/`）。
4. 您的朋友在手机浏览器（如 Safari 或 Chrome）中打开该链接后，在浏览器菜单中选择 **“添加到主屏幕” (Add to Home Screen)** 即可作为 App 安装在手机里。

---

## 🛠️ 项目结构

```text
TrinityDraft/
├── .github/workflows/   # GitHub Actions 工作流配置
│   └── release.yml      # 云端编译 APK 与 ZIP 并发布 Release 的自动化脚本
├── dist/                # 网页前端发布目录
│   ├── assets/          # 样式、脚本、图片、数据源等
│   ├── index.html       # 应用主入口网页
│   ├── manifest.json    # PWA 配置文件 (定义 App 名字与图标)
│   ├── sw.js            # PWA 缓存 Service Worker 脚本 (负责离线运行)
│   └── README.md        # GitHub Pages 专属部署说明
├── capacitor.config.json # Capacitor 移动端打包配置文件
├── .gitignore           # Git 忽略文件（排除了超过 100MB 的超大 Excel/PDF 原文件以避免 GitHub 限制）
└── README.md            # 项目综合主文档
```

---

## 📝 贡献与更新

如卡牌数据或规则有更新：
1. 更新对应的 `dist/assets/js/cards_data.json` 或图片。
2. 在项目根目录下打开终端，执行以下命令推送：
   ```bash
   git add .
   git commit -m "Update card database or adjust UI"
   git push origin main
   ```
3. GitHub Actions 收到推送后将立即启动，约 3-5 分钟后，最新版的 APK 和 PC ZIP 就会呈现在仓库的 Releases 页面！
