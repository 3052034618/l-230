export interface CorridorSection {
  id: string;
  name: string;
  city: string;
  province: string;
  length: number;
  constructionYear: number;
  status: 'online' | 'offline' | 'maintenance';
  healthIndex: number;
  deviceAvailability: number;
  failureRate: number;
  coordinates: { lng: number; lat: number };
}

export interface SensorData {
  id: string;
  corridorId: string;
  type: 'temperature' | 'humidity' | 'gas_ch4' | 'gas_co' | 'gas_h2s' | 'oxygen';
  value: number;
  unit: string;
  threshold: { warning: number; danger: number };
  timestamp: string;
  status: 'normal' | 'warning' | 'danger';
}

export interface SensorTrendPoint {
  timestamp: string;
  value: number;
}

export interface Device {
  id: string;
  corridorId: string;
  type: 'lighting' | 'fan' | 'pump' | 'door' | 'camera';
  name: string;
  status: 'online' | 'offline' | 'fault';
  lastMaintenance: string;
  runningHours: number;
}

export type AlertLevel = 1 | 2;
export type AlertType = 'gas_exceed' | 'device_low_availability' | 'other';
export type AlertStatus = 'pending' | 'processing' | 'approved' | 'rejected' | 'closed' | 'escalated';
export type AlertTimelineEventType = 'created' | 'escalated' | 'status_changed' | 'approval' | 'closed';

export interface AlertTimelineEvent {
  id: string;
  type: AlertTimelineEventType;
  timestamp: string;
  operator: string;
  description: string;
  result?: string;
  stepLevel?: number;
}

export interface Alert {
  id: string;
  corridorId: string;
  corridorName: string;
  level: AlertLevel;
  type: AlertType;
  title: string;
  description: string;
  sensorType?: string;
  thresholdValue?: number;
  actualValue?: number;
  durationMinutes?: number;
  status: AlertStatus;
  createdAt: string;
  deadline: string;
  approvalFlow?: ApprovalStep[];
  handler?: string;
  timeline: AlertTimelineEvent[];
}

export type ApprovalRole = 'duty_officer' | 'regional_manager' | 'hq_director';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type RequiredAction = 'ventilation' | 'seal' | 'inspection';

export interface ApprovalStep {
  id: string;
  level: 1 | 2 | 3;
  role: ApprovalRole;
  approver?: string;
  status: ApprovalStatus;
  comment?: string;
  approvedAt?: string;
  requiredAction?: RequiredAction;
}

export type MaintenanceEventType = 'repair' | 'inspection' | 'alert_response' | 'preventive';
export type MaintenanceEventStatus = 'planned' | 'in_progress' | 'completed';

export interface MaintenanceEvent {
  id: string;
  corridorId: string;
  type: MaintenanceEventType;
  title: string;
  description: string;
  deviceId?: string;
  deviceName?: string;
  personnel: string[];
  startTime: string;
  endTime?: string;
  status: MaintenanceEventStatus;
  result?: string;
}

export type InspectionPlanStatus = 'draft' | 'approved' | 'published';
export type Priority = 'high' | 'medium' | 'low';

export interface InspectionNode {
  id: string;
  corridorId: string;
  corridorName: string;
  plannedDate: string;
  inspector?: string;
  priority: Priority;
  year?: number;
}

export interface InspectionPlan {
  id: string;
  year: number;
  uploadedAt: string;
  uploadedBy: string;
  status: InspectionPlanStatus;
  nodes: InspectionNode[];
}

export interface RiskPrediction {
  corridorId: string;
  corridorName: string;
  city: string;
  riskLevel: Priority;
  confidence: number;
  predictionWindow: string;
  riskFactors: string[];
  historicalFailures: number;
  lastInspection: string;
}

export interface RouteStop {
  corridorId: string;
  corridorName: string;
  address: string;
  order: number;
  estimatedArrival: string;
  tasks: string[];
}

export interface SparePart {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  forCorridors: string[];
}

export interface InspectionRoute {
  id: string;
  name: string;
  date: string;
  corridorCount: number;
  totalDistance: number;
  estimatedDuration: number;
  stops: RouteStop[];
  spareParts: SparePart[];
}

export interface OperationReport {
  id: string;
  weekNumber: number;
  year: number;
  region: string;
  level?: string;
  startDate: string;
  endDate: string;
  generatedAt: string;
  summary: {
    avgHealthIndex: number;
    healthIndexYoY: number;
    healthIndexWoW: number;
    totalAlerts: number;
    avgDeviceAvailability: number;
    maintenanceTimelyRate: number;
    corridorCount?: number;
  };
  failureDistribution: { category: string; count: number; percentage: number }[];
  trendComparison: { week: string; healthIndex: number; failureRate: number }[];
  recommendations: string[];
  topCorridors?: {
    id: string;
    name: string;
    healthIndex: number;
    failureRate: number;
  }[];
}

export type UserRole = 'hq_director' | 'regional_manager' | 'duty_officer' | 'inspector';
export type UserLevel = 'national' | 'provincial' | 'municipal';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  level: UserLevel;
  region?: string;
  province?: string;
  city?: string;
  avatar?: string;
}

export interface DashboardSummary {
  totalCorridors: number;
  onlineRate: number;
  avgHealthIndex: number;
  avgDeviceAvailability: number;
  activeAlerts: number;
  level1Alerts: number;
  level2Alerts: number;
}

export interface FailureRankingItem {
  id: string;
  name: string;
  city: string;
  failureRate: number;
  failureCount: number;
}

export interface HeatmapPoint {
  id: string;
  name: string;
  city: string;
  province: string;
  value: number;
  healthIndex: number;
  coordinates: [number, number];
}
