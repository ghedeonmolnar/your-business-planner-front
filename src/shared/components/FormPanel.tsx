import React, { ReactNode } from 'react';
import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Card } from '@/shared/components/Card';
import { ContentSection } from '@/shared/components/ContentSection';
import {
  FormInteractionContext,
  useFormBusy,
} from '@/shared/components/FormInteractionContext';

type FormPanelProps = {
  title?: string;
  busy?: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
};

export function FormPanel({
  title,
  busy = false,
  children,
  style,
  titleStyle,
}: FormPanelProps) {
  const parentBusy = useFormBusy();
  return (
    <FormInteractionContext.Provider value={busy || parentBusy}>
      <Card style={style}>
        {title ? (
          <ContentSection title={title} titleStyle={titleStyle} />
        ) : null}
        {children}
      </Card>
    </FormInteractionContext.Provider>
  );
}
