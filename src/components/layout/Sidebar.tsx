import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  FileSearch,
  BarChart3,
  Users,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
} from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/utils/format';
import { USER_ROLE_LABELS, USER_LEVEL_LABELS } from '@/utils/constants';
import { hasRole } from '@/utils/permission';
import type { UserRole } from '@/types';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: '监控总览', roles: ['hq_director', 'regional_manager', 'duty_officer', 'inspector'] as const },
  { to: '/alerts', icon: AlertTriangle, label: '预警管理', roles: ['hq_director', 'regional_manager', 'duty_officer'] as const },
  { to: '/inspection', icon: FileSearch, label: '巡检管理', roles: ['hq_director', 'regional_manager'] as const },
  { to: '/inspection/risk', icon: Shield, label: '风险预测', roles: ['hq_director', 'regional_manager'] as const },
  { to: '/reports', icon: BarChart3, label: '运营报告', roles: ['hq_director', 'regional_manager', 'duty_officer', 'inspector'] as const },
  { to: '/system/users', icon: Users, label: '用户管理', roles: ['hq_director'] as const },
];

function hasAnyRole(user: Parameters<typeof hasRole>[0], roles: readonly UserRole[]): boolean {
  if (!user) return false;
  return roles.some((role) => hasRole(user, role));
}

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const visibleItems = navItems.filter((item) => user && hasAnyRole(user, item.roles));

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-slate-800 bg-surface-900 transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-500/20 text-brand-400">
              <Shield size={18} />
            </div>
            <div>
              <div className="font-display text-sm font-bold text-white">管廊监测</div>
              <div className="text-[10px] text-slate-500">UTILITY TUNNEL OPS</div>
            </div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="flex h-8 w-8 items-center justify-center rounded text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3 scrollbar-thin">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-brand-500/15 text-brand-400 shadow-[inset_2px_0_0_0_#06B6D4]'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              )
            }
          >
            <item.icon size={18} className={sidebarCollapsed ? '' : 'shrink-0'} />
            {!sidebarCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-3">
        {!sidebarCollapsed && user && (
          <div className="mb-3 rounded-lg bg-slate-800/50 p-3">
            <div className="font-medium text-white text-sm">{user.name}</div>
            <div className="mt-0.5 text-xs text-slate-400">{USER_ROLE_LABELS[user.role]}</div>
            <div className="mt-1 text-[10px] text-brand-400">{USER_LEVEL_LABELS[user.level]}</div>
          </div>
        )}
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400',
            sidebarCollapsed && 'justify-center'
          )}
        >
          <LogOut size={18} />
          {!sidebarCollapsed && <span>退出登录</span>}
        </button>
      </div>
    </aside>
  );
}
