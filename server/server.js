const express = require('express')
const cors = require('cors')
const path = require('path')
const { Low } = require('lowdb')
const { JSONFile } = require('lowdb/node')

const app = express()
const port = 3000

app.use(cors())
app.use(express.json())

const adapter = new JSONFile(path.join(__dirname, 'database.json'))
const db = new Low(adapter, {
  users: [
    { id: 1, username: 'admin', password: '123456', nickname: '管理员', avatar: '', created_at: new Date().toLocaleString() }
  ],
  health_records: [
    { id: 1, user_id: 1, type: '血压', value: '120/80', unit: 'mmHg', record_time: '2024-05-05 08:00', normal: true },
    { id: 2, user_id: 1, type: '血糖', value: '5.6', unit: 'mmol/L', record_time: '2024-05-05 07:30', normal: true },
    { id: 3, user_id: 1, type: '体重', value: '68.5', unit: 'kg', record_time: '2024-05-05 07:20', normal: true },
    { id: 4, user_id: 1, type: '血压', value: '125/82', unit: 'mmHg', record_time: '2024-05-04 08:10', normal: true },
    { id: 5, user_id: 1, type: '血糖', value: '5.8', unit: 'mmol/L', record_time: '2024-05-04 07:40', normal: true },
    { id: 6, user_id: 1, type: '血压', value: '118/78', unit: 'mmHg', record_time: '2024-05-03 07:55', normal: true },
    { id: 7, user_id: 1, type: '体重', value: '68.8', unit: 'kg', record_time: '2024-05-03 07:30', normal: true },
    { id: 8, user_id: 1, type: '血压', value: '122/81', unit: 'mmHg', record_time: '2024-05-02 08:00', normal: true },
    { id: 9, user_id: 1, type: '血糖', value: '5.7', unit: 'mmol/L', record_time: '2024-05-02 07:35', normal: true },
    { id: 10, user_id: 1, type: '血压', value: '124/83', unit: 'mmHg', record_time: '2024-05-01 08:15', normal: true }
  ],
  appointments: [],
  news: [
    { id: 1, title: '春季养生：如何预防过敏性鼻炎', desc: '春季是过敏高发季节，花粉、粉尘等过敏原增多，容易引起过敏性鼻炎。建议外出时佩戴口罩，保持室内空气清新，适当使用加湿器。', category: '养生', time: '2024-03-15 10:30', views: 3200, likes: 528, image: '/images/news1.jpg' },
    { id: 2, title: '高血压患者的饮食指南', desc: '合理的饮食控制对血压管理至关重要。高血压患者应减少钠盐摄入，每日盐量不超过6克；增加钾的摄入，多吃新鲜蔬菜水果；限制脂肪摄入，戒烟限酒。', category: '科普', time: '2024-03-14 15:20', views: 5100, likes: 892, image: '/images/news2.jpg' },
    { id: 3, title: '每天走多少步最健康', desc: '走路是最简单有效的运动方式。研究表明，每天步行6000-8000步可以有效降低心血管疾病风险。建议根据个人体质循序渐进，避免过度运动。', category: '推荐', time: '2024-03-13 09:15', views: 8600, likes: 1200, image: '/images/news3.jpg' },
    { id: 4, title: '睡眠不足的危害与改善方法', desc: '长期睡眠不足会导致免疫力下降、记忆力减退、情绪波动等问题。建议保持规律的作息时间，每晚保证7-8小时的睡眠时间。', category: '养生', time: '2024-03-12 20:00', views: 4500, likes: 650, image: '/images/news4.jpg' },
    { id: 5, title: '糖尿病患者如何科学饮食', desc: '糖尿病患者的饮食管理是控制血糖的关键。应选择低GI食物，定时定量进餐，适量摄入膳食纤维，避免血糖剧烈波动。', category: '科普', time: '2024-03-11 14:30', views: 6200, likes: 780, image: '/images/news5.jpg' },
    { id: 6, title: '儿童疫苗接种全攻略', desc: '疫苗接种是预防传染病最有效的方式。根据国家免疫规划，儿童在不同的年龄段需要接种相应的疫苗，家长应按时带孩子进行接种。', category: '科普', time: '2024-03-10 11:00', views: 3900, likes: 420, image: '/images/news6.jpg' }
  ],
  doctors: [
    { id: 1, name: '张建国', title: '主任医师', department: '心内科', hospital: '市第一人民医院', rating: 4.9, tags: ['高血压', '冠心病', '心律失常'], experience: '25年', consultCount: 12580, avatar: '/images/doctor1.png' },
    { id: 2, name: '李秀华', title: '副主任医师', department: '内分泌科', hospital: '市第一人民医院', rating: 4.8, tags: ['糖尿病', '甲状腺疾病', '骨质疏松'], experience: '18年', consultCount: 8920, avatar: '/images/doctor2.png' },
    { id: 3, name: '王志强', title: '主治医师', department: '消化内科', hospital: '市第二人民医院', rating: 4.7, tags: ['胃炎', '胃溃疡', '肠道疾病'], experience: '12年', consultCount: 6350, avatar: '/images/doctor3.png' },
    { id: 4, name: '陈美玲', title: '主任医师', department: '妇产科', hospital: '市妇幼保健院', rating: 4.9, tags: ['孕期保健', '妇科炎症', '产后康复'], experience: '20年', consultCount: 15680, avatar: '/images/doctor4.png' },
    { id: 5, name: '刘建华', title: '副主任医师', department: '儿科', hospital: '市儿童医院', rating: 4.8, tags: ['小儿感冒', '发育评估', '儿童营养'], experience: '15年', consultCount: 9870, avatar: '/images/doctor5.png' },
    { id: 6, name: '赵明远', title: '主任医师', department: '神经内科', hospital: '市第一人民医院', rating: 4.7, tags: ['头痛', '失眠', '脑血管疾病'], experience: '22年', consultCount: 7420, avatar: '/images/doctor6.png' },
    { id: 7, name: '孙晓芳', title: '主治医师', department: '皮肤科', hospital: '市第三人民医院', rating: 4.6, tags: ['湿疹', '痤疮', '皮肤过敏'], experience: '10年', consultCount: 5180, avatar: '/images/doctor7.png' },
    { id: 8, name: '周伟强', title: '副主任医师', department: '骨科', hospital: '市骨科医院', rating: 4.8, tags: ['颈椎病', '腰椎间盘突出', '关节疾病'], experience: '16年', consultCount: 8230, avatar: '/images/doctor8.png' }
  ],
  departments: [
    { id: 1, name: '心内科', icon: '❤️', image: 'images/icon1.png', bgColor: '#fff1f0', count: 15 },
    { id: 2, name: '内分泌科', icon: '🧪', image: 'images/icon2.png', bgColor: '#fff7e6', count: 12 },
    { id: 3, name: '消化内科', icon: '🌿', image: 'images/icon3.png', bgColor: '#f6ffed', count: 10 },
    { id: 4, name: '妇产科', icon: '👶', image: 'images/icon4.png', bgColor: '#f9f0ff', count: 20 },
    { id: 5, name: '儿科', icon: '👧', image: 'images/icon5.png', bgColor: '#e6f7ff', count: 25 },
    { id: 6, name: '神经内科', icon: '🧠', image: 'images/icon6.png', bgColor: '#e6fffb', count: 8 },
    { id: 7, name: '皮肤科', icon: '💆', image: 'images/icon7.png', bgColor: '#fff0f6', count: 14 },
    { id: 8, name: '骨科', icon: '🦴', image: 'images/icon8.png', bgColor: '#f5f5f5', count: 18 }
  ],
  settings: {
    profile_menus: [
      { id: 1, name: '个人资料', icon: '👤', bgColor: '#e6f7ff', requireLogin: true, url: '/pages/profile/profile' },
      { id: 2, name: '健康记录', icon: '📊', bgColor: '#fff1f0', requireLogin: true, url: '/pages/health/health' },
      { id: 3, name: '我的预约', icon: '📅', bgColor: '#fff7e6', requireLogin: true, url: '/pages/appointment/appointment' },
      { id: 4, name: '就诊记录', icon: '📋', bgColor: '#f6ffed', requireLogin: true, url: '/pages/health/health' },
      { id: 5, name: '我的收藏', icon: '❤️', bgColor: '#f9f0ff', requireLogin: true, url: '/pages/news/news' },
      { id: 6, name: '用药提醒', icon: '⏰', bgColor: '#e6fffb', requireLogin: true, url: '/pages/health/health' },
      { id: 7, name: '家庭医生', icon: '🏠', bgColor: '#fff0f6', requireLogin: true, url: '/pages/appointment/appointment' },
      { id: 8, name: '设备管理', icon: '📱', bgColor: '#f5f5f5', requireLogin: true, url: '/pages/profile/profile' }
    ],
    help_menus: [
      { id: 9, name: '帮助中心', icon: '❓', bgColor: '#fff0f6', requireLogin: false },
      { id: 10, name: '意见反馈', icon: '💬', bgColor: '#f5f5f5', requireLogin: false },
      { id: 11, name: '关于我们', icon: 'ℹ️', bgColor: '#e6f7ff', requireLogin: false },
      { id: 12, name: '设置', icon: '⚙️', bgColor: '#fff1f0', requireLogin: false }
    ],
    health_summary: {
      totalRecords: 156,
      lastUpdate: '2024-05-05',
      averageSleep: '7.5h',
      averageSteps: '8500',
      healthScore: 85,
      todaySteps: 6234,
      sleepHours: 7.2,
      heartRate: 72,
      bloodPressure: '120/80',
      bloodGlucose: '5.2',
      weight: '68.5kg'
    },
    devices: [
      { id: 1, name: '智能手表', model: 'Apple Watch Series 8', status: 'connected', lastSync: '10分钟前', battery: 85 },
      { id: 2, name: '血压计', model: '小米血压计', status: 'connected', lastSync: '30分钟前', battery: 62 },
      { id: 3, name: '血糖仪', model: '罗氏血糖仪', status: 'disconnected', lastSync: '2小时前', battery: 35 }
    ],
    achievements: [
      { id: 1, name: '健康新手', icon: '🌱', description: '完成首次健康记录', unlocked: true },
      { id: 2, name: '连续打卡', icon: '🔥', description: '连续记录健康数据7天', unlocked: true },
      { id: 3, name: '步数达人', icon: '👟', description: '单日步数超过10000', unlocked: true },
      { id: 4, name: '睡眠卫士', icon: '😴', description: '连续7天睡眠达标', unlocked: false },
      { id: 5, name: '健康之星', icon: '⭐', description: '健康评分达到90分', unlocked: false },
      { id: 6, name: '预约专家', icon: '👨‍⚕️', description: '完成首次专家预约', unlocked: true }
    ],
    notifications: [
      { id: 1, type: 'appointment', title: '预约提醒', content: '明天上午9:00有医生预约', time: '10分钟前', read: false },
      { id: 2, type: 'health', title: '用药提醒', content: '请按时服用降压药物', time: '1小时前', read: false },
      { id: 3, type: 'news', title: '健康资讯', content: '新的健康科普文章已发布', time: '3小时前', read: true }
    ],
    system_info: {
      version: '1.0.0',
      updateTime: '2024-03-15',
      description: '智慧医疗小程序，为您提供便捷的医疗健康服务',
      copyright: '© 2024 智慧医疗'
    }
  },
  home_data: {
    health_overview: [
      { key: 'steps', icon: '👣', value: '8,500', label: '步数', bgColor: '#e6f7ff' },
      { key: 'heart', icon: '❤️', value: '72', label: '心率', bgColor: '#fff1f0' },
      { key: 'sleep', icon: '😴', value: '7.5h', label: '睡眠', bgColor: '#fff7e6' },
      { key: 'water', icon: '💧', value: '1.8L', label: '饮水', bgColor: '#f6ffed' }
    ],
    quick_actions: [
      { id: 1, name: '预约挂号', icon: '🏥', bgColor: '#e6f7ff', url: '/pages/appointment/appointment' },
      { id: 2, name: '健康咨询', icon: '💬', bgColor: '#fff1f0', url: '/pages/news/news' },
      { id: 3, name: '药品查询', icon: '💊', bgColor: '#fff7e6', url: '/pages/drug/drug' },
      { id: 4, name: '健康档案', icon: '📋', bgColor: '#f6ffed', url: '/pages/health/health' },
      { id: 5, name: '检查报告', icon: '📊', bgColor: '#f9f0ff', url: '/pages/health/health' },
      { id: 6, name: '远程问诊', icon: '📱', bgColor: '#e6fffb', url: '/pages/appointment/appointment' },
      { id: 7, name: '体检预约', icon: '🩺', bgColor: '#fff0f6', url: '/pages/appointment/appointment' },
      { id: 8, name: '更多服务', icon: '⋮', bgColor: '#f5f5f5', url: '/pages/profile/profile' }
    ],
    reminders: [
      { id: 1, icon: '💊', title: '服用降压药', time: '09:00', done: false, bgColor: '#e6f7ff' },
      { id: 2, icon: '🩸', title: '血糖检测', time: '12:00', done: false, bgColor: '#fff1f0' },
      { id: 3, icon: '🏃', title: '餐后散步', time: '18:30', done: true, bgColor: '#f6ffed' }
    ]
  }
})

