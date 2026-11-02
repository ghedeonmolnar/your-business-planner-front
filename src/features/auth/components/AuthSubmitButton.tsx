import React, {
  ComponentRef,
  createContext,
  RefObject,
  useContext,
} from 'react';
import { View } from 'react-native';
import { authPanelStyles } from '@/features/auth/components/authPanelStyles';
import { AppButton, AppButtonProps } from '@/shared/components/AppButton';

export const AuthSubmitContext = createContext<
  RefObject<ComponentRef<typeof View> | null> | undefined
>(undefined);

export function AuthSubmitButton(props: AppButtonProps) {
  const actionRef = useContext(AuthSubmitContext);
  return (
    <View collapsable={false} ref={actionRef} style={authPanelStyles.submit}>
      <AppButton {...props} fullWidth multiline testID="form-submit" />
    </View>
  );
}
