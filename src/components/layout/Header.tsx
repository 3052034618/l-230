import { Bell, Search, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAlertStore } from '@/store/useAlertStore';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

export default function Header({ breadcrumbs }: { breadcrumbs?: BreadcrumbItem[] }) {
  const { user } = useAuthStore();
  const { alerts, fetchAlerts } = useAlertStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const activeAlerts = alerts.filter((a) => a.status !== 'closed').length;

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAlerts();
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-surface-900/80 px-6 backdrop-blur">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">当前位置</span>
          {breadcrumbs?.map((item, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="text-slate-600">/</span>
              {item.to ? (
                <Link to={item.to} className="text-slate-400 transition hover:text-brand-400">
                  {item.label}
                </Link>
              ) : (
                <span className="font-medium text-white">{item.label}</span>
              )}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleRefresh}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
        </button>

        <div className="relative hidden md:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="搜索管廊、预警..."
            className="h-9 w-64 rounded-lg border border-slate-700 bg-surface-800 pl-9 pr-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30"
          />
        </div>

        <Link
          to="/alerts"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          <Bell size={18} />
          {activeAlerts > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white animate-blink">
              {activeAlerts > 9 ? '9+' : activeAlerts}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-3 border-l border-slate-700 pl-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-white">
            {user?.name?.charAt(0)}
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-medium text-white">{user?.name}</div>
            <div className="text-[10px] text-slate-500">在线</div>
          </div>
        </div>
      </div>
    </header>
  );
}