function generateId(arr) {
  return arr.length > 0 ? Math.max(...arr.map(item => item.id)) + 1 : 1
}

app.get('/api/home', (req, res) => {
  const latestNews = db.data.news
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 2)
    .map(n => ({
      id: n.id,
      title: n.title,
      desc: n.desc.substring(0, 30) + '...',
      time: n.time,
      image: n.image
    }))
  
  res.json({
    success: true,
    data: {
      ...db.data.home_data,
      newsList: latestNews
    }
  })
})

app.post('/api/login', (req, res) => {
  const { username, password } = req.body
  const user = db.data.users.find(u => u.username === username && u.password === password)
  
  if (user) {
    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        nickname: user.nickname
      }
    })
  } else {
    res.json({
      success: false,
      message: '用户名或密码错误'
    })
  }
})

app.post('/api/register', (req, res) => {
  const { username, password, nickname } = req.body
  
  if (db.data.users.find(u => u.username === username)) {
    res.json({
      success: false,
      message: '用户名已存在'
    })
    return
  }
  
  const newUser = {
    id: generateId(db.data.users),
    username,
    password,
    nickname: nickname || username,
    avatar: '',
    created_at: new Date().toLocaleString()
  }
  
  db.data.users.push(newUser)
  db.write()
  
  res.json({
    success: true,
    data: newUser
  })
})

