# Smart Healthcare 微信小程序上线指南 📈

> **目标**：将当前的智慧医疗微信小程序转化为可上线、审核通过的正式产品。

---

## 1️⃣ 项目结构与代码质量

| 步骤 | 关键点 | 推荐工具 |
|------|--------|----------|
| 1.1   | **统一代码风格**：使用 ESLint + Prettier（适用于 `*.js`、`*.wxs`） | `npm i -D eslint prettier eslint-config-wechat-miniprogram` |
| 1.2   | **类型检查**（可选）：加入 TypeScript 支持，提高可维护性 | `npm i -D typescript @types/wechat-miniprogram` |
| 1.3   | **组件复用**：将 UI 拆分为原子组件（卡片、按钮、弹窗），放在 `components/` 目录，使用 `usingComponents` 引入 |
| 1.4   | **统一主题**：在 `app.wxss` 中定义 HSL 调色板、字体（如 Google Fonts `Inter`）并使用 CSS 变量，保证全局一致性 |
| 1.5   | **Lint + 单元测试**：配置 `npm run lint`、`npm test`（使用 Jest + miniprogram-simulate） |

> **提示**：在 `package.json` 中加入 `"scripts": { "lint": "eslint .", "test": "jest" }`。

---

## 2️⃣ 功能实现检查清单

| 模块 | 必须实现 | 可选增强 |
|------|----------|----------|
| 首页 | 数据概览卡片、快捷入口、加载骨架、下拉刷新 | 动态天气、健康小贴士轮播 |
| 健康管理 | 本地存储（`wx.setStorageSync`）+ 可视化趋势图（`wxCharts`） | 云端同步（微信云函数） |
| 医生预约 | 多步骤表单、时间选择器、预约成功弹窗 | 推送预约提醒（微信模板消息） |
| 健康资讯 | 列表渲染、下拉加载、文章详情页 | 内容缓存、分享功能 |
| 药品查询 | 搜索框、查询结果卡片 | 语音辨识（`wx.getRecorderManager`） |
| 个人中心 | 头像上传、个人资料编辑、设备绑定 | 隐私设置、注销账号 |

> **每个页面** 必须添加 **`onLoad`、`onShow`** 生命周期，做好错误捕获 (`try/catch`) 与用户友好提示。

---

## 3️⃣ 后端与数据安全

1. **微信云开发**（推荐）
   - 开通 **云函数**，使用 Node.js 12+ 编写 API（如预约、药品查询）。
   - 将数据库（`wx.cloud.database()`）权限设置为 **仅管理员可写**，用户只能读写自己的数据（`_openid` 字段）。
2. **HTTPS 域名白名单**
   - 所有请求的外部接口必须备案并配置在 **开发者后台 → 域名设置**。包括 `request`, `uploadFile`, `downloadFile`。 
3. **隐私合规**
   - 在 `app.json` 中声明 **`privacyStatement`** 链接。
   - 提供 **用户授权弹窗**（获取体检数据、位置信息）并在 `app.js` 中记录授权状态。
4. **数据加密**（如涉及敏感信息）
   - 使用 `wx.cloud.encryptData` 或自建 AES 加密后存储。

---

## 4️⃣ 性能优化 & 体检

- **资源压缩**：使用 `npm run build`（Vite 兼容小程序）或微信开发者工具的 **代码压缩** 功能。
- **图片懈加载**：`<image mode="aspectFit" lazy-load="true" />`。
- **分包加载**：在 `app.json` 中配置 **分包**，把 `health‑manage/`、`appointment/` 等大模块拆分。
- **网络请求合并**：使用 `Promise.all` 批量拉取首页数据，减少请求次数。
- **页面渲染时长**：打开 **开发者工具 → 性能监控**，确保 **首屏渲染 < 2 s**（含网络）。

---

## 5️⃣ CI / CD 流程（GitHub 示例）

```yaml
name: Mini‑Program CI
on: [push, pull_request]
jobs:
  lint-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm test
  build:
    needs: lint-test
    runs-on: windows-latest   # 需要 Windows 环境才能运行微信开发者工具的 CLI
    steps:
      - uses: actions/checkout@v3
      - name: Install WXCLI
        run: npm i -g miniprogram-ci
      - name: Build & Upload (dev)
        env:
          MINIAPP_APPID: ${{ secrets.MINIAPP_APPID }}
          MINIAPP_PRIVATE_KEY: ${{ secrets.MINIAPP_PRIVATE_KEY }}
        run: |
          npx miniprogram-ci upload --project ./ --appid $MINIAPP_APPID \
            --privateKey $MINIAPP_PRIVATE_KEY --version 1.0.0 --desc "CI 自动构建"
```

> **说明**：`miniprogram-ci` 是微信官方提供的 CLI，可实现自动上传、预览、代码检查。

---

## 6️⃣ 提交审查 & 上线步骤

1. **注册公众号/小程序**，获取 **AppID**。在 **开发者后台 → 开发设置** 添加 **合法域名**、**业务域名**、**客服消息域名**。
2. **配置 app.json**
   - `navigationBarTitleText`、`backgroundColor`、`usingComponents` 完整声明。
   - `permission` 字段列出所有需要的用户授权（如 `scope.userLocation`）。
3. **准备素材**
   - **图标**（512 × 512 PNG）
   - **截图**（3 张 1080 × 1920，展示首页、功能页、个人中心）
   - **功能简介**（150 字以内）
   - **隐私协议**（URL）
4. **使用微信开发者工具**
   - 打开项目，点击 **上传** → 填写 **版本号/描述**（建议使用语义化版本，如 `v1.0.0`）
   - 上传成功后在 **审核列表** 提交 **审核**。
5. **审核要点**（官方常见拒审点）
   - 必须有 **首页**、**个人中心**，不出现空白页面。
   - 所有网络请求必须走白名单域名。
   - 不使用**违规内容**（如药品推荐需有免责声明）。
   - 按要求提供 **业务使用说明**（如预约挂号需说明与医院合作）。
6. **通过审核后**：在开发者后台点击 **发布**，即可在微信中搜索并使用。

---

## 7️⃣ 运营与监控

- **埋点统计**：集成 `wx.reportAnalytics`，记录关键事件（预约完成、药品查询）。
- **版本迭代**：使用 `git flow`，每次功能发布前创建 `release/x.x.x` 分支，完成后合并到 `main` 并打 tag。
- **用户反馈**：在「个人中心」加入「意见反馈」入口，使用微信客服消息或第三方工单系统收集。

---

## ✅ 检查清单（上线前必走)

- [ ] 代码通过 ESLint、Prettier
- [ ] 单元/集成测试全部通过
- [ ] 所有图片、图标已做 **压缩**（< 50 KB）
- [ ] 分包配置完成，首包体积 < 2 MB
- [ ] 隐私政策已在 `app.json` 中声明并上线可访问链接
- [ ] 域名白名单全部配置完毕
- [ ] 微信开发者工具 **无报错**，预览功能正常
- [ ] 提交审核材料（图标、截图、描述）齐全
- [ ] 通过审查后完成正式发布

---

## 📚 参考文档
- 微信小程序官方文档: https://developers.weixin.qq.com/miniprogram/dev/framework/
- 小程序 CI 使用指南: https://github.com/wechat-miniprogram/miniprogram-ci
- 隐私合规指引: https://developers.weixin.qq.com/miniprogram/dev/framework/privacy.html

---

如需进一步细化某个模块（例如云函数实现或 CI 配置），请告诉我，我可以提供对应的代码示例或配置文件。
