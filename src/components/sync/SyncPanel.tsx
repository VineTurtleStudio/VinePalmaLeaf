import React, { useState } from 'react';
import { useSyncStore } from '../../stores/syncStore';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

export const SyncPanel: React.FC = () => {
  const { devices, isSyncing, lastSyncAt, error, setSyncing, setError } = useSyncStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    
    try {
      // TODO: 实现同步逻辑
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('同步完成');
    } catch (err) {
      setError('同步失败');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">同步设置</h3>
        <Button variant="ghost" size="sm" onClick={() => setIsSettingsOpen(true)}>
          设置
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">局域网同步</p>
            <p className="text-sm text-gray-500">
              {devices.length > 0 ? `${devices.length} 个设备可用` : '未发现设备'}
            </p>
          </div>
          <Button
            onClick={handleSync}
            disabled={isSyncing || devices.length === 0}
            isLoading={isSyncing}
          >
            {isSyncing ? '同步中...' : '立即同步'}
          </Button>
        </div>

        {lastSyncAt && (
          <p className="text-sm text-gray-500">
            上次同步: {new Date(lastSyncAt).toLocaleString()}
          </p>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="border-t border-gray-200 pt-4">
          <h4 className="mb-2 text-sm font-medium text-gray-900">同步选项</h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">阅读进度</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">书签和笔记</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">书籍文件</span>
            </label>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="同步设置"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              设备名称
            </label>
            <input
              type="text"
              defaultValue="我的设备"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              自动同步间隔
            </label>
            <select className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="0">手动同步</option>
              <option value="5">每5分钟</option>
              <option value="15">每15分钟</option>
              <option value="30">每30分钟</option>
              <option value="60">每小时</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};
