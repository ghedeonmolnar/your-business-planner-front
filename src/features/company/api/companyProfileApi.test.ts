import { lookupFiscalProfileApi } from '@/features/company/api/companyProfileApi';
import { jsonResponse } from '@/shared/test/renderWithProviders';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

const fiscalProfile = {
  fiscal_code: '12345678',
  legal_name: 'Firma test SRL',
  address: 'Adresa fiscală',
  country: 'RO',
  vat_registered: false,
};

test('lookup trimite CUI normalizat și acceptă numai răspunsul pentru firma cerută', async () => {
  globalThis.fetch = jest.fn(() =>
    Promise.resolve(jsonResponse(200, fiscalProfile)),
  ) as typeof globalThis.fetch;
  await expect(lookupFiscalProfileApi(' RO 12345678 ')).resolves.toMatchObject(
    fiscalProfile,
  );
  expect(
    JSON.parse(String(jest.mocked(globalThis.fetch).mock.calls[0][1]?.body)),
  ).toEqual({ fiscal_code: '12345678' });
  globalThis.fetch = jest.fn(() =>
    Promise.resolve(
      jsonResponse(200, { ...fiscalProfile, fiscal_code: '87654321' }),
    ),
  ) as typeof globalThis.fetch;
  await expect(lookupFiscalProfileApi('12345678')).rejects.toMatchObject({
    reason: 'invalid_response',
  });
});
