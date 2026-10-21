import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { DirectoryCard } from '@/features/company/components/DirectoryCard';
import { DirectoryItem, DirectoryKind } from '@/features/company/types';
import { IconButton } from '@/shared/components/IconButton';
import { AppThemeProvider } from '@/shared/theme/AppThemeProvider';

const directoryCases: {
  kind: DirectoryKind;
  item: DirectoryItem;
  expectedDetail: string;
}[] = [
  {
    kind: 'clients',
    item: {
      id: 'client-1',
      name: 'Client test',
      phone: null,
      notes: 'Observații client',
    },
    expectedDetail: 'Telefon necompletat',
  },
  {
    kind: 'halls',
    item: { id: 'hall-1', name: 'Sala test', capacity: 120, is_active: true },
    expectedDetail: 'persoane',
  },
  {
    kind: 'employees',
    item: { id: 'employee-1', name: 'Persoană test', is_active: false },
    expectedDetail: 'Inactivă',
  },
];

test.each(directoryCases)(
  'cardul $kind se afișează și se actualizează fără erori de proprietăți React',
  async ({ kind, item, expectedDetail }) => {
    const errors = jest.spyOn(console, 'error');
    const onEdit = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    const renderCard = (entry: DirectoryItem) => (
      <AppThemeProvider>
        <DirectoryCard
          item={entry}
          kind={kind}
          onEdit={onEdit}
          onHistory={jest.fn()}
        />
      </AppThemeProvider>
    );

    try {
      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(renderCard(item));
      });
      expect(JSON.stringify(renderer?.toJSON())).toContain(expectedDetail);
      await ReactTestRenderer.act(async () => {
        renderer?.update(renderCard({ ...item, name: 'Nume actualizat' }));
      });
      expect(JSON.stringify(renderer?.toJSON())).toContain('Nume actualizat');
      await ReactTestRenderer.act(async () => {
        renderer?.root.findByType(IconButton).props.onPress();
      });
      expect(onEdit).toHaveBeenCalledTimes(1);
      expect(
        errors.mock.calls.filter(([message]) =>
          String(message).includes('Invalid prop'),
        ),
      ).toEqual([]);
    } finally {
      await ReactTestRenderer.act(async () => renderer?.unmount());
      errors.mockRestore();
    }
  },
);
