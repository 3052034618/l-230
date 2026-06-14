import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  Users,
  Shield,
  Search,
  UserPlus,
  Edit,
  MoreHorizontal,
  Loader2,
} from 'lucide-react';
import { USER_ROLE_LABELS, USER_LEVEL_LABELS } from '@/utils/constants';
import type { User } from '@/types';

const mockUsers: User[] = [
  { id: 'u1', username: 'hq_director', name: '张建国', role: 'hq_director', level: 'national', region: '全国' },
  { id: 'u2', username: 'regional_gd', name: '李明华', role: 'regional_manager', level: 'provincial', province: '广东' },
  { id: 'u3', username: 'duty_bj', name: '王志强', role: 'duty_officer', level: 'municipal', province: '北京', city: '北京市' },
  { id: 'u4', username: 'duty_sh', name: '陈晓东', role: 'duty_officer', level: 'municipal', province: '上海', city: '上海市' },
  { id: 'u5', username: 'inspector_gz', name: '刘海峰', role: 'inspector', level: 'municipal', province: '广东', city: '广州市' },
  { id: 'u6', username: 'regional_js', name: '赵文博', role: 'regional_manager', level: 'provincial', province: '江苏' },
  { id: 'u7', username: 'duty_wh', name: '孙浩然', role: 'duty_officer', level: 'municipal', province: '湖北', city: '武汉市' },
];

const roleBadge = {
  hq_director: 'danger' as const,
  regional_manager: 'warning' as const,
  duty_officer: 'cyan' as const,
  inspector: 'default' as const,
};

const levelBadge = {
  national: 'danger' as const,
  provincial: 'warning' as const,
  municipal: 'cyan' as const,
};

export default function UserManagement() {
  const [loading] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = mockUsers.filter(
    (u) => u.name.includes(search) || u.username.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">用户与权限管理</h1>
          <p className="mt-1 text-sm text-slate-400">国家/省/市三级权限管理</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<Shield size={14} />}>
            权限配置
          </Button>
          <Button size="sm" leftIcon={<UserPlus size={14} />}>
            新增用户
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-700/60 bg-surface-800/60 p-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Users size={14} />
            用户总数
          </div>
          <div className="mt-2 font-display text-3xl font-bold text-white">{mockUsers.length}</div>
        </div>
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <div className="text-xs text-red-300">总部运营总监</div>
          <div className="mt-2 font-display text-3xl font-bold text-red-400">
            {mockUsers.filter((u) => u.role === 'hq_director').length}
          </div>
        </div>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="text-xs text-amber-300">区域经理</div>
          <div className="mt-2 font-display text-3xl font-bold text-amber-400">
            {mockUsers.filter((u) => u.role === 'regional_manager').length}
          </div>
        </div>
        <div className="rounded-xl border border-brand-500/30 bg-brand-500/10 p-4">
          <div className="text-xs text-brand-300">值班监控员</div>
          <div className="mt-2 font-display text-3xl font-bold text-brand-400">
            {mockUsers.filter((u) => u.role === 'duty_officer').length}
          </div>
        </div>
      </div>

      <Card title="用户列表" rightElement={
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索用户..."
            className="h-8 w-56 rounded-lg border border-slate-700/60 bg-surface-800/60 pl-9 pr-3 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500"
          />
        </div>
      }>
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 size={28} className="animate-spin text-brand-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/60 text-left text-xs text-slate-400">
                  <th className="px-4 py-3 font-medium">用户</th>
                  <th className="px-4 py-3 font-medium">角色</th>
                  <th className="px-4 py-3 font-medium">权限层级</th>
                  <th className="px-4 py-3 font-medium">管辖区域</th>
                  <th className="px-4 py-3 font-medium">状态</th>
                  <th className="px-4 py-3 text-right font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-800/60 transition-colors hover:bg-surface-700/30"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-blue-600 text-sm font-bold text-white">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-white">{user.name}</div>
                          <div className="text-[11px] text-slate-500">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={roleBadge[user.role]}>{USER_ROLE_LABELS[user.role]}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={levelBadge[user.level]}>{USER_LEVEL_LABELS[user.level]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {user.region ||
                        [user.province, user.city].filter(Boolean).join(' · ')}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="success">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        正常
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" leftIcon={<Edit size={13} />}>
                          编辑
                        </Button>
                        <button className="flex h-7 w-7 items-center justify-center rounded text-slate-400 transition hover:bg-surface-700 hover:text-white">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
