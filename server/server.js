const express = require('express');
const cors = require('cors');
const path = require('path');
const { pool, testConnection } = require('./db');
const staticData = require('./static_data');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// ==================== 辅助格式化函数 ====================

// 格式化日期为 YYYY-MM-DD
function formatDate(dateVal) {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 格式化时间为 YYYY-MM-DD HH:mm:ss
function formatDateTime(dateVal) {
  const d = new Date(dateVal || Date.now());
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// ==================== API 路由实现 ====================

/**
 * 1. 获取首页数据
 * GET /api/home
 */
app.get('/api/home', async (req, res) => {
  try {
    // 联查获取最新的 2 条资讯
    const [newsRows] = await pool.execute(
      'SELECT id, title, SUBSTRING(`desc`, 1, 30) AS `desc`, time, image FROM news ORDER BY time DESC LIMIT 2'
    );
    
    const formattedNews = newsRows.map(n => ({
      id: n.id,
      title: n.title,
      desc: n.desc + '...',
      time: formatDateTime(n.time),
      image: n.image
    }));

    res.json({
      success: true,
      data: {
        ...staticData.home_data,
        newsList: formattedNews
      }
    });
  } catch (error) {
    console.error('获取首页数据失败:', error);
    res.status(500).json({ success: false, message: '获取首页数据失败' });
  }
});

/**
 * 2. 用户登录
 * POST /api/login
 */
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
  }

  try {
    // 使用参数化查询防 SQL 注入
    const [rows] = await pool.execute(
      'SELECT id, username, nickname, avatar FROM user WHERE username = ? AND password = ?',
      [username, password]
    );

    if (rows.length > 0) {
      res.json({
        success: true,
        data: {
          ...rows[0],
          loginTime: formatDateTime()
        }
      });
    } else {
      res.json({
        success: false,
        message: '用户名或密码错误'
      });
    }
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ success: false, message: '登录异常，请稍后再试' });
  }
});

/**
 * 3. 用户注册
 * POST /api/register
 */
app.post('/api/register', async (req, res) => {
  const { username, password, nickname } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
  }

  try {
    // 1. 检查用户名是否存在
    const [existing] = await pool.execute('SELECT id FROM user WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.json({
        success: false,
        message: '用户名已存在'
      });
    }

    // 2. 插入新用户
    const [result] = await pool.execute(
      'INSERT INTO user (username, password, nickname, avatar) VALUES (?, ?, ?, "")',
      [username, password, nickname || username]
    );

    res.json({
      success: true,
      data: {
        id: result.insertId,
        username,
        nickname: nickname || username,
        avatar: ''
      }
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ success: false, message: '注册失败，请稍后重试' });
  }
});

/**
 * 4. 获取所有用户列表（管理后台使用）
 * GET /api/users
 */
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, username, nickname, avatar, created_at FROM user');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ success: false, message: '获取用户列表失败' });
  }
});

/**
 * 5. 更新用户信息
 * PUT /api/users/:id
 */
app.put('/api/users/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { nickname, avatar } = req.body;

  try {
    const fields = [];
    const params = [];
    
    if (nickname !== undefined) {
      fields.push('nickname = ?');
      params.push(nickname);
    }
    if (avatar !== undefined) {
      fields.push('avatar = ?');
      params.push(avatar);
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: '没有要更新的字段' });
    }

    params.push(id);

    const [result] = await pool.execute(
      `UPDATE user SET ${fields.join(', ')} WHERE id = ?`,
      params
    );

    if (result.affectedRows > 0) {
      const [updated] = await pool.execute(
        'SELECT id, username, nickname, avatar FROM user WHERE id = ?',
        [id]
      );
      res.json({ success: true, data: updated[0] });
    } else {
      res.json({ success: false, message: '用户不存在' });
    }
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({ success: false, message: '更新用户信息失败' });
  }
});

/**
 * 6. 添加健康记录
 * POST /api/health-records
 */
app.post('/api/health-records', async (req, res) => {
  const { user_id, type, value, unit } = req.body;
  if (!user_id || !type || !value) {
    return res.status(400).json({ success: false, message: '参数不完整' });
  }

  try {
    const recordTime = formatDateTime();
    const [result] = await pool.execute(
      'INSERT INTO health_record (user_id, type, value, unit, record_time, normal) VALUES (?, ?, ?, ?, ?, 1)',
      [parseInt(user_id), type, value, unit || '', recordTime]
    );

    res.json({
      success: true,
      data: {
        id: result.insertId,
        user_id: parseInt(user_id),
        type,
        value,
        unit,
        record_time: recordTime,
        normal: true
      }
    });
  } catch (error) {
    console.error('添加健康记录失败:', error);
    res.status(500).json({ success: false, message: '添加健康记录失败' });
  }
});

/**
 * 7. 获取用户的健康记录
 * GET /api/health-records/:userId
 */
