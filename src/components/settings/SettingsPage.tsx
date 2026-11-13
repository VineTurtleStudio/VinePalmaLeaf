import React, { useState } from 'react';
import { useBookStore } from '../../stores/bookStore';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useBookStore();
  const [activeTab, setActiveTab] = useState<'reading' | 'appearance' | 'sync' | 'about'>('reading');

  const tabs = [
    { id: 'reading', label: '阅读设置', icon: '📖' },
    { id: 'appearance', label: '外观', icon: '🎨' },
    { id: 'sync', label: '同步', icon: '🔄' },
    { id: 'about', label: '关于', icon: 'ℹ️' },
  ];

  return (
    <div className="flex h-full">
      {/* 左侧标签栏 */}
      <div className="w-64 border-r border-slate-200 bg-white/80 p-4 backdrop-blur-sm">
        <h2 className="mb-4 px-3 text-lg font-bold text-slate-800">⚙️ 设置</h2>
        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* 右侧内容区 */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'reading' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800">📖 阅读设置</h3>

            {/* 字体大小 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <label className="mb-3 block text-sm font-medium text-slate-700">字体大小</label>
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500">小</span>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={settings.fontSize}
                  onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
                  className="flex-1 accent-emerald-500"
                />
                <span className="text-sm text-slate-500">大</span>
                <span className="w-12 text-center font-medium text-slate-800">{settings.fontSize}px</span>
              </div>
            </div>

            {/* 行距 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <label className="mb-3 block text-sm font-medium text-slate-700">行距</label>
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500">紧凑</span>
                <input
                  type="range"
                  min="1"
                  max="2.5"
                  step="0.1"
                  value={settings.lineHeight}
                  onChange={(e) => updateSettings({ lineHeight: Number(e.target.value) })}
                  className="flex-1 accent-emerald-500"
                />
                <span className="text-sm text-slate-500">宽松</span>
                <span className="w-12 text-center font-medium text-slate-800">{settings.lineHeight}</span>
              </div>
            </div>

            {/* 边距 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <label className="mb-3 block text-sm font-medium text-slate-700">边距</label>
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500">窄</span>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={settings.margin}
                  onChange={(e) => updateSettings({ margin: Number(e.target.value) })}
                  className="flex-1 accent-emerald-500"
                />
                <span className="text-sm text-slate-500">宽</span>
                <span className="w-12 text-center font-medium text-slate-800">{settings.margin}px</span>
              </div>
            </div>

            {/* 字体 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <label className="mb-3 block text-sm font-medium text-slate-700">字体</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'serif', label: '宋体', preview: '宋体示例' },
                  { value: 'sans-serif', label: '黑体', preview: '黑体示例' },
                  { value: 'monospace', label: '等宽', preview: '等宽示例' },
                  { value: 'cursive', label: '楷体', preview: '楷体示例' },
                ].map((font) => (
                  <button
                    key={font.value}
                    onClick={() => updateSettings({ fontFamily: font.value })}
                    className={`rounded-xl border-2 p-4 text-left transition-all ${
                      settings.fontFamily === font.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <p className="font-medium text-slate-800">{font.label}</p>
                    <p className="mt-1 text-sm text-slate-500" style={{ fontFamily: font.value }}>
                      {font.preview}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800">🎨 外观设置</h3>

            {/* 主题 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <label className="mb-3 block text-sm font-medium text-slate-700">主题</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'light', label: '日间模式', bg: 'bg-white', text: 'text-slate-800' },
                  { value: 'dark', label: '夜间模式', bg: 'bg-slate-800', text: 'text-white' },
                  { value: 'sepia', label: '护眼模式', bg: 'bg-amber-50', text: 'text-amber-900' },
                ].map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => updateSettings({ theme: theme.value as any })}
                    className={`rounded-xl border-2 p-4 transition-all ${
                      settings.theme === theme.value
                        ? 'border-emerald-500 ring-2 ring-emerald-200'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`flex h-20 items-center justify-center rounded-lg ${theme.bg}`}>
                      <span className={`text-2xl ${theme.text}`}>Aa</span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-slate-700">{theme.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 分栏 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <label className="mb-3 block text-sm font-medium text-slate-700">分栏显示</label>
              <div className="flex gap-3">
                {[1, 2, 3].map((col) => (
                  <button
                    key={col}
                    onClick={() => updateSettings({ columnCount: col })}
                    className={`flex-1 rounded-xl border-2 p-4 transition-all ${
                      settings.columnCount === col
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex gap-1">
                      {Array.from({ length: col }).map((_, i) => (
                        <div key={i} className="h-12 flex-1 rounded bg-slate-200"></div>
                      ))}
                    </div>
                    <p className="mt-2 text-sm font-medium text-slate-700">{col} 栏</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sync' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800">🔄 同步设置</h3>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <label className="mb-3 block text-sm font-medium text-slate-700">设备名称</label>
              <input
                type="text"
                defaultValue="我的电脑"
                className="w-full rounded-xl border border-slate-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <label className="mb-3 block text-sm font-medium text-slate-700">自动同步间隔</label>
              <select className="w-full rounded-xl border border-slate-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200">
                <option value="0">手动同步</option>
                <option value="5">每 5 分钟</option>
                <option value="15">每 15 分钟</option>
                <option value="30">每 30 分钟</option>
                <option value="60">每小时</option>
              </select>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <label className="mb-3 block text-sm font-medium text-slate-700">同步内容</label>
              <div className="space-y-3">
                {[
                  { label: '阅读进度', description: '同步当前阅读位置', defaultChecked: true },
                  { label: '书签和笔记', description: '同步您的标注和笔记', defaultChecked: true },
                  { label: '高亮', description: '同步文本高亮', defaultChecked: true },
                  { label: '书籍文件', description: '同步书籍文件本身', defaultChecked: false },
                ].map((item) => (
                  <label key={item.label} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      defaultChecked={item.defaultChecked}
                      className="h-5 w-5 rounded border-slate-300 accent-emerald-500"
                    />
                    <div>
                      <p className="font-medium text-slate-800">{item.label}</p>
                      <p className="text-sm text-slate-500">{item.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800">ℹ️ 关于</h3>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-4xl shadow-lg shadow-emerald-200">
                  🍃
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">VinePalma Leaf</h2>
                  <p className="text-slate-500">跨平台全能电子书阅读器</p>
                  <p className="mt-1 text-sm text-slate-400">版本 0.1.0</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h4 className="mb-3 font-semibold text-slate-800">功能特性</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>✅ 支持 EPUB, PDF, MOBI, TXT 等多种格式</li>
                <li>✅ 拟真翻页动画与专业排版</li>
                <li>✅ 高亮、批注、书签系统</li>
                <li>✅ 局域网、蓝牙、WebDAV 多端同步</li>
                <li>✅ 日间/夜间/护眼多主题</li>
                <li>✅ 全文搜索与阅读统计</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h4 className="mb-3 font-semibold text-slate-800">开源协议</h4>
              <p className="text-sm text-slate-600">
                本项目采用 AGPL-3.0 协议开源。选择 AGPL 是为了确保 VinePalma Leaf 及其衍生作品始终保持开源自由。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
