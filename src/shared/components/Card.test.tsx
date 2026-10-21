import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native-paper';
import { Card } from '@/shared/components/Card';
import { AppThemeProvider } from '@/shared/theme/AppThemeProvider';

test('cardul afișează fragmentele imbricate fără a le transmite proprietățile interne Paper', async () => {
  const errors = jest.spyOn(console, 'error');
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  try {
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <AppThemeProvider>
          <Card>
            <Text>Primul rând</Text>
            <React.Fragment key="grup">
              <Text>Al doilea rând</Text>
              <>
                <Text>Al treilea rând</Text>
              </>
            </React.Fragment>
          </Card>
        </AppThemeProvider>,
      );
    });
    const content = JSON.stringify(renderer?.toJSON());
    expect(content).toContain('Primul rând');
    expect(content).toContain('Al doilea rând');
    expect(content).toContain('Al treilea rând');
    expect(
      errors.mock.calls.filter(([message]) =>
        String(message).includes('Invalid prop'),
      ),
    ).toEqual([]);
  } finally {
    await ReactTestRenderer.act(async () => renderer?.unmount());
    errors.mockRestore();
  }
});
