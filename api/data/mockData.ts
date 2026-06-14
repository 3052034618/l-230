import type {
  CorridorSection,
  SensorData,
  Device,
  Alert,
  AlertTimelineEvent,
  MaintenanceEvent,
  InspectionPlan,
  RiskPrediction,
  InspectionRoute,
  OperationReport,
  User,
  DashboardSummary,
  FailureRankingItem,
  HeatmapPoint,
  SensorTrendPoint,
  ApprovalStep,
} from '../../src/types';

function formatDate(d: Date): string {
  return d.toISOString();
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function hoursAgo(n: number): Date {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d;
}

function minutesAgo(n: number): Date {
  const d = new Date();
  d.setMinutes(d.getMinutes() - n);
  return d;
}

function generateId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getProvinceCode(province: string): string {
  const codeMap: Record<string, string> = {
    '北京': 'bj',
    '上海': 'sh',
    '广东': 'gd',
    '江苏': 'js',
    '浙江': 'zj',
    '四川': 'sc',
    '湖北': 'hb',
    '山东': 'sd',
    '陕西': 'sx',
  };
  return codeMap[province] || province.slice(0, 2).toLowerCase();
}

function getCityCode(city: string): string {
  const codeMap: Record<string, string> = {
    '北京市': 'bj',
    '上海市': 'sh',
    '广州市': 'gz',
    '深圳市': 'sz',
    '南京市': 'nj',
    '苏州市': 'sz2',
    '杭州市': 'hz',
    '宁波市': 'nb',
    '成都市': 'cd',
    '武汉市': 'wh',
    '济南市': 'jn',
    '西安市': 'xa',
  };
  return codeMap[city] || city.replace(/市$/, '').slice(0, 2).toLowerCase();
}

function getUserRegionCode(user: User | undefined | null): string {
  if (!user) return 'national';
  if (user.level === 'national') return 'national';
  if (user.level === 'provincial' && user.province) return getProvinceCode(user.province);
  if (user.level === 'municipal' && user.city) return getCityCode(user.city);
  return 'national';
}

interface GasExceedTracker {
  [corridorId: string]: {
    [sensorType: string]: {
      exceedStartTime: string | null;
      currentValue: number;
      peakValue: number;
    };
  };
}

const gasExceedTracker: GasExceedTracker = {};

function getGasExceedInfo(corridorId: string, sensorType: string) {
  if (!gasExceedTracker[corridorId]) {
    gasExceedTracker[corridorId] = {};
  }
  if (!gasExceedTracker[corridorId][sensorType]) {
    gasExceedTracker[corridorId][sensorType] = {
      exceedStartTime: null,
      currentValue: 0,
      peakValue: 0,
    };
  }
  return gasExceedTracker[corridorId][sensorType];
}

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    username: 'hq_director',
    name: '张建国',
    role: 'hq_director',
    level: 'national',
    region: '全国',
  },
  {
    id: 'u2',
    username: 'regional_gd',
    name: '李明华',
    role: 'regional_manager',
    level: 'provincial',
    province: '广东',
  },
  {
    id: 'u3',
    username: 'duty_bj',
    name: '王志强',
    role: 'duty_officer',
    level: 'municipal',
    province: '北京',
    city: '北京市',
  },
  {
    id: 'u4',
    username: 'duty_sh',
    name: '陈晓东',
    role: 'duty_officer',
    level: 'municipal',
    province: '上海',
    city: '上海市',
  },
  {
    id: 'u5',
    username: 'inspector_gz',
    name: '刘海峰',
    role: 'inspector',
    level: 'municipal',
    province: '广东',
    city: '广州市',
  },
];

