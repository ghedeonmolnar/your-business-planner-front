import { useRef, useState } from 'react';
import { Linking } from 'react-native';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  supportEmail,
  supportPhone,
} from '@/features/company/utils/supportContact';
import { getSessionGeneration } from '@/shared/api/sessionExpiry';
import { confirmAction } from '@/shared/feedback/confirmAction';
import { showError } from '@/shared/feedback/showError';

export type MorePanel =
  'support' | 'subscription' | 'help' | 'notifications' | 'about';

export function useMoreActions() {
  const { user, signOut } = useAuth();
  const [panel, setPanel] = useState<MorePanel | null>(null);
  const openingLink = useRef(false);
  const email = supportEmail(user?.support_email);
  const phone = supportPhone(user?.support_phone);

  const openExternal = async (
    open: () => Promise<unknown>,
    message: string,
  ) => {
    if (openingLink.current) {
      return;
    }
    openingLink.current = true;
    const generation = getSessionGeneration();
    try {
      await open();
    } catch (error) {
      if (generation === getSessionGeneration()) {
        showError(new Error(message, { cause: error }), message);
      }
    } finally {
      openingLink.current = false;
    }
  };

  const requestSignOut = () => {
    const generation = getSessionGeneration();
    confirmAction({
      title: 'Deconectare',
      message: 'Vrei să te deconectezi din cont?',
      confirmLabel: 'Deconectează-mă',
      onConfirm: () => {
        if (generation !== getSessionGeneration()) {
          return;
        }
        signOut().catch(error =>
          showError(error, 'Nu am putut închide sesiunea.'),
        );
      },
    });
  };

  return {
    panel,
    setPanel,
    email,
    phone,
    requestSignOut,
    writeEmail: () => {
      if (email) {
        void openExternal(
          () => Linking.openURL(`mailto:${encodeURIComponent(email)}`),
          'Nu am putut deschide aplicația de email.',
        );
      }
    },
    callSupport: () => {
      if (phone) {
        void openExternal(
          () => Linking.openURL(`tel:${phone}`),
          'Nu am putut deschide aplicația de telefon.',
        );
      }
    },
    openSettings: () => {
      void openExternal(
        () => Linking.openSettings(),
        'Nu am putut deschide setările aplicației.',
      );
    },
  };
}
