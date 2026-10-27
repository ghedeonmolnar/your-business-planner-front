import React, { useState } from 'react';
import { Linking } from 'react-native';
import { Text } from 'react-native-paper';
import { useMobilePolicy } from '@/features/mobilePolicy/hooks/useMobilePolicy';
import { appBuild } from '@/shared/config/appBuild';
import { Card } from '@/shared/components/Card';
import { AppButton } from '@/shared/components/AppButton';
import { showError } from '@/shared/feedback/showError';

export function MobileUpdateRecommendation() {
  const { data } = useMobilePolicy(true);
  const [busy, setBusy] = useState(false);
  const storeUrl = data?.store_url;
  if (
    !data ||
    data.mode === 'observe' ||
    appBuild >= data.recommended_build ||
    !storeUrl
  )
    return null;
  const open = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await Linking.openURL(storeUrl);
    } catch (error) {
      showError(error, 'Nu am putut deschide pagina de actualizare.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card>
      <Text>Este disponibilă o versiune nouă a aplicației.</Text>
      <AppButton label="Deschide actualizarea" onPress={open} loading={busy} />
    </Card>
  );
}
