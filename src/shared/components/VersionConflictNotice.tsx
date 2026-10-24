import React, { useRef, useState } from 'react';
import { Text } from 'react-native-paper';
import { AppButton } from '@/shared/components/AppButton';
import { confirmAction } from '@/shared/feedback/confirmAction';
import { showError } from '@/shared/feedback/showError';

export function VersionConflictNotice({
  onReload,
  hasDraft = true,
}: {
  onReload: () => Promise<void>;
  hasDraft?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const reloading = useRef(false);
  const reload = async () => {
    if (reloading.current) return;
    reloading.current = true;
    setLoading(true);
    try {
      await onReload();
    } catch (error) {
      showError(
        error,
        hasDraft
          ? 'Nu am putut încărca versiunea curentă. Ciorna este păstrată.'
          : 'Nu am putut încărca versiunea curentă. Încearcă din nou.',
      );
    } finally {
      reloading.current = false;
      setLoading(false);
    }
  };
  return (
    <>
      <Text>
        {hasDraft
          ? 'Ciorna ta este păstrată. Încarcă versiunea curentă înainte de a continua.'
          : 'Înregistrarea a fost modificată. Încarcă versiunea curentă înainte de a continua.'}
      </Text>
      <AppButton
        label="Încarcă versiunea curentă"
        loading={loading}
        variant="outline"
        onPress={() =>
          confirmAction({
            title: hasDraft
              ? 'Înlocuiești ciorna?'
              : 'Încarci versiunea curentă?',
            message: hasDraft
              ? 'Modificările nesalvate vor fi înlocuite cu datele salvate de echipă.'
              : 'Vei vedea datele salvate de echipă înainte de a alege din nou acțiunea.',
            confirmLabel: 'Încarcă',
            onConfirm: () => {
              void reload();
            },
          })
        }
      />
    </>
  );
}