app.get('/api/health-records/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);
  try {
    const [rows] = await pool.execute(
      'SELECT id, user_id, type, value, unit, record_time, normal FROM health_record WHERE user_id = ? ORDER BY record_time DESC',
      [userId]
    );

    const records = rows.map(r => ({
      ...r,
      record_time: formatDateTime(r.record_time),
      normal: r.normal === 1
    }));

    res.json({ success: true, data: records });
  } catch (error) {
    console.error('获取健康记录失败:', error);
    res.status(500).json({ success: false, message: '获取健康记录失败' });
  }
});

/**
 * 8. 删除一条健康记录
 * DELETE /api/health-records/:id
 */
app.delete('/api/health-records/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [result] = await pool.execute('DELETE FROM health_record WHERE id = ?', [id]);
    if (result.affectedRows > 0) {
      res.json({ success: true, message: '健康记录已删除' });
    } else {
      res.json({ success: false, message: '健康记录不存在' });
    }
  } catch (error) {
    console.error('删除健康记录失败:', error);
    res.status(500).json({ success: false, message: '删除健康记录失败' });
  }
});

/**
 * 9. 创建预约挂号（核心防重复逻辑）
 * POST /api/appointments
 */
app.post('/api/appointments', async (req, res) => {
  const { user_id, doctor_id, date, time } = req.body;
  if (!user_id || !doctor_id || !date || !time) {
    return res.status(400).json({ success: false, message: '请求参数不完整' });
  }

  // 从连接池中获取独立连接以控制事务与悲观锁
  const connection = await pool.getConnection();
  try {
    // 开启事务
    await connection.beginTransaction();

    // 并发控制：使用 SELECT ... FOR UPDATE 锁住目标医生该日期和时间段的预约状态。
    // 如果有并发请求，后面的请求会阻塞在此处，直到前一个事务提交/回滚释放锁。
    const [existing] = await connection.execute(
      `SELECT id FROM appointment 
       WHERE doctor_id = ? AND date = ? AND time = ? AND status != 'cancelled' 
       FOR UPDATE`,
      [doctor_id, date, time]
    );

    if (existing.length > 0) {
      // 若已被预约，回滚事务，快速返回失败，防止重复挂号
      await connection.rollback();
      return res.json({
        success: false,
        message: '该医生的该时间段已被预约，请选择其他时段'
      });
    }

    // 执行预约插入
    const [result] = await connection.execute(
      'INSERT INTO appointment (user_id, doctor_id, date, time, status) VALUES (?, ?, ?, ?, "pending")',
      [user_id, doctor_id, date, time]
    );

    // 提交事务，释放锁
    await connection.commit();

    res.json({
      success: true,
      data: {
        id: result.insertId,
        user_id: parseInt(user_id),
        doctor_id: parseInt(doctor_id),
        date,
        time,
        status: 'pending',
        created_at: formatDateTime()
      }
    });
  } catch (error) {
    // 异常情况下回滚事务
    await connection.rollback();
    console.error('创建预约出错:', error);
    
    // 最终数据库级兜底防线：Unique Key (doctor_id, date, time) 触发的重复插入错误代码
    if (error.code === 'ER_DUP_ENTRY') {
      return res.json({
        success: false,
        message: '该医生的该时间段已被预约，请刷新后重试'
      });
    }
    
    res.status(500).json({ success: false, message: '系统繁忙，创建预约失败' });
  } finally {
    // 归还连接到连接池
    connection.release();
  }
});

/**
 * 10. 获取用户的预约列表
 * GET /api/appointments/:userId
 */
app.get('/api/appointments/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);
  try {
    const [rows] = await pool.execute(
      `SELECT a.*, d.name AS doctor_name, d.title AS doctor_title, d.department AS doctor_department, 
              d.hospital AS doctor_hospital, d.avatar AS doctor_avatar
       FROM appointment a
       LEFT JOIN doctor d ON a.doctor_id = d.id
       WHERE a.user_id = ?
       ORDER BY a.date DESC, a.time DESC`,
      [userId]
    );

    const appointments = rows.map(a => {
      let statusText = '待就诊';
      let statusColor = '#1890ff';
      
      if (a.status === 'completed') {
        statusText = '已完成';
        statusColor = '#52c41a';
      } else if (a.status === 'cancelled') {
        statusText = '已取消';
        statusColor = '#ff4d4f';
      }

      return {
        id: a.id,
        user_id: a.user_id,
        doctor_id: a.doctor_id,
        date: formatDate(a.date),
        time: a.time,
        status: a.status,
        statusText,
        statusColor,
        doctor: a.doctor_name ? { 
          name: a.doctor_name, 
          title: a.doctor_title, 
          department: a.doctor_department, 
          avatar: a.doctor_avatar,
          hospital: a.doctor_hospital
        } : null
      };
    });

    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error('获取预约列表失败:', error);
    res.status(500).json({ success: false, message: '获取预约列表失败' });
  }
});

/**
 * 11. 取消预约（按 ID 删除或软删除）
 * DELETE /api/appointments/:id
 */
