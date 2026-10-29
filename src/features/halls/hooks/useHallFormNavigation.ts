import { useEffect } from 'react';
import { usePreventRemove } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/shared/navigation/types';
import { confirmAction } from '@/shared/feedback/confirmAction';
import { showMessage } from '@/shared/feedback/showMessage';
import { getSessionGeneration } from '@/shared/api/sessionExpiry';

export function useHallFormNavigation({
  navigation,
  busy,
  dirty,
  savedHallId,
  editing,
  sessionGeneration,
}: {
  navigation: NativeStackNavigationProp<RootStackParamList, 'HallForm'>;
  busy: boolean;
  dirty: boolean;
  savedHallId?: string;
  editing: boolean;
  sessionGeneration: number;
}) {
  usePreventRemove(!savedHallId && (busy || dirty), ({ data }) => {
    if (sessionGeneration !== getSessionGeneration()) return;
    if (busy) {
      showMessage(
        'Salvare în curs',
        'Așteaptă încheierea operațiunii înainte de a părăsi formularul.',
      );
      return;
    }
    confirmAction({
      destructive: true,
      title: 'Renunți la modificări?',
      message: 'Modificările nesalvate se vor pierde.',
      confirmLabel: 'Renunță',
      onConfirm: () => {
        if (sessionGeneration === getSessionGeneration())
          navigation.dispatch(data.action);
      },
    });
  });
  useEffect(() => {
    if (!savedHallId || sessionGeneration !== getSessionGeneration()) return;
    if (editing) navigation.popTo('HallDetails', { hallId: savedHallId });
    else navigation.replace('HallDetails', { hallId: savedHallId });
  }, [navigation, savedHallId, editing, sessionGeneration]);
}
