'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSettingsStore } from '@/store/useSettingsStore';
import WhatsAppButton from './WhatsAppButton';

const ConditionalWhatsAppButton = () => {
  const { user } = useAuth();
  const { settings, loading, fetchSettings } = useSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  if (user?.user_metadata.is_admin || loading || !settings.whatsappNumber) {
    return null;
  }

  return <WhatsAppButton phoneNumber={settings.whatsappNumber} />;
};

export default ConditionalWhatsAppButton;