app.delete('/api/appointments/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    // 这里采用原系统的物理删除；生产环境建议采用逻辑删除（更新 status = 'cancelled'）
    const [result] = await pool.execute('DELETE FROM appointment WHERE id = ?', [id]);
    if (result.affectedRows > 0) {
      res.json({ success: true, message: '预约已取消' });
    } else {
      res.json({ success: false, message: '预约不存在或已处理' });
    }
  } catch (error) {
    console.error('取消预约失败:', error);
    res.status(500).json({ success: false, message: '取消预约失败' });
  }
});

/**
 * 12. 获取医生列表
 * GET /api/doctors
 */
app.get('/api/doctors', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM doctor');
    const doctors = rows.map(d => ({
      ...d,
      // 数据库中逗号拼接的标签还原为数组以适配小程序前端
      tags: d.tags ? d.tags.split(',') : [],
      rating: parseFloat(d.rating)
    }));
    res.json({ success: true, data: doctors });
  } catch (error) {
    console.error('获取医生列表失败:', error);
    res.status(500).json({ success: false, message: '获取医生列表失败' });
  }
});

/**
 * 13. 获取健康资讯列表（支持分类过滤）
 * GET /api/news
 */
app.get('/api/news', async (req, res) => {
  const { category } = req.query;
  try {
    let rows;
    if (category && category !== '全部') {
      [rows] = await pool.execute(
        'SELECT * FROM news WHERE category = ? ORDER BY time DESC', 
        [category]
      );
    } else {
      [rows] = await pool.execute('SELECT * FROM news ORDER BY time DESC');
    }

    const news = rows.map(n => ({
      ...n,
      time: formatDateTime(n.time)
    }));

    res.json({ success: true, data: news });
  } catch (error) {
    console.error('获取健康资讯失败:', error);
    res.status(500).json({ success: false, message: '获取健康资讯失败' });
  }
});

/**
 * 14. 获取特定健康资讯详情
 * GET /api/news/:id
 */
app.get('/api/news/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    // 增加阅读量（原子操作）
    await pool.execute('UPDATE news SET views = views + 1 WHERE id = ?', [id]);

    const [rows] = await pool.execute('SELECT * FROM news WHERE id = ?', [id]);
    if (rows.length > 0) {
      const n = rows[0];
      res.json({
        success: true,
        data: {
          ...n,
          time: formatDateTime(n.time)
        }
      });
    } else {
      res.json({ success: false, message: '资讯不存在' });
    }
  } catch (error) {
    console.error('获取资讯详情失败:', error);
    res.status(500).json({ success: false, message: '获取资讯详情失败' });
  }
});

/**
 * 15. 发布健康资讯（管理后台使用）
 * POST /api/news
 */
app.post('/api/news', async (req, res) => {
  const { title, desc, category, image } = req.body;
  if (!title || !desc) {
    return res.status(400).json({ success: false, message: '标题和内容不能为空' });
  }

  try {
    const timeStr = formatDateTime();
    const defaultImage = image || '/images/news_default.jpg';
    const [result] = await pool.execute(
      'INSERT INTO news (title, `desc`, category, time, image, views, likes) VALUES (?, ?, ?, ?, ?, 0, 0)',
      [title, desc, category || '科普', timeStr, defaultImage]
    );

    res.json({
      success: true,
      data: {
        id: result.insertId,
        title,
        desc,
        category: category || '科普',
        time: timeStr,
        views: 0,
        likes: 0,
        image: defaultImage
      }
    });
  } catch (error) {
    console.error('发布新闻失败:', error);
    res.status(500).json({ success: false, message: '发布失败，请稍后重试' });
  }
});

/**
 * 16. 获取系统静态配置
 * GET /api/settings
 */
app.get('/api/settings', (req, res) => {
  res.json({
    success: true,
    data: {
      profile_menus: staticData.profile_menus,
      help_menus: staticData.help_menus,
      health_summary: staticData.health_summary,
      devices: staticData.devices,
      achievements: staticData.achievements,
      notifications: staticData.notifications,
      system_info: staticData.system_info
    }
  });
});

/**
 * 17. 获取科室列表
 * GET /api/departments
 */
app.get('/api/departments', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM department');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('获取科室列表失败:', error);
    res.status(500).json({ success: false, message: '获取科室列表失败' });
  }
});

/**
 * 18. 获取药品列表
 * GET /api/drugs
 */
app.get('/api/drugs', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM drug');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('获取药品列表失败:', error);
    res.status(500).json({ success: false, message: '获取药品列表失败' });
  }
});

// ==================== 启动服务器 ====================
async function startServer() {
  // 启动时测试 MySQL 连接
  const isConnected = await testConnection();
  if (!isConnected) {
    console.warn('\n⚠️  [WARN] 数据库连接失败。请确保本地 MySQL 服务已启动且 `smart_healthcare` 数据库与表结构已成功创建。\n');
  }

  app.listen(port, () => {
    console.log(`\n🚀 智慧医疗 Node.js API 服务器已成功启动，监听地址: http://localhost:${port}`);
    console.log('📡 数据驱动模式已切换为: Node.js + MySQL (mysql2/promise)');
    console.log('🔗 已启用连接池与参数化查询防 SQL 注入');
    console.log('🛡️  预约挂号接口已集成悲观锁与唯一索引双重并发防重机制\n');
  });
}

startServer();
