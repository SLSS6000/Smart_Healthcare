module.exports = {
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
};
