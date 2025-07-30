'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';

const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return <>{children}</>;
};

export default SettingsProvider;