const CORRIDOR_BASE = [
  { id: 'c1', name: '中关村西区综合管廊', city: '北京市', province: '北京', lng: 116.31, lat: 39.98, length: 5.2, year: 2018 },
  { id: 'c2', name: 'CBD东扩管廊工程', city: '北京市', province: '北京', lng: 116.47, lat: 39.92, length: 3.8, year: 2020 },
  { id: 'c3', name: '陆家嘴金融区管廊', city: '上海市', province: '上海', lng: 121.50, lat: 31.24, length: 6.1, year: 2017 },
  { id: 'c4', name: '浦东新区张江管廊', city: '上海市', province: '上海', lng: 121.59, lat: 31.21, length: 8.5, year: 2019 },
  { id: 'c5', name: '珠江新城核心区管廊', city: '广州市', province: '广东', lng: 113.32, lat: 23.12, length: 4.7, year: 2016 },
  { id: 'c6', name: '前海自贸区综合管廊', city: '深圳市', province: '广东', lng: 113.90, lat: 22.53, length: 7.3, year: 2021 },
  { id: 'c7', name: '南山科技园管廊', city: '深圳市', province: '广东', lng: 113.94, lat: 22.54, length: 5.9, year: 2018 },
  { id: 'c8', name: '河西新城综合管廊', city: '南京市', province: '江苏', lng: 118.74, lat: 32.03, length: 4.2, year: 2019 },
  { id: 'c9', name: '苏州工业园管廊', city: '苏州市', province: '江苏', lng: 120.70, lat: 31.32, length: 9.1, year: 2015 },
  { id: 'c10', name: '钱江世纪城综合管廊', city: '杭州市', province: '浙江', lng: 120.21, lat: 30.25, length: 5.6, year: 2020 },
  { id: 'c11', name: '滨海新区中心商务区管廊', city: '宁波市', province: '浙江', lng: 121.55, lat: 29.87, length: 3.4, year: 2017 },
  { id: 'c12', name: '天府新区核心管廊', city: '成都市', province: '四川', lng: 104.07, lat: 30.43, length: 6.8, year: 2021 },
  { id: 'c13', name: '东湖高新区管廊', city: '武汉市', province: '湖北', lng: 114.41, lat: 30.48, length: 5.1, year: 2018 },
  { id: 'c14', name: '奥体新城综合管廊', city: '济南市', province: '山东', lng: 117.09, lat: 36.67, length: 4.5, year: 2019 },
  { id: 'c15', name: '高新区软件新城管廊', city: '西安市', province: '陕西', lng: 108.88, lat: 34.24, length: 3.9, year: 2020 },
];

export const MOCK_CORRIDORS: CorridorSection[] = CORRIDOR_BASE.map((c, i) => {
  const healthBase = 95 - i * 1.8;
  const deviceAvailBase = 98 - i * 1.1;
  const failureBase = 1.2 + i * 0.35;
  return {
    id: c.id,
    name: c.name,
    city: c.city,
    province: c.province,
    length: c.length,
    constructionYear: c.year,
    status: i % 7 === 0 ? 'maintenance' : i % 11 === 0 ? 'offline' : 'online',
    healthIndex: Math.max(45, Math.min(99, healthBase + (Math.random() - 0.5) * 5)),
    deviceAvailability: Math.max(75, Math.min(99.9, deviceAvailBase + (Math.random() - 0.5) * 3)),
    failureRate: Math.max(0.2, failureBase + (Math.random() - 0.5) * 0.5),
    coordinates: { lng: c.lng, lat: c.lat },
  };
});

const SENSOR_TYPES = [
  { type: 'temperature', unit: '°C', warn: 35, danger: 45, baseVal: 25 },
  { type: 'humidity', unit: '%', warn: 80, danger: 90, baseVal: 60 },
  { type: 'gas_ch4', unit: '%LEL', warn: 25, danger: 50, baseVal: 5 },
  { type: 'gas_co', unit: 'ppm', warn: 24, danger: 100, baseVal: 8 },
  { type: 'gas_h2s', unit: 'ppm', warn: 10, danger: 20, baseVal: 2 },
  { type: 'oxygen', unit: '%', warn: 19.5, danger: 18, baseVal: 20.9 },
];

export function generateSensorData(corridorId: string): SensorData[] {
  return SENSOR_TYPES.map((s, i) => {
    const variation = (Math.random() - 0.5) * s.baseVal * 0.4;
    const value = Math.max(0, s.baseVal + variation + (i === 2 ? Math.random() * 15 : 0));
    let status: 'normal' | 'warning' | 'danger' = 'normal';
    if (s.type === 'oxygen') {
      if (value < s.danger) status = 'danger';
      else if (value < s.warn) status = 'warning';
    } else {
      if (value >= s.danger) status = 'danger';
      else if (value >= s.warn) status = 'warning';
    }
    return {
      id: `${corridorId}-s${i}`,
      corridorId,
      type: s.type as SensorData['type'],
      value: Number(value.toFixed(2)),
      unit: s.unit,
      threshold: { warning: s.warn, danger: s.danger },
      timestamp: formatDate(new Date()),
      status,
    };
  });
}

export function generateSensorTrend(corridorId: string, sensorType: string): SensorTrendPoint[] {
  const points: SensorTrendPoint[] = [];
  const now = new Date();
  const sensor = SENSOR_TYPES.find((s) => s.type === sensorType);
  const base = sensor?.baseVal || 25;
  const warn = sensor?.warn || base * 1.5;

  const activeAlert = MOCK_ALERTS.find(
    (a) => a.corridorId === corridorId && a.status !== 'closed' && a.type === 'gas_exceed' && a.sensorType === sensorType
  );

  const exceedInfo = getGasExceedInfo(corridorId, sensorType);

  for (let i = 168; i >= 0; i -= 1) {
    const time = new Date(now.getTime() - i * 3600 * 1000);
    const dayVariation = Math.sin((i / 24) * Math.PI * 2) * base * 0.15;
    const randomVariation = (Math.random() - 0.5) * base * 0.1;
    let value = base + dayVariation + randomVariation;

    if (activeAlert && i < 24) {
      const exceedMultiplier = 1.5 + (24 - i) / 24 * 0.8;
      value = warn * exceedMultiplier;
    } else if (activeAlert && i >= 24 && i < 48) {
      value = warn * 1.2;
    }

    if (i < 2 && activeAlert && activeAlert.status === 'closed') {
      value = base * 0.9;
    }

    points.push({
      timestamp: formatDate(time),
      value: Number(Math.max(0, value).toFixed(2)),
    });
  }

  if (activeAlert) {
    exceedInfo.exceedStartTime = activeAlert.createdAt;
    exceedInfo.currentValue = points[points.length - 1].value;
    exceedInfo.peakValue = Math.max(...points.map((p) => p.value));
  }

  return points;
}

