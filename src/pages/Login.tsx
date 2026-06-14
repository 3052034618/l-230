import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/utils/format';
import Button from '@/components/ui/Button';

export default function Login() {
  const [username, setUsername] = useState('hq_director');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, user, restoreAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    restoreAuth();
  }, [restoreAuth]);

  if (user) {
    const from = (location.state as { from?: string })?.from || '/dashboard';
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch {
      // Error handled by store
    }
  };

  const demoAccounts = [
    { username: 'hq_director', name: '总部运营总监', desc: '国家级权限，全功能' },
    { username: 'regional_gd', name: '广东区域经理', desc: '省级权限' },
    { username: 'duty_bj', name: '北京值班监控员', desc: '市级权限' },
  ];

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-surface-950">
      <div className="absolute inset-0 grid-bg opacity-60" />
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/10 blur-[120px]" />
      <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-blue-500/10 blur-[80px]" />
      <div className="absolute -right-40 bottom-20 h-80 w-80 rounded-full bg-cyan-500/10 blur-[80px]" />

      <div className="relative z-10 w-full max-w-5xl px-6">
        <div className="grid overflow-hidden rounded-2xl border border-slate-700/60 bg-surface-900/80 shadow-2xl backdrop-blur-xl lg:grid-cols-2">
          <div className="relative hidden flex-col justify-between p-10 lg:flex">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/20 text-brand-400">
                <Shield size={28} />
              </div>
              <div>
                <div className="font-display text-2xl font-bold text-white">管廊监测平台</div>
                <div className="text-xs text-slate-500 tracking-wider">UTILITY TUNNEL MONITORING</div>
              </div>
            </div>

            <div className="space-y-6">
              <h1 className="font-display text-4xl font-bold leading-tight text-white">
                全国地下综合管廊
                <br />
                <span className="bg-gradient-to-r from-brand-300 to-blue-400 bg-clip-text text-transparent">
                  运营与安全监测
                </span>
              </h1>
              <p className="text-sm leading-relaxed text-slate-400">
                实时接入全国各管廊段传感器数据，智能预警、风险预测、巡检优化，
                保障城市地下生命线安全稳定运行。
              </p>

              <div className="grid grid-cols-3 gap-4 pt-4">
                <div>
                  <div className="font-display text-2xl font-bold text-brand-400">15+</div>
                  <div className="text-xs text-slate-500">覆盖城市</div>
                </div>
                <div>
                  <div className="font-display text-2xl font-bold text-emerald-400">98.5%</div>
                  <div className="text-xs text-slate-500">设备可用率</div>
                </div>
                <div>
                  <div className="font-display text-2xl font-bold text-amber-400">24/7</div>
                  <div className="text-xs text-slate-500">实时监测</div>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-600">
              © 2026 全国管廊运营监测中心 · 安全运行监控系统
            </div>
          </div>

          <div className="p-8 sm:p-10 lg:p-12">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/20 text-brand-400">
                <Shield size={22} />
              </div>
              <div className="font-display text-lg font-bold text-white">管廊监测平台</div>
            </div>

            <h2 className="font-display text-2xl font-bold text-white">账号登录</h2>
            <p className="mt-1 text-sm text-slate-400">请使用系统分配的账号登录</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">用户名</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-11 w-full rounded-lg border border-slate-700 bg-surface-800/60 px-4 text-sm text-white outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30"
                  placeholder="请输入用户名"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">密码</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 w-full rounded-lg border border-slate-700 bg-surface-800/60 px-4 pr-11 text-sm text-white outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30"
                    placeholder="请输入密码"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-400">
                  <input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-600 bg-surface-800 text-brand-500 focus:ring-brand-500/30" />
                  记住登录状态
                </label>
                <a href="#" className="text-brand-400 transition hover:text-brand-300">
                  忘记密码?
                </a>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
                {isLoading ? '登录中...' : '登 录'}
              </Button>
            </form>

            <div className="mt-8">
              <div className="mb-3 text-[10px] font-medium uppercase tracking-wider text-slate-600">
                演示账号（任意密码即可登录）
              </div>
              <div className="space-y-2">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.username}
                    onClick={() => setUsername(acc.username)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition',
                      username === acc.username
                        ? 'border-brand-500/50 bg-brand-500/10'
                        : 'border-slate-700/60 bg-surface-800/30 hover:border-slate-600'
                    )}
                  >
                    <div>
                      <div className="text-sm font-medium text-white">{acc.name}</div>
                      <div className="text-[10px] text-slate-500">{acc.desc}</div>
                    </div>
                    <code className="rounded bg-surface-900/60 px-2 py-0.5 font-mono text-[10px] text-brand-400">
                      {acc.username}
                    </code>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
