import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';

const breadcrumbMap: Record<string, { label: string; to?: string }[]> = {
  '/dashboard': [{ label: '监控总览' }],
  '/alerts': [{ label: '预警管理' }],
  '/inspection': [{ label: '巡检管理' }],
  '/inspection/risk': [
    { label: '巡检管理', to: '/inspection' },
    { label: '风险预测' },
  ],
  '/reports': [{ label: '运营报告' }],
  '/system/users': [{ label: '系统管理' }, { label: '用户权限' }],
};

export default function AppLayout() {
  const location = useLocation();

  const breadcrumbs = useMemo(() => {
    if (location.pathname.startsWith('/corridor/')) {
      return [
        { label: '监控总览', to: '/dashboard' },
        { label: '管廊详情' },
      ];
    }
    if (location.pathname.startsWith('/alerts/') && location.pathname !== '/alerts') {
      return [
        { label: '预警管理', to: '/alerts' },
        { label: '预警详情' },
      ];
    }
    if (location.pathname.startsWith('/reports/') && location.pathname !== '/reports') {
      return [
        { label: '运营报告', to: '/reports' },
        { label: '报告详情' },
      ];
    }
    return breadcrumbMap[location.pathname] || [];
  }, [location.pathname]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-950 text-white">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header breadcrumbs={breadcrumbs} />
        <main className="flex-1 overflow-auto grid-bg scrollbar-thin">
          <div className="min-h-full p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
