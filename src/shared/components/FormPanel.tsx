import React, { ReactNode } from 'react';
import { Card } from '@/shared/components/Card';
import { ContentSection } from '@/shared/components/ContentSection';
import {
  FormInteractionContext,
  useFormBusy,
} from '@/shared/components/FormInteractionContext';

type FormPanelProps = { title?: string; busy?: boolean; children: ReactNode };

export function FormPanel({ title, busy = false, children }: FormPanelProps) {
  const parentBusy = useFormBusy();
  return (
    <FormInteractionContext.Provider value={busy || parentBusy}>
      <Card>
        {title ? <ContentSection title={title} /> : null}
        {children}
      </Card>
    </FormInteractionContext.Provider>
  );
}
