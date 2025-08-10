'use client';

import { useAuth } from '@/hooks/useAuth';
import WhatsAppButton from './WhatsAppButton';

const ConditionalWhatsAppButton = () => {
  const { user } = useAuth();

  if (user?.user_metadata.is_admin) {
    return null;
  }

  return <WhatsAppButton />;
};

export default ConditionalWhatsAppButton;
