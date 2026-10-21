import React, { type ReactNode } from 'react';
import { PaperProvider } from 'react-native-paper';
import { PaperIcon } from '@/shared/theme/PaperIcon';
import { paperTheme } from '@/shared/theme/theme';

const paperSettings = { icon: PaperIcon };

export function AppThemeProvider({ children }: { children: ReactNode }) {
  return (
    <PaperProvider settings={paperSettings} theme={paperTheme}>
      {children}
    </PaperProvider>
  );
}
