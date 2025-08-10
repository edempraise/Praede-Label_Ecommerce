import { create } from 'zustand';
import { getSettings } from '@/lib/supabase';

interface SettingsState {
  settings: any;
  loading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: {},
  loading: true,
  error: null,
  fetchSettings: async () => {
    try {
      set({ loading: true, error: null });
      const settingsData = await getSettings();
      set({ settings: settingsData, loading: false });
    } catch (err) {
      console.error('Error loading settings:', err);
      set({ error: 'Failed to load settings', loading: false });
    }
  },
}));
