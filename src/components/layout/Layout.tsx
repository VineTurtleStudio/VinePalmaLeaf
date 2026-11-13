import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  { path: '/', icon: '📚', label: '书库', description: '管理我的电子书' },
  { path: '/recent', icon: '📖', label: '最近阅读', description: '继续上次的阅读' },
  { path: '/favorites', icon: '⭐', label: '收藏夹', description: '我收藏的书籍' },
  { path: '/sync', icon: '🔄', label: '同步', description: '多设备同步' },
  { path: '/settings', icon: '⚙️', label: '设置', description: '应用设置' },
];

export const Layout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 侧边栏 */}
      <aside
        className={`flex flex-col border-r border-slate-200 bg-white/80 backdrop-blur-sm transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Logo区域 */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-200">
                <span className="text-xl">🍃</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">VinePalma</h1>
                <p className="text-xs text-slate-500">Leaf</p>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-200">
              <span className="text-xl">🍃</span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 space-y-1 p-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className={`text-xl ${isActive ? 'scale-110' : 'group-hover:scale-105'} transition-transform`}>
                  {item.icon}
                </span>
                {!sidebarCollapsed && (
                  <div className="flex-1 text-left">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-slate-400">{item.description}</div>
                  </div>
                )}
                {isActive && !sidebarCollapsed && (
                  <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* 底部信息 */}
        {!sidebarCollapsed && (
          <div className="border-t border-slate-200 p-4">
            <div className="rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 p-3">
              <p className="text-xs text-slate-500">版本 0.1.0</p>
              <p className="text-xs text-slate-400">跨平台电子书阅读器</p>
            </div>
          </div>
        )}
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};
