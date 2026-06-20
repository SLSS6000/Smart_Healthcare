# 智慧医疗健康管理系统 (Smart Healthcare) 🏥

> 基于 **微信小程序 + Node.js (Express) + MySQL** 的全栈个人健康与预约挂号系统。本项目实现了患者端小程序与云端 MySQL 数据库的数据一致性同步，并针对医疗挂号场景加入了并发防重机制。

---

## 🌟 系统核心功能

1. **🏥 预约挂号**：支持按科室筛选医生，查看医生详细资质。集成**高并发悲观锁事务**与**数据库唯一索引**双重机制，防止同一个医生号源被重复预约。
2. **📋 健康档案**：用户可手动记录血压、血糖、体重、体温等生理指标，系统自动计算各项指标是否正常，并支持历史数据删除与趋势管理。
3. **💊 药品查询**：提供医疗机构常用药品的检索与详情展示。
4. **📊 健康资讯**：精选春季养生、高血压饮食、科学运动等科普文章，支持按分类检索，文章阅读量与点赞数实时同步。
5. **👤 个人中心**：管理个人资料（头像、昵称修改），查看历史预约单状态（待就诊、已完成、已取消），管理绑定的智能硬件设备。

---

## 🛠️ 技术栈

* **小程序前端**：微信小程序原生开发（WXML + WXSS + JavaScript）
* **后端服务**：Node.js + Express 框架
* **数据库驱动**：`mysql2/promise` 连接池驱动（支持 `async/await`，开启连接保活）
* **数据库存储**：MySQL 8.0+（使用 `utf8mb4` 字符集，全面采用参数化查询防止 SQL 注入）
* **缓存（可选）**：Redis（推荐作为只读热点数据的缓存以降低数据库负载）

---

## 📂 项目目录结构

```text
Smart_Healthcare/
├── pages/                       # 微信小程序页面目录
│   ├── index/                   # 首页（健康概览与快捷入口）
│   ├── appointment/             # 预约挂号与医生详情
│   ├── health/                  # 健康档案与记录添加
│   ├── drug/                    # 药品检索
│   ├── news/                    # 资讯列表与详情
│   └── login/                   # 用户登录与注册
├── images/                      # 小程序本地静态资源图片
├── server/                      # Node.js 后端服务器目录
│   ├── db.js                    # MySQL 数据库连接池模块
│   ├── static_data.js           # 系统静态配置元数据
│   ├── server.js                # Express 路由网关与核心事务逻辑
│   ├── schema.sql               # MySQL 数据库建表与种子数据脚本
│   └── package.json             # 服务端依赖与启动脚本
├── app.js                       # 小程序全局逻辑
├── app.json                     # 小程序全局配置
├── app.wxss                     # 小程序全局样式
└── README.md                    # 本项目使用说明文档
```

---

## 🚀 快速开始