app.get('/api/users', (req, res) => {
  res.json({ success: true, data: db.data.users })
})

app.put('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const { nickname, avatar } = req.body
  const userIndex = db.data.users.findIndex(u => u.id === id)
  
  if (userIndex !== -1) {
    if (nickname) db.data.users[userIndex].nickname = nickname
    if (avatar) db.data.users[userIndex].avatar = avatar
    db.write()
    res.json({ success: true, data: db.data.users[userIndex] })
  } else {
    res.json({ success: false, message: '用户不存在' })
  }
})

app.post('/api/health-records', (req, res) => {
  const { user_id, type, value, unit } = req.body
  
  const newRecord = {
    id: generateId(db.data.health_records),
    user_id: parseInt(user_id),
    type,
    value,
    unit,
    record_time: new Date().toLocaleString(),
    normal: true
  }
  
  db.data.health_records.push(newRecord)
  db.write()
  
  res.json({ success: true, data: newRecord })
})

app.get('/api/health-records/:userId', (req, res) => {
  const userId = parseInt(req.params.userId)
  const records = db.data.health_records.filter(r => r.user_id === userId)
  res.json({ success: true, data: records })
})

app.delete('/api/health-records/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const index = db.data.health_records.findIndex(r => r.id === id)

  if (index !== -1) {
    db.data.health_records.splice(index, 1)
    db.write()
    res.json({ success: true, message: '健康记录已删除' })
  } else {
    res.json({ success: false, message: '健康记录不存在' })
  }
})

