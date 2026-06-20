App({
  onLaunch() {
    console.log('智慧医疗小程序启动')
  },
  globalData: {
    userInfo: null,
    targetTab: null,
    healthOverview: [
      { icon: '👣', label: '步数', value: '8,500', unit: '', bgColor: '#e6f7ff' },
      { icon: '❤️', label: '心率', value: 72, unit: 'bpm', bgColor: '#fff1f0' },
      { icon: '💤', label: '睡眠', value: 7.5, unit: 'h', bgColor: '#f9f0ff' },
      { icon: '⚖️', label: '体重', value: '68.5', unit: 'kg', bgColor: '#f6ffed' }
    ],
    healthSummary: {
      totalRecords: 156,
      healthScore: 85,
      todaySteps: 8500,
      heartRate: 72,
      sleepHours: 7.5,
      bloodPressure: '120/80',
      weight: '68.5kg'
    }
  }
})