### 1. 准备工作
确保您的本地开发环境已安装以下软件：
* [Node.js](https://nodejs.org/) (推荐 v16 或更高版本)
* [MySQL](https://www.mysql.com/) (推荐 5.7 或 8.0+)
* [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

### 2. 数据库初始化
1. 打开 MySQL 终端或可视化客户端（如 Navicat/DataGrip）。
2. 执行以下命令导入表结构和初始种子数据（指定 `utf8mb4` 编码以支持特殊字符和 Emoji 表情）：
   ```bash
   # 请在项目根目录下执行（将 -p123456 修改为您本地的实际 root 密码）
   mysql --default-character-set=utf8mb4 -u root -p123456 < server/schema.sql
   ```

### 3. 配置与启动后端服务
1. 打开 [server/db.js](file:///d:/GitWarehouse/Smart_Healthcare/server/db.js) 文件，核对并修改您的 MySQL 连接账号和密码：
   ```javascript
   const dbConfig = {
     host: 'localhost',
     port: 3306,
     user: 'root',       // 数据库用户名
     password: '123456', // 数据库密码
     database: 'smart_healthcare',
     // ...
   };
   ```
2. 进入 `server` 目录并启动服务：
   ```bash
   cd server
   node server.js
   ```
   控制台输出如下内容即代表连接并启动成功：
   ```text
   🔌 正在连接 MySQL 数据库 [localhost:3306/smart_healthcare] 作为用户 [root]...
   ✅ MySQL 数据库连接池初始化成功！
   🚀 智慧医疗 Node.js API 服务器已成功启动，监听地址: http://localhost:3000
   ```

### 4. 运行微信小程序前端
1. 启动 **微信开发者工具**，选择“导入项目”。
2. 项目目录选择包含 `app.json` 的项目根目录 `Smart_Healthcare`。
3. 导入后，在开发者工具的“详情” -> “本地设置”中，勾选 **“不校验合法域名、web-view（业务域名）、TLS版本以及HTTPS证书”**（因为本地调试使用的是 `http://localhost:3000`）。
4. 编译项目即可在模拟器中进行登录（默认测试账号：`admin` 密码：`123456`），挂号预约和健康打卡。

---

## 🧪 API 接口测试方法

后端 API 启动在 `http://localhost:3000` 后，您可以通过以下几种方式对核心接口进行测试和验证：

### 1. 浏览器快速测试 (仅限 GET 请求)
直接在浏览器地址栏输入以下链接，回车即可看到 JSON 数据响应：
* **首页资讯与元数据**: [http://localhost:3000/api/home](http://localhost:3000/api/home)
* **医生列表数据**: [http://localhost:3000/api/doctors](http://localhost:3000/api/doctors)
* **科室列表数据**: [http://localhost:3000/api/departments](http://localhost:3000/api/departments)

### 2. Windows PowerShell 命令行测试 (推荐)
由于您使用的是 Windows 系统，在 PowerShell 中执行以下命令可以极速测试核心接口（无需安装额外客户端）：

* **测试用户登录 (POST)**：
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:3000/api/login" -Method Post -ContentType "application/json" -Body '{"username":"admin","password":"123456"}'
  ```

* **测试获取医生列表 (GET)**：
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:3000/api/doctors" -Method Get
  ```

* **测试创建预约挂号 (POST - 具备防重复控制)**：
  ```powershell
  # 首次调用返回成功，再次调用相同参数将返回“已被预约”
  Invoke-RestMethod -Uri "http://localhost:3000/api/appointments" -Method Post -ContentType "application/json" -Body '{"user_id":1,"doctor_id":1,"date":"2026-06-25","time":"09:00"}'
  ```

### 3. 使用专业客户端测试 (Postman / Apifox)
您也可以导入以下参数在可视化 API 工具中测试：
* **接口：用户注册 (`POST /api/register`)**
  * **Headers**: `Content-Type: application/json`
  * **Body (JSON)**:
    ```json
    {
      "username": "testuser",
      "password": "my_password",
      "nickname": "健康达人"
    }
    ```
* **接口：添加健康记录 (`POST /api/health-records`)**
  * **Headers**: `Content-Type: application/json`
  * **Body (JSON)**:
    ```json
    {
      "user_id": 1,
      "type": "血压",
      "value": "120/80",
      "unit": "mmHg"
    }
    ```

---

## 🛡️ 并发控制与防重预约设计

在挂号场景中，高并发环境下可能出现号源被多人同时抢占的冲突。本项目通过 **三级防御** 实现强一致性保证：
1. **前端置灰拦截**：用户点击“确认预约”后，按钮立即置灰 Loading，限制 3 秒内不得重复触发网络请求。
2. **后端排他锁 (SELECT ... FOR UPDATE)**：Node.js 服务端在创建预约的事务中，使用行级排他锁锁住目标医生指定日期时段的记录。并发请求在此处会被阻塞排队，事务提交/回滚后释放，后面的请求能感知到是否已被预约并快速失败。
3. **数据库唯一索引约束**：在数据库层面设立联合唯一键 `UNIQUE KEY idx_doctor_date_time (doctor_id, date, time)`。若出现极端竞态条件绕过后端逻辑，MySQL 会通过拒绝插入并抛出错误来兜底，确保号源不会被重复占用。

> 架构设计、REST API 接口文档以及 Redis 缓存一致性方案的更多技术细节，请阅读 [smart_healthcare_architecture.md](file:///C:/Users/vinhu/.gemini/antigravity/brain/fbb170ce-f702-43e5-afb7-8af270f1fd4c/smart_healthcare_architecture.md)。
