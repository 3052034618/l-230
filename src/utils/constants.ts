export const SENSOR_TYPE_LABELS: Record<string, string> = {
  temperature: '温度',
  humidity: '湿度',
  gas_ch4: '甲烷(CH4)',
  gas_co: '一氧化碳(CO)',
  gas_h2s: '硫化氢(H2S)',
  oxygen: '氧气(O2)',
};

export const DEVICE_TYPE_LABELS: Record<string, string> = {
  lighting: '照明系统',
  fan: '通风风机',
  pump: '排水泵',
  door: '防护门',
  camera: '监控摄像头',
};

export const ALERT_STATUS_LABELS: Record<string, string> = {
  pending: '待处理',
  processing: '处理中',
  approved: '已批准',
  rejected: '已驳回',
  closed: '已关闭',
  escalated: '已升级',
};

export const ALERT_TYPE_LABELS: Record<string, string> = {
  gas_exceed: '气体浓度超标',
  device_low_availability: '设备可用率低',
  other: '其他预警',
};

export const MAINTENANCE_TYPE_LABELS: Record<string, string> = {
  repair: '故障维修',
  inspection: '常规巡检',
  alert_response: '预警响应',
  preventive: '预防性维护',
};

export const RISK_LEVEL_LABELS: Record<string, string> = {
  high: '高风险',
  medium: '中风险',
  low: '低风险',
};

export const USER_ROLE_LABELS: Record<string, string> = {
  hq_director: '总部运营总监',
  regional_manager: '区域经理',
  duty_officer: '值班监控员',
  inspector: '巡检维修人员',
};

export const USER_LEVEL_LABELS: Record<string, string> = {
  national: '国家级',
  provincial: '省级',
  municipal: '市级',
};

export const CORRIDOR_STATUS_LABELS: Record<string, string> = {
  online: '运行中',
  offline: '离线',
  maintenance: '维护中',
};

export const DEVICE_STATUS_LABELS: Record<string, string> = {
  online: '在线运行',
  offline: '离线',
  fault: '故障',
};

export const CHINA_PROVINCES = [
  { name: '北京', cities: ['北京市'] },
  { name: '上海', cities: ['上海市'] },
  { name: '广东', cities: ['广州市', '深圳市', '东莞市', '佛山市'] },
  { name: '江苏', cities: ['南京市', '苏州市', '无锡市', '常州市'] },
  { name: '浙江', cities: ['杭州市', '宁波市', '温州市', '绍兴市'] },
  { name: '四川', cities: ['成都市', '绵阳市', '德阳市'] },
  { name: '湖北', cities: ['武汉市', '宜昌市', '襄阳市'] },
  { name: '山东', cities: ['济南市', '青岛市', '烟台市'] },
  { name: '陕西', cities: ['西安市', '咸阳市', '宝鸡市'] },
  { name: '重庆', cities: ['重庆市'] },
  { name: '天津', cities: ['天津市'] },
  { name: '福建', cities: ['福州市', '厦门市', '泉州市'] },
  { name: '安徽', cities: ['合肥市', '芜湖市', '蚌埠市'] },
  { name: '湖南', cities: ['长沙市', '株洲市', '湘潭市'] },
  { name: '河南', cities: ['郑州市', '洛阳市', '开封市'] },
];

export const COLORS = {
  primary: '#06B6D4',
  primaryDark: '#0891B2',
  bgDark: '#0F172A',
  bgDarker: '#020617',
  bgCard: '#1E293B',
  bgCardHover: '#334155',
  border: '#334155',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
};