export function generateDevices(corridorId: string): Device[] {
  const deviceTypes: Device['type'][] = ['lighting', 'fan', 'pump', 'door', 'camera'];
  const counts = [12, 6, 4, 2, 8];
  const devices: Device[] = [];
  let idx = 0;
  deviceTypes.forEach((type, ti) => {
    for (let i = 0; i < counts[ti]; i++) {
      const rnd = Math.random();
      const status: Device['status'] = rnd > 0.9 ? 'fault' : rnd > 0.85 ? 'offline' : 'online';
      devices.push({
        id: `${corridorId}-d${idx++}`,
        corridorId,
        type,
        name: `${type}-${String(i + 1).padStart(3, '0')}`,
        status,
        lastMaintenance: formatDate(daysAgo(Math.floor(Math.random() * 90))),
        runningHours: Math.floor(1000 + Math.random() * 8000),
      });
    }
  });
  return devices;
}

let alertIdCounter = 10;

function createApprovalFlow(): ApprovalStep[] {
  return [
    { id: `ap-${generateId()}`, level: 1, role: 'duty_officer', status: 'pending' },
    { id: `ap-${generateId()}`, level: 2, role: 'regional_manager', status: 'pending' },
    { id: `ap-${generateId()}`, level: 3, role: 'hq_director', status: 'pending' },
  ];
}

function createTimelineEvent(
  type: AlertTimelineEvent['type'],
  timestamp: string,
  operator: string,
  description: string,
  result?: string,
  stepLevel?: number
): AlertTimelineEvent {
  return {
    id: `tl-${generateId()}`,
    type,
    timestamp,
    operator,
    description,
    result,
    stepLevel,
  };
}

export function addTimelineEvent(
  alertId: string,
  type: AlertTimelineEvent['type'],
  operator: string,
  description: string,
  result?: string,
  stepLevel?: number
): Alert | undefined {
  const alert = MOCK_ALERTS.find((a) => a.id === alertId);
  if (!alert) return undefined;

  const event = createTimelineEvent(
    type,
    formatDate(new Date()),
    operator,
    description,
    result,
    stepLevel
  );

  alert.timeline.push(event);
  alert.timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return alert;
}

function createAlertFromCorridor(
  corridor: CorridorSection,
  type: 'gas_exceed' | 'device_low_availability',
  sensorInfo?: { sensorType: string; thresholdValue: number; actualValue: number; durationMinutes: number }
): Alert {
  const id = `a${++alertIdCounter}`;
  const now = new Date();

  if (type === 'gas_exceed' && sensorInfo) {
    const createdAt = formatDate(minutesAgo(sensorInfo.durationMinutes));
    return {
      id,
      corridorId: corridor.id,
      corridorName: corridor.name,
      level: 1,
      type: 'gas_exceed',
      title: `${sensorInfo.sensorType === 'gas_ch4' ? '甲烷' : sensorInfo.sensorType === 'gas_co' ? '一氧化碳' : '硫化氢'}浓度超标预警`,
      description: `${corridor.name}检测到${sensorInfo.sensorType === 'gas_ch4' ? 'CH4' : sensorInfo.sensorType === 'gas_co' ? 'CO' : 'H2S'}浓度${sensorInfo.actualValue}${sensorInfo.sensorType === 'gas_ch4' ? '%LEL' : 'ppm'}，已连续超标${sensorInfo.durationMinutes}分钟`,
      sensorType: sensorInfo.sensorType,
      thresholdValue: sensorInfo.thresholdValue,
      actualValue: sensorInfo.actualValue,
      durationMinutes: sensorInfo.durationMinutes,
      status: 'pending',
      createdAt,
      deadline: formatDate(new Date(now.getTime() + 2 * 3600 * 1000)),
      timeline: [
        createTimelineEvent(
          'created',
          createdAt,
          '系统',
          `${sensorInfo.sensorType === 'gas_ch4' ? 'CH4' : sensorInfo.sensorType === 'gas_co' ? 'CO' : 'H2S'}浓度${sensorInfo.actualValue}${sensorInfo.sensorType === 'gas_ch4' ? '%LEL' : 'ppm'}，超过阈值${sensorInfo.thresholdValue}${sensorInfo.sensorType === 'gas_ch4' ? '%LEL' : 'ppm'}，持续${sensorInfo.durationMinutes}分钟，自动生成一级预警`
        ),
      ],
    };
  }

  const createdAt = formatDate(hoursAgo(1));
  return {
    id,
    corridorId: corridor.id,
    corridorName: corridor.name,
    level: 1,
    type: 'device_low_availability',
    title: '设备可用率低于阈值',
    description: `${corridor.name}设备可用率${corridor.deviceAvailability.toFixed(1)}%，已连续低于90%`,
    status: 'pending',
    createdAt,
    deadline: formatDate(new Date(now.getTime() + 2 * 3600 * 1000)),
    timeline: [
      createTimelineEvent(
        'created',
        createdAt,
        '系统',
        `设备可用率${corridor.deviceAvailability.toFixed(1)}%，持续低于阈值90%，自动生成一级预警`
      ),
    ],
  };
}

