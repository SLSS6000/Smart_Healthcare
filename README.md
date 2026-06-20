# 智慧医疗微信小程序

一个功能完整的智慧医疗微信小程序，包含健康管理、预约挂号、健康资讯、药品查询等功能。

## 项目结构

```
Smart_Healthcare/
├── app.js                 # 小程序入口文件
├── app.json              # 小程序全局配置
├── app.wxss              # 小程序全局样式
├── project.config.json   # 项目配置文件
├── sitemap.json          # 站点地图配置
├── AGENT.md              # 项目需求文档
├── README.md             # 项目说明文档
├── pages/                # 页面目录
│   ├── index/           # 首页
│   │   ├── index.js
│   │   ├── index.json
│   │   ├── index.wxml
│   │   └── index.wxss
│   ├── health/          # 健康管理
│   │   ├── health.js
│   │   ├── health.json
│   │   ├── health.wxml
│   │   └── health.wxss
│   ├── appointment/     # 预约挂号
│   │   ├── appointment.js
│   │   ├── appointment.json
│   │   ├── appointment.wxml
│   │   └── appointment.wxss
│   ├── news/            # 健康资讯
│   │   ├── news.js
│   │   ├── news.json
│   │   ├── news.wxml
│   │   └── news.wxss
│   ├── drug/            # 药品查询
│   │   ├── drug.js
│   │   ├── drug.json
│   │   ├── drug.wxml
│   │   └── drug.wxss
│   └── profile/         # 个人中心
│       ├── profile.js
│       ├── profile.json
│       ├── profile.wxml
│       └── profile.wxss
└── images/              # 图片资源目录（需添加图标文件）
```

## 功能模块

### 1. 首页
- 健康数据概览（步数、心率、睡眠、饮水）
- 快捷入口（预约挂号、健康咨询、药品查询等）
- 今日提醒（用药、检查）
- 健康资讯预览

### 2. 健康管理
- 数据记录：添加和查看血压、血糖、体重等健康数据
- 趋势分析：查看健康数据的周/月/年趋势图表
- 健康档案：基本信息、既往病史、体检报告

### 3. 预约挂号
- 科室选择：热门科室快速导航
- 医生推荐：按科室、评分推荐医生
- 我的预约：查看预约记录和状态

### 4. 健康资讯
- 分类浏览：推荐、科普、养生、新闻
- 文章列表：显示标题、摘要、阅读量、点赞数
- 文章详情：查看完整文章内容

### 5. 药品查询
- 药品搜索：按名称、症状、成分搜索
- 扫码查询：扫描药品条码查询
- 分类查询：按药品分类快速查找
- 我的用药：查看常用药品和用药提醒

### 6. 个人中心
- 用户信息：头像、昵称、ID
- 健康统计：健康档案数、预约记录数、收藏文章数
- 功能菜单：我的预约、就诊记录、收藏、用药提醒等
- 帮助与设置：帮助中心、意见反馈、关于我们、设置

## 设计风格

- **配色方案**：白色 + 浅蓝色 (#1890ff)，清新简洁
- **布局**：卡片式布局，信息分块清晰
- **字体**：大字体，足够的行间距，提高可读性
- **交互**：简洁的微交互和动效

## 使用说明

### 1. 在微信开发者工具中打开

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 打开微信开发者工具，选择"导入项目"
3. 选择本项目的根目录 `Smart_Healthcare`
4. 填写 AppID（测试可使用测试号）
5. 点击"导入"即可

### 2. 添加图标资源

在 `images` 目录下添加以下图标文件（可选）：

- `home.png` / `home-active.png` - 首页图标
- `health.png` / `health-active.png` - 健康图标
- `appointment.png` / `appointment-active.png` - 预约图标
- `news.png` / `news-active.png` - 资讯图标
- `profile.png` / `profile-active.png` - 个人中心图标
- `avatar.png` - 用户头像占位图

注意：当前版本使用 emoji 作为图标，可直接运行。

## 注意事项

1. **AppID**：`project.config.json` 中的 AppID 需要替换为您自己的 AppID
2. **后端接口**：当前为纯前端演示，数据为模拟数据，实际使用需对接后端 API
3. **图片资源**：可根据需要添加实际的图片资源
4. **小程序发布**：发布前需完善内容，遵守微信小程序平台规范

## 技术栈

- 微信小程序原生开发
- WXML / WXSS / JavaScript
- 微信小程序 API

## 许可证

MIT License