app.post('/api/appointments', (req, res) => {
  const { user_id, doctor_id, date, time } = req.body
  
  const newAppointment = {
    id: generateId(db.data.appointments),
    user_id: parseInt(user_id),
    doctor_id: parseInt(doctor_id),
    date,
    time,
    status: 'pending',
    created_at: new Date().toLocaleString()
  }
  
  db.data.appointments.push(newAppointment)
  db.write()
  
  res.json({ success: true, data: newAppointment })
})

app.delete('/api/appointments/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const index = db.data.appointments.findIndex(a => a.id === id)
  
  if (index !== -1) {
    db.data.appointments.splice(index, 1)
    db.write()
    res.json({ success: true, message: '预约已取消' })
  } else {
    res.json({ success: false, message: '预约不存在' })
  }
})

app.get('/api/appointments/:userId', (req, res) => {
  const userId = parseInt(req.params.userId)
  const appointments = db.data.appointments
    .filter(a => a.user_id === userId)
    .map(a => {
      const doctor = db.data.doctors.find(d => d.id === a.doctor_id)
      let statusText = '待就诊'
      let statusColor = '#1890ff'
      
      if (a.status === 'completed') {
        statusText = '已完成'
        statusColor = '#52c41a'
      } else if (a.status === 'cancelled') {
        statusText = '已取消'
        statusColor = '#ff4d4f'
      }

      return {
        ...a,
        statusText,
        statusColor,
        doctor: doctor ? { 
          name: doctor.name, 
          title: doctor.title, 
          department: doctor.department, 
          avatar: doctor.avatar,
          hospital: doctor.hospital
        } : null
      }
    })
  res.json({ success: true, data: appointments })
})