export let MOCK_ALERTS: Alert[] = [
  {
    id: 'a1',
    corridorId: 'c5',
    corridorName: '珠江新城核心区管廊',
    level: 1,
    type: 'gas_exceed',
    title: '甲烷浓度超标预警',
    description: '珠江新城管廊A段CH4传感器检测到浓度28.5%LEL，已连续超标8分钟',
    sensorType: 'gas_ch4',
    thresholdValue: 25,
    actualValue: 28.5,
    durationMinutes: 8,
    status: 'pending',
    createdAt: formatDate(hoursAgo(0.5)),
    deadline: formatDate(new Date(Date.now() + 1.5 * 3600 * 1000)),
    handler: '王志强',
    timeline: [
      createTimelineEvent(
        'created',
        formatDate(hoursAgo(0.5)),
        '系统',
        'CH4浓度28.5%LEL，超过阈值25%LEL，持续8分钟，自动生成一级预警'
      ),
    ],
  },
  {
    id: 'a2',
    corridorId: 'c6',
    corridorName: '前海自贸区综合管廊',
    level: 2,
    type: 'gas_exceed',
    title: '硫化氢浓度连续超标',
    description: '前海管廊B段H2S浓度持续超过警戒值10ppm，已达22ppm，2小时内未完成处置',
    sensorType: 'gas_h2s',
    thresholdValue: 10,
    actualValue: 22,
    durationMinutes: 145,
    status: 'processing',
    createdAt: formatDate(hoursAgo(3)),
    deadline: formatDate(new Date(Date.now() + 4 * 3600 * 1000)),
    approvalFlow: [
      { id: 'ap1', level: 1, role: 'duty_officer', approver: '陈晓东', status: 'approved', comment: '已确认现场情况，建议启动紧急排风', approvedAt: formatDate(hoursAgo(2.5)), requiredAction: 'ventilation' },
      { id: 'ap2', level: 2, role: 'regional_manager', approver: '李明华', status: 'approved', comment: '同意启动排风，请总部批示', approvedAt: formatDate(hoursAgo(1)), requiredAction: 'ventilation' },
      { id: 'ap3', level: 3, role: 'hq_director', status: 'pending', requiredAction: 'ventilation' },
    ] as ApprovalStep[],
    timeline: [
      createTimelineEvent(
        'created',
        formatDate(hoursAgo(3)),
        '系统',
        'H2S浓度12ppm，超过阈值10ppm，持续15分钟，自动生成一级预警'
      ),
      createTimelineEvent(
        'escalated',
        formatDate(hoursAgo(1.5)),
        '系统',
        '预警超过2小时未处置，自动升级为二级预警，启动三级审批流程'
      ),
      createTimelineEvent(
        'status_changed',
        formatDate(hoursAgo(2.5)),
        '陈晓东',
        '预警状态从 pending 变更为 processing',
        '开始处置'
      ),
      createTimelineEvent(
        'approval',
        formatDate(hoursAgo(2.5)),
        '陈晓东',
        '一级审批：已确认现场情况，建议启动紧急排风',
        'approved',
        1
      ),
      createTimelineEvent(
        'approval',
        formatDate(hoursAgo(1)),
        '李明华',
        '二级审批：同意启动排风，请总部批示',
        'approved',
        2
      ),
    ],
  },
  {
    id: 'a3',
    corridorId: 'c3',
    corridorName: '陆家嘴金融区管廊',
    level: 1,
    type: 'device_low_availability',
    title: '设备可用率低于阈值',
    description: '陆家嘴管廊设备可用率87.3%，已连续低于90%达95分钟',
    status: 'processing',
    createdAt: formatDate(hoursAgo(2)),
    deadline: formatDate(new Date(Date.now() + 25 * 60 * 1000)),
    handler: '陈晓东',
    timeline: [
      createTimelineEvent(
        'created',
        formatDate(hoursAgo(2)),
        '系统',
        '设备可用率87.3%，持续低于阈值90%，自动生成一级预警'
      ),
      createTimelineEvent(
        'status_changed',
        formatDate(hoursAgo(1.5)),
        '陈晓东',
        '预警状态从 pending 变更为 processing',
        '开始处置'
      ),
    ],
  },
  {
    id: 'a4',
    corridorId: 'c1',
    corridorName: '中关村西区综合管廊',
    level: 1,
    type: 'gas_exceed',
    title: 'CO浓度瞬时超标',
    description: '中关村管廊C段CO传感器检测到浓度32ppm，超过警戒值24ppm',
    sensorType: 'gas_co',
    thresholdValue: 24,
    actualValue: 32,
    durationMinutes: 3,
    status: 'closed',
    createdAt: formatDate(hoursAgo(5)),
    deadline: formatDate(hoursAgo(3)),
    handler: '王志强',
    timeline: [
      createTimelineEvent(
        'created',
        formatDate(hoursAgo(5)),
        '系统',
        'CO浓度32ppm，超过阈值24ppm，持续3分钟，自动生成一级预警'
      ),
      createTimelineEvent(
        'status_changed',
        formatDate(hoursAgo(4.5)),
        '王志强',
        '预警状态从 pending 变更为 processing',
        '开始处置'
      ),
      createTimelineEvent(
        'closed',
        formatDate(hoursAgo(3.5)),
        '王志强',
        '现场通风处置后，CO浓度恢复至18ppm，低于警戒值，预警关闭',
        '已恢复'
      ),
    ],
  },
  {
    id: 'a5',
    corridorId: 'c12',
    corridorName: '天府新区核心管廊',
    level: 2,
    type: 'device_low_availability',
    title: '设备可用率持续偏低',
    description: '天府新区管廊设备可用率85.6%，已连续3小时低于90%，需启动三级审批',
    status: 'escalated',
    createdAt: formatDate(hoursAgo(8)),
    deadline: formatDate(new Date(Date.now() + 1 * 3600 * 1000)),
    approvalFlow: [
      { id: 'ap4', level: 1, role: 'duty_officer', status: 'pending' },
      { id: 'ap5', level: 2, role: 'regional_manager', status: 'pending' },
      { id: 'ap6', level: 3, role: 'hq_director', status: 'pending' },
    ] as ApprovalStep[],
    timeline: [
      createTimelineEvent(
        'created',
        formatDate(hoursAgo(8)),
        '系统',
        '设备可用率88.2%，持续低于阈值90%，自动生成一级预警'
      ),
      createTimelineEvent(
        'escalated',
        formatDate(hoursAgo(5)),
        '系统',
        '预警超过2小时未处置，自动升级为二级预警，启动三级审批流程'
      ),
    ],
  },
];

