import React from 'react';
import { useSyncStore } from '../../stores/syncStore';

export const SyncPage: React.FC = () => {
  const { devices, isSyncing, lastSyncAt, error } = useSyncStore();

  return (
    <div className="h-full overflow-y-auto">
      <div className="border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-slate-800">🔄 同步中心</h1>
        <p className="mt-1 text-sm text-slate-500">多设备阅读进度同步</p>
      </div>

      <div className="p-6">
        {/* 同步状态卡片 */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
                isSyncing
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-emerald-100 text-emerald-600'
              }`}>
                {isSyncing ? (
                  <span className="text-3xl animate-spin">🔄</span>
                ) : (
                  <span className="text-3xl">✅</span>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {isSyncing ? '正在同步...' : '同步就绪'}
                </h3>
                <p className="text-sm text-slate-500">
                  {lastSyncAt
                    ? `上次同步: ${new Date(lastSyncAt).toLocaleString()}`
                    : '尚未进行过同步'}
                </p>
              </div>
            </div>
            <button
              disabled={isSyncing}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 font-medium text-white shadow-lg shadow-emerald-200 transition-all hover:shadow-xl disabled:opacity-50"
            >
              {isSyncing ? '同步中...' : '立即同步'}
            </button>
          </div>
          {error && (
            <div className="mt-4 rounded-xl bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* 同步选项 */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
              📡
            </div>
            <h3 className="font-semibold text-slate-800">局域网同步</h3>
            <p className="mt-1 text-sm text-slate-500">同一 WiFi 下自动发现设备</p>
            <div className="mt-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                已启用
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-2xl">
              📱
            </div>
            <h3 className="font-semibold text-slate-800">蓝牙同步</h3>
            <p className="mt-1 text-sm text-slate-500">近场设备轻量级同步</p>
            <div className="mt-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                未启用
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-2xl">
              ☁️
            </div>
            <h3 className="font-semibold text-slate-800">WebDAV 同步</h3>
            <p className="mt-1 text-sm text-slate-500">兼容坚果云、Nextcloud 等</p>
            <div className="mt-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                未配置
              </span>
            </div>
          </div>
        </div>

        {/* 发现的设备 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">已发现的设备</h3>
          {devices.length > 0 ? (
            <div className="space-y-3">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xl">
                      📱
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{device.name}</p>
                      <p className="text-xs text-slate-500">
                        上次同步: {new Date(device.lastSyncAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-emerald-600">
                    同步
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-slate-50 py-8 text-center">
              <div className="text-4xl">📡</div>
              <p className="mt-2 text-slate-500">未发现其他设备</p>
              <p className="text-xs text-slate-400">请确保其他设备在同一局域网内</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
