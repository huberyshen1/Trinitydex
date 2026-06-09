# Trinity Draft 三一轮抽汉化助手 - GitHub Pages 部署指南

这是一个纯静态的网页应用，你可以免费将其托管在 **GitHub Pages** 上，生成一个网址链接分享给你的朋友。他们只需在手机、平板或电脑的浏览器中打开该链接，即可随时随地查阅卡牌和中文规则，无需下载任何软件！

---

## 🚀 部署步骤（傻瓜式教学）

### 第一步：在 GitHub 上新建一个仓库（Repository）
1. 登录你的 [GitHub 账号](https://github.com/)。
2. 点击右上角的 **`+`** 号，选择 **`New repository`**（新建仓库）。
3. 填写仓库信息：
   - **Repository name**（仓库名称）：可以填写 `trinity-draft` 或你喜欢的任意名字。
   - **Public/Private**：必须选择 **`Public`**（公开），GitHub Pages 免费版仅支持公开仓库进行托管。
   - 勾选其他选项保持默认（**不要**勾选 Add a README file，因为我们文件夹里已经有了）。
4. 点击最下方的 **`Create repository`**（创建仓库）。
5. 创建成功后，你会看到一页命令提示，复制你的仓库 HTTPS 链接（例如：`https://github.com/你的用户名/trinity-draft.git`）。

---

### 第二步：将本地 `dist` 目录的文件推送至 GitHub
你可以使用终端（PowerShell 或 Git Bash）将当前 `dist` 目录的文件推送到刚才创建的仓库：

1. 打开终端并进入 `dist` 目录：
   ```powershell
   cd c:\Users\Administrator\Desktop\TrinityDraft\dist
   ```
2. 初始化 Git 仓库：
   ```bash
   git init
   ```
3. 将所有文件加入暂存区：
   ```bash
   git add .
   ```
4. 提交更改：
   ```bash
   git commit -m "Initial commit of Trinity Draft Helper"
   ```
5. 分支重命名为 `main`（推荐）：
   ```bash
   git branch -M main
   ```
6. 关联你在第一步中复制的远程 GitHub 仓库链接（请替换为你的实际链接）：
   ```bash
   git remote add origin https://github.com/你的用户名/trinity-draft.git
   ```
7. 将代码推送到 GitHub（这步可能需要你登录 GitHub 授权）：
   ```bash
   git push -u origin main
   ```

---

### 第三步：在 GitHub 网页端开启 Pages 托管
1. 打开浏览器，进入你刚才创建并推送了代码的 GitHub 仓库页面。
2. 点击仓库顶部的 **`Settings`**（设置）选项卡。
3. 在左侧菜单栏中，向下滚动并找到 **`Code and automation`** 分组，点击其中的 **`Pages`**。
4. 在 **Build and deployment** 下的 **Branch** 区域：
   - 将默认的 `None` 改为 **`main`** 分支。
   - 旁边的文件夹选择 **`/ (root)`**。
   - 点击 **`Save`**（保存）按钮。
5. 稍等 1-2 分钟，刷新页面，你就会在顶部看到一行高亮提示：
   > 🎉 **Your site is live at `https://your-username.github.io/trinity-draft/`**
6. 点击该链接，或者直接将它发送给你的朋友。他们就可以在手机和电脑浏览器中即开即用地打牌查卡了！

---

## 🛠️ 后期维护与更新
如果以后你对卡牌数据或代码进行了更改，只需在 `dist` 目录下在终端执行以下三行命令，GitHub Pages 会自动拉取并更新网页，无需重新设置：

```bash
git add .
git commit -m "Update card database or features"
git push origin main
```
你的朋友刷新他们的浏览器页面即可获得最新的卡牌汉化数据！