export function updateAlerts(): Alert[] {
  const now = new Date();
  const twoHoursMs = 2 * 60 * 60 * 1000;
  const tenMinutesMs = 10 * 60 * 1000;

  MOCK_ALERTS = MOCK_ALERTS.map((alert) => {
    if (alert.level === 1 && alert.status === 'pending') {
      const createdAt = new Date(alert.createdAt).getTime();
      const elapsed = now.getTime() - createdAt;

      if (elapsed >= twoHoursMs) {
        return {
          ...alert,
          level: 2,
          status: 'escalated',
          approvalFlow: createApprovalFlow(),
          deadline: formatDate(new Date(now.getTime() + 4 * 3600 * 1000)),
          description: `${alert.description}（已自动升级为二级预警）`,
          timeline: [
            ...alert.timeline,
            createTimelineEvent(
              'escalated',
              formatDate(now),
              '系统',
              '预警超过2小时未处置，自动升级为二级预警，启动三级审批流程'
            ),
          ],
        };
      }
    }
    return alert;
  });

  MOCK_CORRIDORS.forEach((corridor) => {
    const hasActiveDeviceAlert = MOCK_ALERTS.some(
      (a) => a.corridorId === corridor.id && a.status !== 'closed' && a.status !== 'rejected' && a.type === 'device_low_availability'
    );

    if (!hasActiveDeviceAlert && corridor.deviceAvailability < 90) {
      const newAlert = createAlertFromCorridor(corridor, 'device_low_availability');
      MOCK_ALERTS.push(newAlert);
    }

    const gasSensorTypes = ['gas_ch4', 'gas_co', 'gas_h2s'];
    gasSensorTypes.forEach((sensorType) => {
      const hasActiveGasAlert = MOCK_ALERTS.some(
        (a) => a.corridorId === corridor.id && a.status !== 'closed' && a.status !== 'rejected' && a.type === 'gas_exceed' && a.sensorType === sensorType
      );

      if (!hasActiveGasAlert) {
        const exceedInfo = getGasExceedInfo(corridor.id, sensorType);
        if (exceedInfo.exceedStartTime) {
          const exceedDuration = now.getTime() - new Date(exceedInfo.exceedStartTime).getTime();
          if (exceedDuration >= tenMinutesMs) {
            const sensor = SENSOR_TYPES.find((s) => s.type === sensorType);
            const newAlert = createAlertFromCorridor(
              corridor,
              'gas_exceed',
              {
                sensorType,
                thresholdValue: sensor?.warn || 25,
                actualValue: exceedInfo.currentValue,
                durationMinutes: Math.floor(exceedDuration / 60000),
              }
            );
            MOCK_ALERTS.push(newAlert);
          }
        }
      }
    });
  });

  return MOCK_ALERTS;
}

