import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Searchbar } from 'react-native-paper';
import { SearchField } from '@/shared/components/SearchField';
import { FormInteractionContext } from '@/shared/components/FormInteractionContext';
import { AppThemeProvider } from '@/shared/theme/AppThemeProvider';

test.each(['disabled', 'busy'] as const)(
  'căutarea ignoră modificările când este blocată prin %s',
  async reason => {
    const onChange = jest.fn();
    const render = (blocked: boolean) => (
      <AppThemeProvider>
        <FormInteractionContext.Provider value={reason === 'busy' && blocked}>
          <SearchField
            label="Caută înregistrări"
            placeholder="Caută după nume"
            value="Ana"
            onChange={onChange}
            disabled={reason === 'disabled' && blocked}
          />
        </FormInteractionContext.Provider>
      </AppThemeProvider>
    );
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(render(true));
    });
    const field = () => renderer.root.findByType(Searchbar);
    expect(field().props.editable).toBe(false);
    await ReactTestRenderer.act(async () => {
      field().props.onChangeText('');
    });
    expect(onChange).not.toHaveBeenCalled();
    await ReactTestRenderer.act(async () => renderer.update(render(false)));
    await ReactTestRenderer.act(async () => {
      field().props.onChangeText('Maria');
    });
    expect(onChange).toHaveBeenCalledWith('Maria');
    await ReactTestRenderer.act(async () => renderer.unmount());
  },
);
