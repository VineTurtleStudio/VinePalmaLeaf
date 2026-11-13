import { create } from 'zustand';
import { SyncDevice, SyncType } from '../types/book';

interface SyncState {
  devices: SyncDevice[];
  currentSyncType: SyncType | null;
  isSyncing: boolean;
  lastSyncAt: string | null;
  error: string | null;
  
  setDevices: (devices: SyncDevice[]) => void;
  addDevice: (device: SyncDevice) => void;
  removeDevice: (deviceId: string) => void;
  setCurrentSyncType: (type: SyncType | null) => void;
  setSyncing: (syncing: boolean) => void;
  setLastSyncAt: (time: string) => void;
  setError: (error: string | null) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  devices: [],
  currentSyncType: null,
  isSyncing: false,
  lastSyncAt: null,
  error: null,
  
  setDevices: (devices) => set({ devices }),
  addDevice: (device) => set((state) => ({ devices: [...state.devices, device] })),
  removeDevice: (deviceId) => set((state) => ({ 
    devices: state.devices.filter(device => device.id !== deviceId) 
  })),
  setCurrentSyncType: (type) => set({ currentSyncType: type }),
  setSyncing: (syncing) => set({ isSyncing: syncing }),
  setLastSyncAt: (time) => set({ lastSyncAt: time }),
  setError: (error) => set({ error }),
}));
