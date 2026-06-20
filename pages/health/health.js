const TYPE_META = {
  '血压': { icon: 'BP', color: '#e6f7ff', unit: 'mmHg', hint: '例如 120/80' },
  '血糖': { icon: 'GLU', color: '#fff1f0', unit: 'mmol/L', hint: '例如 5.6' },
  '体重': { icon: 'KG', color: '#fff7e6', unit: 'kg', hint: '例如 68.5' },
  '心率': { icon: 'HR', color: '#f6ffed', unit: 'bpm', hint: '例如 72' },
  '体温': { icon: 'TEMP', color: '#f9f0ff', unit: '°C', hint: '例如 36.8' }
}

const TYPE_OPTIONS = Object.keys(TYPE_META).map(type => ({
  type,
  ...TYPE_META[type]
}))

Page({
  data: {
    currentTab: 0,
    chartPeriod: 'week',
    selectedMetric: '血压',
    typeOptions: TYPE_OPTIONS,
    records: [],
    latestCards: [],
    todayRecords: [],
    historyRecords: [],
    metrics: [],
    trendBars: [],
    trendSummary: {},
    reports: [],
    loading: true,
    error: '',
    showAddModal: false,
    activeDeleteId: null,
    touchStartX: 0,
    touchStartY: 0,
    selectedType: '血压',
    inputValue: '',
    inputUnit: TYPE_META['血压'].unit,
    inputHint: TYPE_META['血压'].hint
  },

  onLoad() {
    this.loadData()
  },

  onPullDownRefresh() {
    this.loadData().then(() => wx.stopPullDownRefresh())
  },

  getCurrentUserId() {
    const userInfo = wx.getStorageSync('userInfo') || {}
    return userInfo.id || 1
  },

  loadData() {
    this.setData({ loading: true, error: '' })
    const userId = this.getCurrentUserId()

    return new Promise(resolve => {
      wx.request({
        url: `http://localhost:3000/api/health-records/${userId}`,
        success: res => {
          if (res.data.success) {
            this.processRecords(res.data.data || [])
            this.setData({ loading: false })
          } else {
            this.setData({ loading: false, error: '获取健康数据失败' })
          }
          resolve()
        },
        fail: () => {
          this.setData({ loading: false, error: '网络连接失败，请确认后端服务已启动' })
          resolve()
        }
      })
    })
  },

  processRecords(rawRecords) {
    const records = rawRecords
      .map(record => this.decorateRecord(record))
      .sort((a, b) => new Date(b.rawTime) - new Date(a.rawTime))

    const todayKey = this.getDateKey(new Date())
    const todayRecords = records.filter(record => record.dateKey === todayKey)
    const historyRecords = this.groupHistory(records.filter(record => record.dateKey !== todayKey))
    const latestCards = this.buildLatestCards(records)
    const metrics = this.buildMetrics(records)
    const trendData = this.buildTrendData(records, this.data.selectedMetric, this.data.chartPeriod)

    this.setData({
      records,
      latestCards,
      todayRecords,
      historyRecords,
      metrics,
      trendBars: trendData.bars,
      trendSummary: trendData.summary,
      reports: [
        { id: 1, name: '年度体检报告', date: '2024-04-15', status: '已归档' },
        { id: 2, name: '血常规检查', date: '2024-03-20', status: '正常' },
        { id: 3, name: '心电图报告', date: '2024-02-10', status: '已归档' }
      ]
    })
  },

  decorateRecord(record) {
    const meta = TYPE_META[record.type] || { icon: 'DATA', color: '#f5f5f5', unit: record.unit || '' }
    const rawTime = this.parseRecordTime(record.record_time)
    const valueText = `${record.value}${record.unit ? ' ' + record.unit : ''}`

    return {
      ...record,
      rawTime,
      dateKey: this.getDateKey(rawTime),
      dateText: this.formatDate(rawTime),
      timeText: this.formatTime(rawTime),
      valueText,
      icon: meta.icon,
      bgColor: meta.color,
      normal: record.normal !== false && this.isNormal(record.type, record.value),
      statusText: record.normal === false || !this.isNormal(record.type, record.value) ? '注意' : '正常'
    }
  },

  buildLatestCards(records) {
    return TYPE_OPTIONS.slice(0, 4).map(option => {
      const latest = records.find(record => record.type === option.type)
      return {
        type: option.type,
        icon: option.icon,
        bgColor: option.color,
        value: latest ? latest.value : '--',
        unit: latest ? latest.unit : option.unit,
        time: latest ? latest.dateText : '暂无记录',
        normal: latest ? latest.normal : true
      }
    })
  },

  buildMetrics(records) {
    const latestWeight = this.latestNumber(records, '体重', 68.5)
    const latestGlucose = this.latestNumber(records, '血糖', 5.6)
    const latestHeartRate = this.latestNumber(records, '心率', 72)
    const latestBP = records.find(record => record.type === '血压')?.value || '120/80'
    const bmi = (latestWeight / Math.pow(1.75, 2)).toFixed(1)

    return [
      { id: 1, name: '血压', desc: '收缩压 / 舒张压', value: latestBP, unit: 'mmHg', status: this.bpStatus(latestBP), trend: 'stable' },
      { id: 2, name: '血糖', desc: '最近一次记录', value: latestGlucose.toFixed(1), unit: 'mmol/L', status: latestGlucose < 7 ? '正常' : '偏高', trend: latestGlucose < 7 ? 'stable' : 'up' },
      { id: 3, name: '心率', desc: '静息参考范围', value: Math.round(latestHeartRate), unit: 'bpm', status: latestHeartRate >= 60 && latestHeartRate <= 100 ? '正常' : '注意', trend: 'stable' },
      { id: 4, name: 'BMI', desc: '按 1.75m 估算', value: bmi, unit: '', status: bmi >= 18.5 && bmi < 24 ? '正常' : '注意', trend: bmi >= 18.5 && bmi < 24 ? 'stable' : 'up' }
    ]
  },

  buildTrendData(records, type, period) {
    const limit = period === 'week' ? 7 : period === 'month' ? 12 : 12
    const typedRecords = records
      .filter(record => record.type === type)
      .slice(0, limit)
      .reverse()

    const values = typedRecords.map(record => this.toChartValue(record))
    const max = Math.max(...values, 1)
    const min = Math.min(...values, 0)
    const range = Math.max(max - min, 1)

    const bars = typedRecords.map(record => {
      const value = this.toChartValue(record)
      const percent = Math.max(12, Math.round(((value - min) / range) * 72) + 18)
      return {
        id: record.id,
        label: record.dateText.slice(5),
        value: record.value,
        unit: record.unit,
        height: `${percent}%`,
        normal: record.normal
      }
    })

    return {
      bars,
      summary: {
        type,
        count: typedRecords.length,
        latest: typedRecords[typedRecords.length - 1]?.valueText || '--',
        range: typedRecords.length ? `${min.toFixed(1)} - ${max.toFixed(1)}` : '--'
      }
    }
  },

  groupHistory(records) {
    const grouped = {}
    records.forEach(record => {
      if (!grouped[record.dateText]) grouped[record.dateText] = []
      grouped[record.dateText].push(record)
    })

    return Object.keys(grouped).slice(0, 8).map(date => ({
      date,
      records: grouped[date]
    }))
  },

  switchTab(e) {
    this.setData({ currentTab: Number(e.currentTarget.dataset.index) })
  },

  changePeriod(e) {
    const chartPeriod = e.currentTarget.dataset.period
    const trendData = this.buildTrendData(this.data.records, this.data.selectedMetric, chartPeriod)
    this.setData({ chartPeriod, trendBars: trendData.bars, trendSummary: trendData.summary })
  },

  selectMetric(e) {
    const selectedMetric = e.currentTarget.dataset.type
    const trendData = this.buildTrendData(this.data.records, selectedMetric, this.data.chartPeriod)
    this.setData({ selectedMetric, trendBars: trendData.bars, trendSummary: trendData.summary })
  },

  addRecord() {
    this.setData({
      showAddModal: true,
      selectedType: '血压',
      inputValue: '',
      inputUnit: TYPE_META['血压'].unit,
      inputHint: TYPE_META['血压'].hint
    })
  },

  selectRecordType(e) {
    const selectedType = e.currentTarget.dataset.type
    const meta = TYPE_META[selectedType]
    this.setData({
      selectedType,
      inputUnit: meta.unit,
      inputHint: meta.hint,
      inputValue: ''
    })
  },

  onInputChange(e) {
    this.setData({ inputValue: e.detail.value })
  },

  confirmAddRecord() {
    const { selectedType, inputValue, inputUnit } = this.data
    const value = inputValue.trim()

    if (!value) {
      wx.showToast({ title: '请输入记录数值', icon: 'none' })
      return
    }

    wx.showLoading({ title: '添加中...' })
    wx.request({
      url: 'http://localhost:3000/api/health-records',
      method: 'POST',
      data: {
        user_id: this.getCurrentUserId(),
        type: selectedType,
        value,
        unit: inputUnit
      },
      success: res => {
        wx.hideLoading()
        if (res.data.success) {
          const records = [res.data.data, ...this.data.records]
          this.processRecords(records)
          wx.showToast({ title: '添加成功', icon: 'success' })
          this.setData({ showAddModal: false })
        } else {
          wx.showToast({ title: res.data.message || '添加失败', icon: 'none' })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '网络连接失败', icon: 'none' })
      }
    })
  },

  cancelAddRecord() {
    this.setData({ showAddModal: false })
  },

  onRecordTouchStart(e) {
    const touch = e.touches[0]
    this.setData({
      touchStartX: touch.clientX,
      touchStartY: touch.clientY
    })
  },

  onRecordTouchMove(e) {
    const touch = e.touches[0]
    const deltaX = touch.clientX - this.data.touchStartX
    const deltaY = touch.clientY - this.data.touchStartY
    if (Math.abs(deltaY) > Math.abs(deltaX)) return

    const id = Number(e.currentTarget.dataset.id)
    if (deltaX < -36 && this.data.activeDeleteId !== id) {
      this.setData({ activeDeleteId: id })
    } else if (deltaX > 36 && this.data.activeDeleteId === id) {
      this.setData({ activeDeleteId: null })
    }
  },

  onRecordTouchEnd(e) {
    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - this.data.touchStartX
    const deltaY = touch.clientY - this.data.touchStartY
    const id = Number(e.currentTarget.dataset.id)

    if (Math.abs(deltaY) > Math.abs(deltaX)) return
    if (deltaX < -56) {
      this.setData({ activeDeleteId: id })
    } else if (deltaX > 24 || Math.abs(deltaX) < 12) {
      this.setData({ activeDeleteId: null })
    }
  },

  deleteRecord(e) {
    const id = Number(e.currentTarget.dataset.id)
    if (!id) return

    wx.showModal({
      title: '删除记录',
      content: '确定要删除这条健康记录吗？',
      confirmColor: '#ff4d4f',
      success: res => {
        if (!res.confirm) return

        wx.showLoading({ title: '删除中...' })
        wx.request({
          url: `http://localhost:3000/api/health-records/${id}`,
          method: 'DELETE',
          success: res => {
            wx.hideLoading()
            if (res.data.success) {
              const records = this.data.records.filter(record => record.id !== id)
              this.processRecords(records)
              this.setData({ activeDeleteId: null })
              wx.showToast({ title: '删除成功', icon: 'success' })
            } else {
              wx.showToast({ title: res.data.message || '删除失败', icon: 'none' })
            }
          },
          fail: () => {
            wx.hideLoading()
            wx.showToast({ title: '网络连接失败', icon: 'none' })
          }
        })
      }
    })
  },

  stopPropagation() {},

  viewReport(e) {
    const report = this.data.reports.find(item => item.id === Number(e.currentTarget.dataset.id))
    wx.showToast({ title: report ? report.name : '查看报告', icon: 'none' })
  },

  parseRecordTime(value) {
    if (!value) return new Date()
    const normalized = String(value).replace(/\//g, '-')
    const match = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/)
    if (!match) return new Date(normalized)

    const [, year, month, day, hour = '0', minute = '0', second = '0'] = match
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    )
  },

  getDateKey(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  formatDate(date) {
    return this.getDateKey(date)
  },

  formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  },

  latestNumber(records, type, fallback) {
    const latest = records.find(record => record.type === type)
    return latest ? parseFloat(latest.value) || fallback : fallback
  },

  toChartValue(record) {
    if (record.type === '血压') {
      return parseFloat(String(record.value).split('/')[0]) || 0
    }
    return parseFloat(record.value) || 0
  },

  isNormal(type, value) {
    const number = parseFloat(value)
    if (type === '血糖') return number > 0 && number < 7
    if (type === '体温') return number >= 36 && number <= 37.3
    if (type === '心率') return number >= 60 && number <= 100
    if (type === '体重') return number >= 45 && number <= 100
    if (type === '血压') return this.bpStatus(value) === '正常'
    return true
  },

  bpStatus(value) {
    const parts = String(value).split('/').map(item => parseFloat(item))
    if (parts.length < 2 || parts.some(Number.isNaN)) return '待确认'
    return parts[0] < 140 && parts[1] < 90 ? '正常' : '偏高'
  }
})