export function generateMaintenanceEvents(corridorId: string): MaintenanceEvent[] {
  const types: MaintenanceEvent['type'][] = ['repair', 'inspection', 'alert_response', 'preventive'];
  const events: MaintenanceEvent[] = [];
  for (let i = 0; i < 12; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const days = Math.floor(Math.random() * 60);
    const start = daysAgo(days);
    const end = new Date(start.getTime() + (Math.floor(Math.random() * 8) + 1) * 3600 * 1000);
    const status: MaintenanceEvent['status'] = days === 0 && Math.random() > 0.5 ? 'in_progress' : days < 2 ? 'planned' : 'completed';
    events.push({
      id: `m-${corridorId}-${i}`,
      corridorId,
      type,
      title: type === 'repair' ? '风机故障维修' : type === 'inspection' ? '月度例行巡检' : type === 'alert_response' ? '气体超标应急处置' : '季度预防性维护',
      description: `对${type === 'repair' ? '3号通风风机进行检修更换轴承' : type === 'inspection' ? '全段设备状态检查及数据校准' : type === 'alert_response' ? 'CH4浓度超标现场排查及排风处置' : '排水系统、照明系统全面检查'}`,
      deviceName: type !== 'inspection' ? `设备-${String(Math.floor(Math.random() * 20) + 1).padStart(3, '0')}` : undefined,
      personnel: ['刘海峰', '张伟', '李刚'].slice(0, Math.floor(Math.random() * 2) + 1),
      startTime: formatDate(start),
      endTime: status === 'completed' ? formatDate(end) : undefined,
      status,
      result: status === 'completed' ? '处置完成，设备恢复正常运行' : undefined,
    });
  }
  return events.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
}

export let MOCK_INSPECTION_PLANS: InspectionPlan[] = [
  {
    id: 'ip1',
    year: 2026,
    uploadedAt: formatDate(daysAgo(15)),
    uploadedBy: '李明华',
    status: 'approved',
    nodes: MOCK_CORRIDORS.slice(0, 10).map((c, i) => ({
      id: `ipn-${i}`,
      corridorId: c.id,
      corridorName: c.name,
      plannedDate: formatDate(new Date(Date.now() + (i + 1) * 7 * 86400000)),
      priority: i < 3 ? 'high' : i < 7 ? 'medium' : 'low',
      inspector: i % 2 === 0 ? '刘海峰' : '张伟',
    })),
  },
];

export function addInspectionPlan(plan: Omit<InspectionPlan, 'id' | 'uploadedAt'> & { id?: string; uploadedAt?: string }): InspectionPlan {
  if (plan.year === undefined || plan.year === null) {
    throw new Error('年度参数不能为空');
  }
  const newPlan: InspectionPlan = {
    ...plan,
    year: plan.year,
    id: plan.id || `ip-${Date.now()}`,
    uploadedAt: plan.uploadedAt || formatDate(new Date()),
  };
  MOCK_INSPECTION_PLANS.push(newPlan);
  return newPlan;
}

export const MOCK_RISK_PREDICTIONS: RiskPrediction[] = MOCK_CORRIDORS.map((c, i) => ({
  corridorId: c.id,
  corridorName: c.name,
  city: c.city,
  riskLevel: i < 3 ? 'high' : i < 8 ? 'medium' : 'low',
  confidence: 60 + Math.random() * 35,
  predictionWindow: '未来90天',
  riskFactors: [
    '设备老化风险高',
    '历史故障率偏高',
    '距上次巡检超过60天',
    '传感器数据异常波动',
    '地处高湿高腐蚀环境',
  ].slice(0, Math.floor(Math.random() * 3) + 1),
  historicalFailures: Math.floor(Math.random() * 8) + 1,
  lastInspection: formatDate(daysAgo(Math.floor(Math.random() * 100) + 10)),
}));

