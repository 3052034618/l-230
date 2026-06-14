import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCorridor } from '@/services/corridor.service';
import type { CorridorSection, Alert } from '@/types';
import {
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Ruler,
  Calendar,
  Activity,
  AlertTriangle,
  Thermometer,
  Wrench,
  Clock,
  PlayCircle,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { cn, formatNumber, formatDate } from '@/utils/format';
import { CORRIDOR_STATUS_LABELS } from '@/utils/constants';
import SensorGrid from '@/components/corridor/SensorGrid';
import DevicePanel from '@/components/corridor/DevicePanel';
import MaintenanceTimeline from '@/components/corridor/MaintenanceTimeline';
import { useAlertStore } from '@/store/useAlertStore';

export default function CorridorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { triggerGasAlert } = useAlertStore();
  const [corridor, setCorridor] = useState<CorridorSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'sensors' | 'devices' | 'events' | 'demo'>('sensors');
  const [gasType, setGasType] = useState<'gas_ch4' | 'gas_co' | 'gas_h2s'>('gas_ch4');
  const [duration, setDuration] = useState<number>(10);
  const [concentration, setConcentration] = useState<string>('');
  const [triggering, setTriggering] = useState(false);
  const [triggeredAlert, setTriggeredAlert] = useState<Alert | null>(null);
  const [triggerError, setTriggerError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    getCorridor(id)
      .then((res) => mounted && setCorridor(res))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading || !corridor) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 size={32} className="animate-spin text-brand-400" />
      </div>
    );
  }

  const tabs = [
    { key: 'sensors', label: '传感器监测', icon: Thermometer },
    { key: 'devices', label: '设备状态', icon: Activity },
    { key: 'events', label: '维修时间线', icon: Wrench },
    { key: 'demo', label: '预警演示面板', icon: PlayCircle },
  ] as const;

  const gasTypeOptions = [
    { value: 'gas_ch4', label: '甲烷 (CH₄)', unit: '%LEL', threshold: 25 },
    { value: 'gas_co', label: '一氧化碳 (CO)', unit: 'ppm', threshold: 24 },
    { value: 'gas_h2s', label: '硫化氢 (H₂S)', unit: 'ppm', threshold: 10 },
  ] as const;

  const currentGasOption = gasTypeOptions.find((g) => g.value === gasType)!;

  const handleTriggerAlert = async () => {
    if (!id) return;
    const concNum = parseFloat(concentration);
    if (isNaN(concNum) || concNum <= currentGasOption.threshold) {
      setTriggerError(`浓度值必须超过阈值 ${currentGasOption.threshold}${currentGasOption.unit}`);
      return;
    }
    setTriggerError(null);
    setTriggering(true);
    try {
      const alert = await triggerGasAlert({
        corridorId: id,
        sensorType: gasType,
        durationMinutes: duration,
        actualValue: concNum,
      });
      if (alert) {
        setTriggeredAlert(alert);
      } else {
        setTriggerError('预警触发失败，请重试');
      }
    } catch (e) {
      setTriggerError('预警触发失败，请重试');
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} leftIcon={<ArrowLeft size={16} />}>
            返回
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold text-white">{corridor.name}</h1>
              <Badge
                variant={
                  corridor.status === 'online'
                    ? 'success'
                    : corridor.status === 'maintenance'
                    ? 'warning'
                    : 'danger'
                }
              >
                {CORRIDOR_STATUS_LABELS[corridor.status]}
              </Badge>
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {corridor.province} {corridor.city}
              </span>
              <span className="flex items-center gap-1">
                <Ruler size={12} />
                {corridor.length}公里
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                建成于 {corridor.constructionYear}年
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            查看报告
          </Button>
          <Button size="sm">发起报修</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div
          className={cn(
            'rounded-xl border p-5',
            corridor.healthIndex >= 85
              ? 'border-emerald-500/40 bg-emerald-500/10'
              : corridor.healthIndex >= 70
              ? 'border-brand-500/40 bg-brand-500/10'
              : corridor.healthIndex >= 55
              ? 'border-amber-500/40 bg-amber-500/10'
              : 'border-red-500/40 bg-red-500/10'
          )}
        >
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={14} />
            健康指数
          </div>
          <div
            className={cn(
              'mt-2 font-display text-4xl font-bold',
              corridor.healthIndex >= 85
                ? 'text-emerald-400 text-glow-green'
                : corridor.healthIndex >= 70
                ? 'text-brand-400 text-glow-cyan'
                : corridor.healthIndex >= 55
                ? 'text-amber-400'
                : 'text-red-400 text-glow-red'
            )}
          >
            {formatNumber(corridor.healthIndex, 1)}
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-900/60">
            <div
              className={cn(
                'h-full rounded-full',
                corridor.healthIndex >= 85
                  ? 'bg-emerald-500'
                  : corridor.healthIndex >= 70
                  ? 'bg-brand-500'
                  : corridor.healthIndex >= 55
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              )}
              style={{ width: `${corridor.healthIndex}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-700/60 bg-surface-800/60 p-5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Activity size={14} />
            设备可用率
          </div>
          <div className="mt-2 font-display text-4xl font-bold text-emerald-400">
            {formatNumber(corridor.deviceAvailability, 1)}
            <span className="ml-1 text-base font-normal text-slate-500">%</span>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            {corridor.deviceAvailability >= 90 ? '运行状态良好' : '存在设备故障，需关注'}
          </div>
        </div>

        <div className="rounded-xl border border-slate-700/60 bg-surface-800/60 p-5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <AlertTriangle size={14} />
            故障率
          </div>
          <div
            className={cn(
              'mt-2 font-display text-4xl font-bold',
              corridor.failureRate < 2
                ? 'text-emerald-400'
                : corridor.failureRate < 4
                ? 'text-amber-400'
                : 'text-red-400'
            )}
          >
            {formatNumber(corridor.failureRate, 2)}
            <span className="ml-1 text-base font-normal text-slate-500">%</span>
          </div>
          <div className="mt-3 text-xs text-slate-500">近30天统计</div>
        </div>

        <div className="rounded-xl border border-slate-700/60 bg-surface-800/60 p-5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock size={14} />
            上次巡检
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-white">
            {formatDate(new Date(Date.now() - Math.random() * 60 * 86400000).toISOString())}
          </div>
          <div className="mt-3 text-xs text-slate-500">距下次巡检还有 {Math.floor(Math.random() * 30 + 5)}天</div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1 border-b border-slate-700/60">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  'relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all',
                  tab === t.key
                    ? 'text-brand-400'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                <Icon size={15} />
                {t.label}
                {tab === t.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500" />
                )}
              </button>
            );
          })}
        </div>

        <div className="pt-5">
          {tab === 'sensors' && id && <SensorGrid corridorId={id} />}
          {tab === 'devices' && id && <DevicePanel corridorId={id} />}
          {tab === 'events' && id && <MaintenanceTimeline corridorId={id} />}
          {tab === 'demo' && id && (
            <Card
              title="预警演示面板"
              subtitle="模拟气体超标场景，触发预警流程，验证系统预警机制"
              glow="red"
            >
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">气体类型</label>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-700/60 bg-surface-800/60 px-2">
                    <AlertTriangle size={14} className="text-slate-500" />
                    <select
                      value={gasType}
                      onChange={(e) => {
                        setGasType(e.target.value as 'gas_ch4' | 'gas_co' | 'gas_h2s');
                        setConcentration('');
                        setTriggeredAlert(null);
                        setTriggerError(null);
                      }}
                      className="h-10 flex-1 bg-transparent text-sm text-white outline-none"
                    >
                      {gasTypeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-surface-800">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mt-1.5 text-xs text-slate-500">
                    报警阈值：{currentGasOption.threshold} {currentGasOption.unit}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-300">连续超标时长</label>
                    <span className="font-display text-sm font-bold text-brand-400">
                      {duration} 分钟
                    </span>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={5}
                      max={60}
                      step={5}
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-700 accent-brand-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>5 分钟</span>
                      <span>30 分钟</span>
                      <span>60 分钟</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    浓度值 ({currentGasOption.unit})
                  </label>
                  <input
                    type="number"
                    value={concentration}
                    onChange={(e) => setConcentration(e.target.value)}
                    placeholder={`请输入超过阈值 ${currentGasOption.threshold}${currentGasOption.unit} 的数值`}
                    className="h-10 w-full rounded-lg border border-slate-700/60 bg-surface-800/60 px-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30"
                  />
                  <div className="mt-1.5 text-xs text-slate-500">
                    输入值需大于报警阈值方可触发预警
                  </div>
                </div>

                {triggerError && (
                  <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                    <span>{triggerError}</span>
                  </div>
                )}

                {triggeredAlert && (
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-emerald-400">
                      <ShieldCheck size={16} />
                      预警触发成功
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">预警 ID</span>
                        <span className="font-mono text-slate-200">{triggeredAlert.id}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">预警标题</span>
                        <span className="text-slate-200">{triggeredAlert.title}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">预警等级</span>
                        <Badge variant={triggeredAlert.level === 2 ? 'danger' : 'warning'}>
                          L{triggeredAlert.level}
                        </Badge>
                      </div>
                    </div>
                    <Link
                      to={`/alerts/${triggeredAlert.id}`}
                      className="mt-4 inline-flex items-center gap-1 rounded-lg border border-brand-500/40 bg-brand-500/10 px-3 py-2 text-xs font-medium text-brand-400 transition hover:bg-brand-500/20"
                    >
                      查看预警详情
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    variant="danger"
                    size="md"
                    onClick={handleTriggerAlert}
                    disabled={triggering}
                    leftIcon={triggering ? <Loader2 size={16} className="animate-spin" /> : <PlayCircle size={16} />}
                  >
                    {triggering ? '触发中...' : '立即触发预警'}
                  </Button>
                  {triggeredAlert && (
                    <Button
                      variant="ghost"
                      size="md"
                      onClick={() => {
                        setTriggeredAlert(null);
                        setTriggerError(null);
                      }}
                    >
                      重置
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
