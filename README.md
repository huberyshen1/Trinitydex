# TRINITY DRAFT 三一轮抽汉化助手 & 规则书 (PWA Mobile App & Release Builder)

这是一个为卡牌游戏 **Trinity Draft (三一轮抽)** 设计的汉化助手与中文规则书离线助手单页 Web 应用。它已完全打包并支持作为**移动端 PWA (Progressive Web App) 应用**直接安装到主屏幕上，搭载 Service Worker 支持 **100% 离线运行**！

## 🚀 自动 Release 编译工作流 (GitHub Actions)

仓库中已集成 **GitHub Actions 自动化 CI/CD 工作流**（`.github/workflows/release.yml`）。

由于本地无需配置复杂的 Android SDK、Java 和 Gradle 编译工具环境，当你将代码推送至 GitHub 仓库的主分支 (`main`/`master`) 后，GitHub 的云端服务器将自动帮你完成所有编译发布工作：
1. **打包 PC 版本**：将整个 `dist/` 静态网页目录压缩打包为 `trinity-draft-pc.zip`。
2. **编译 Android APK**：基于 **Capacitor 移动混合框架**，在 GitHub Actions 云端自动调用 Android SDK 和 Gradle 构建编译出可在安卓手机上直接安装运行的独立应用安装包 `trinity-draft-android.apk`。
3. **自动发布 Release**：在 GitHub 上生成名为 `Release v[构建号]` 的发布版本，并将 ZIP 压缩包和 APK 安装包作为附件发布，供随时下载！

## 🖥️ 本地使用
1. 直接双击 [dist/index.html](file:///c:/Users/Administrator/Desktop/TrinityDraft/dist/index.html) 即可在电脑浏览器中直接离线运行。
2. 支持高级卡池合并过滤、费用筛选、稀有度/颜色筛选及全选/全不选操作。
3. 可以在“中文规则书”标签页中输入关键字检索 79 页规则书原版插图，并包含图片预加载机制。

## 📱 手机端 App 安装 (iOS & Android PWA)
详细的移动端 PWA 离线安装与 GitHub Pages 部署说明请参阅：[dist/README.md](file:///c:/Users/Administrator/Desktop/TrinityDraft/dist/README.md)