export const MOCK_INSPECTION_ROUTES: InspectionRoute[] = [
  {
    id: 'r1',
    name: '珠三角高风险管廊巡检路线',
    date: formatDate(new Date(Date.now() + 2 * 86400000)).split('T')[0],
    corridorCount: 3,
    totalDistance: 145,
    estimatedDuration: 480,
    stops: [
      { corridorId: 'c5', corridorName: '珠江新城核心区管廊', address: '广州市天河区珠江新城', order: 1, estimatedArrival: '09:00', tasks: ['设备全面检查', '气体传感器校准', '排风系统测试'] },
      { corridorId: 'c6', corridorName: '前海自贸区综合管廊', address: '深圳市南山区前海', order: 2, estimatedArrival: '12:30', tasks: ['故障设备维修', '安全隐患排查'] },
      { corridorId: 'c7', corridorName: '南山科技园管廊', address: '深圳市南山区科技园', order: 3, estimatedArrival: '15:00', tasks: ['例行巡检', '数据采集'] },
    ],
    spareParts: [
      { id: 'sp1', name: '气体传感器模块', quantity: 4, unit: '个', forCorridors: ['c5', 'c6'] },
      { id: 'sp2', name: '风机轴承套件', quantity: 2, unit: '套', forCorridors: ['c6'] },
      { id: 'sp3', name: 'LED驱动电源', quantity: 6, unit: '个', forCorridors: ['c5', 'c7'] },
    ],
  },
];

const reportCache = new Map<string, OperationReport>();

export function generateReportForUser(user: User | undefined | null, weekOffset = 0): OperationReport {
  const regionCode = getUserRegionCode(user);
  const level = user?.level || 'national';
  let regionName = '全国';
  if (level === 'provincial' && user?.province) {
    regionName = user.province;
  } else if (level === 'municipal' && user?.city) {
    regionName = user.city;
  }
  const year = 2026;
  const weekNum = 24 - weekOffset;
  const reportId = `rep-${regionCode}-${year}-w${weekNum}`;

  if (reportCache.has(reportId)) {
    return reportCache.get(reportId)!;
  }

  const corridors = filterCorridorsByUser(user, MOCK_CORRIDORS);
  const alerts = filterAlertsByUser(user, MOCK_ALERTS);

  const start = daysAgo((weekOffset + 1) * 7);
  const end = daysAgo(weekOffset * 7);

  const avgHealthIndex = corridors.length > 0
    ? corridors.reduce((s, c) => s + c.healthIndex, 0) / corridors.length
    : 0;
  const avgDeviceAvailability = corridors.length > 0
    ? corridors.reduce((s, c) => s + c.deviceAvailability, 0) / corridors.length
    : 0;

  const lowHealthCorridors = corridors.filter((c) => c.healthIndex < 85);
  const highFailureCorridors = corridors.filter((c) => c.failureRate > 3);

  const recommendations: string[] = [];
  if (lowHealthCorridors.length > 0) {
    recommendations.push(`建议增加对${lowHealthCorridors[0].name}的巡检频次至每周1次`);
  }
  if (highFailureCorridors.length > 0) {
    recommendations.push(`${highFailureCorridors[0].name}设备故障率偏高，建议安排全面检修`);
  }

  if (level === 'national') {
    recommendations.push('统筹全国管廊运维资源，向高风险区域倾斜');
    recommendations.push('优化跨区域应急响应联动机制');
  } else if (level === 'provincial') {
    recommendations.push(`${regionName}省内管廊通风设备备件库存需补充`);
    recommendations.push('加强省内各城市管廊运维人员培训');
  } else if (level === 'municipal') {
    recommendations.push(`${regionName}管廊气体传感器需安排校准`);
    recommendations.push('优化本市巡检路线，提高巡检效率');
  }

  if (corridors.length > 3) {
    recommendations.push('优化高风险区域的传感器布点密度');
  }

  const report: OperationReport = {
    id: reportId,
    weekNumber: weekNum,
    year,
    region: regionName,
    level,
    startDate: formatDate(start),
    endDate: formatDate(end),
    generatedAt: formatDate(end),
    summary: {
      avgHealthIndex: Number(avgHealthIndex.toFixed(1)),
      healthIndexYoY: 2.3 - weekOffset * 0.1,
      healthIndexWoW: weekOffset === 0 ? 0.5 : weekOffset === 1 ? -0.3 : (Math.random() - 0.5) * 1,
      totalAlerts: Math.max(0, Math.floor(alerts.length * 0.8 + Math.random() * 5)),
      avgDeviceAvailability: Number(avgDeviceAvailability.toFixed(1)),
      maintenanceTimelyRate: 92 - weekOffset * 0.5,
      corridorCount: corridors.length,
    },
    failureDistribution: [
      { category: '通风设备故障', count: Math.floor(5 + Math.random() * 5), percentage: 32 },
      { category: '气体传感器异常', count: Math.floor(4 + Math.random() * 4), percentage: 24 },
      { category: '照明系统故障', count: Math.floor(3 + Math.random() * 3), percentage: 20 },
      { category: '排水泵故障', count: Math.floor(2 + Math.random() * 2), percentage: 12 },
      { category: '其他', count: Math.floor(2 + Math.random() * 2), percentage: 12 },
    ],
    trendComparison: Array.from({ length: 6 }).map((_, j) => ({
      week: `W${weekNum - 5 + j}`,
      healthIndex: Number((87 + Math.random() * 3).toFixed(1)),
      failureRate: Number((2 + Math.random() * 1).toFixed(2)),
    })),
    recommendations: recommendations.slice(0, Math.max(2, recommendations.length)),
    topCorridors: corridors.slice(0, 5).map((c) => ({
      id: c.id,
      name: c.name,
      healthIndex: c.healthIndex,
      failureRate: c.failureRate,
    })),
  };

  reportCache.set(reportId, report);
  return report;
}