app.get('/api/doctors', (req, res) => {
  res.json({ success: true, data: db.data.doctors })
})

app.get('/api/news', (req, res) => {
  const { category } = req.query
  const news = category && category !== '全部'
    ? db.data.news.filter(n => n.category === category)
    : db.data.news

  res.json({ success: true, data: news })
})

app.get('/api/news/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const news = db.data.news.find(n => n.id === id)
  if (news) {
    res.json({ success: true, data: news })
  } else {
    res.json({ success: false, message: '资讯不存在' })
  }
})

app.post('/api/news', (req, res) => {
  const { title, desc, category, image } = req.body
  const newId = generateId(db.data.news)
  
  const newNews = {
    id: newId,
    title,
    desc,
    category: category || '科普',
    time: new Date().toLocaleString(),
    views: 0,
    likes: 0,
    image: image || `/images/news${newId}.jpg`
  }
  
  db.data.news.push(newNews)
  db.write()
  
  res.json({ success: true, data: newNews })
})

app.get('/api/settings', (req, res) => {
  res.json({
    success: true,
    data: {
      profile_menus: db.data.settings?.profile_menus || [],
      help_menus: db.data.settings?.help_menus || [],
      health_summary: db.data.settings?.health_summary || {},
      devices: db.data.settings?.devices || [],
      achievements: db.data.settings?.achievements || [],
      notifications: db.data.settings?.notifications || [],
      system_info: db.data.settings?.system_info || {}
    }
  })
})

app.get('/api/departments', (req, res) => {
  res.json({ success: true, data: db.data.departments })
})

app.get('/api/drugs', (req, res) => {
  const drugs = [
    { id: 1, name: '感冒灵颗粒', desc: '用于感冒引起的头痛、发热', price: '28.00' },
    { id: 2, name: '布洛芬缓释胶囊', desc: '用于缓解轻至中度疼痛', price: '35.00' },
    { id: 3, name: '维生素C片', desc: '用于预防和治疗坏血病', price: '15.00' }
  ]
  res.json({ success: true, data: drugs })
})

async function startServer() {
  await db.read()
  app.listen(port, () => {
    console.log(`🚀 服务器已启动，运行在 http://localhost:${port}`)
    console.log('📡 API接口列表:')
    console.log('  GET   /api/home            - 获取首页数据')
    console.log('  POST  /api/login           - 用户登录')
    console.log('  POST  /api/register        - 用户注册')
    console.log('  GET   /api/users           - 获取用户列表')
    console.log('  POST  /api/health-records  - 添加健康记录')
    console.log('  GET   /api/health-records/:userId - 获取健康记录')
    console.log('  DELETE /api/health-records/:id - 删除健康记录')
    console.log('  POST  /api/appointments    - 创建预约')
    console.log('  GET   /api/appointments/:userId - 获取预约列表')
    console.log('  GET   /api/doctors         - 获取医生列表')
    console.log('  GET   /api/news            - 获取资讯列表')
    console.log('  GET   /api/news/:id        - 获取资讯详情')
    console.log('  POST  /api/news            - 发布资讯')
    console.log('  GET   /api/drugs           - 获取药品列表')
    console.log('  GET   /api/departments     - 获取科室列表')
    console.log('  GET   /api/settings        - 获取设置数据')
  })
}

startServer()