export function generateAllReportsForUser(user: User | undefined | null): OperationReport[] {
  const reports: OperationReport[] = [];
  for (let i = 0; i < 8; i++) {
    reports.push(generateReportForUser(user, i));
  }
  return reports;
}

export let MOCK_REPORTS: OperationReport[] = generateAllReportsForUser(null);

export function getReports(user?: User | null): OperationReport[] {
  return generateAllReportsForUser(user);
}

export function getReportById(id: string, user?: User | null): OperationReport | undefined {
  const allReports = generateAllReportsForUser(user);
  return allReports.find((r) => r.id === id);
}

export function filterCorridorsByUser(user: User | undefined | null, corridors: CorridorSection[]): CorridorSection[] {
  if (!user) return corridors;
  if (user.level === 'national') return corridors;
  if (user.level === 'provincial' && user.province) {
    return corridors.filter((c) => c.province === user.province);
  }
  if (user.level === 'municipal' && user.city) {
    return corridors.filter((c) => c.city === user.city);
  }
  return corridors;
}

export function filterAlertsByUser(user: User | undefined | null, alerts: Alert[]): Alert[] {
  if (!user) return alerts;
  if (user.level === 'national') return alerts;

  const corridorIds = filterCorridorsByUser(user, MOCK_CORRIDORS).map((c) => c.id);
  return alerts.filter((a) => corridorIds.includes(a.corridorId));
}

export function filterReportsByUser(user: User | undefined | null, reports: OperationReport[]): OperationReport[] {
  if (!user) return reports;
  if (user.level === 'national') return reports;
  return reports;
}

export function filterPredictionsByUser(user: User | undefined | null, predictions: RiskPrediction[]): RiskPrediction[] {
  if (!user) return predictions;
  if (user.level === 'national') return predictions;

  const corridorIds = filterCorridorsByUser(user, MOCK_CORRIDORS).map((c) => c.id);
  return predictions.filter((p) => corridorIds.includes(p.corridorId));
}

export function getDashboardSummary(user?: User | null): DashboardSummary {
  const corridors = filterCorridorsByUser(user, MOCK_CORRIDORS);
  const alerts = filterAlertsByUser(user, MOCK_ALERTS);
  const onlineCount = corridors.filter((c) => c.status === 'online').length;
  return {
    totalCorridors: corridors.length,
    onlineRate: corridors.length > 0 ? (onlineCount / corridors.length) * 100 : 0,
    avgHealthIndex: corridors.length > 0 ? corridors.reduce((s, c) => s + c.healthIndex, 0) / corridors.length : 0,
    avgDeviceAvailability: corridors.length > 0 ? corridors.reduce((s, c) => s + c.deviceAvailability, 0) / corridors.length : 0,
    activeAlerts: alerts.filter((a) => a.status !== 'closed').length,
    level1Alerts: alerts.filter((a) => a.level === 1 && a.status !== 'closed').length,
    level2Alerts: alerts.filter((a) => a.level === 2 && a.status !== 'closed').length,
  };
}

export function getHeatmapData(user?: User | null): HeatmapPoint[] {
  const corridors = filterCorridorsByUser(user, MOCK_CORRIDORS);
  return corridors.map((c) => ({
    id: c.id,
    name: c.name,
    city: c.city,
    province: c.province,
    value: c.healthIndex,
    healthIndex: c.healthIndex,
    coordinates: [c.coordinates.lng, c.coordinates.lat],
  }));
}

export function getFailureRanking(limit = 10, user?: User | null): FailureRankingItem[] {
  const corridors = filterCorridorsByUser(user, MOCK_CORRIDORS);
  return [...corridors]
    .sort((a, b) => b.failureRate - a.failureRate)
    .slice(0, limit)
    .map((c) => ({
      id: c.id,
      name: c.name,
      city: c.city,
      failureRate: c.failureRate,
      failureCount: Math.floor(c.failureRate * 5 + Math.random() * 3),
    }));
}
