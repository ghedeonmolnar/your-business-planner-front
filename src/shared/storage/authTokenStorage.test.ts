import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import {
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from '@/shared/storage/authTokenStorage';

describe('authTokenStorage', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it('stores and reads the token only from Keychain', async () => {
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
      username: 'sanctum',
      password: 'mobile-token',
    });

    await setAuthToken('mobile-token');

    expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
      'sanctum',
      'mobile-token',
      expect.objectContaining({ service: 'gt-events-auth-token' }),
    );
    await expect(AsyncStorage.getItem('authToken')).resolves.toBeNull();
    await expect(getAuthToken()).resolves.toBe('mobile-token');
  });

  it('does not fall back to AsyncStorage when Keychain storage fails', async () => {
    (Keychain.setGenericPassword as jest.Mock).mockRejectedValueOnce(
      new Error('Keychain indisponibil'),
    );

    await expect(setAuthToken('mobile-token')).rejects.toThrow(
      'Keychain indisponibil',
    );
    await expect(AsyncStorage.getItem('authToken')).resolves.toBeNull();
  });

  it('removes a legacy token when secure migration fails', async () => {
    await AsyncStorage.setItem('authToken', 'legacy-token');
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValue(false);
    (Keychain.setGenericPassword as jest.Mock).mockRejectedValueOnce(
      new Error('Keychain indisponibil'),
    );

    await expect(getAuthToken()).rejects.toThrow('Keychain indisponibil');
    await expect(AsyncStorage.getItem('authToken')).resolves.toBeNull();
  });

  it('keeps a non-sensitive revocation marker when secure cleanup fails', async () => {
    (Keychain.resetGenericPassword as jest.Mock).mockRejectedValueOnce(
      new Error('Keychain indisponibil'),
    );

    await expect(clearAuthToken()).rejects.toThrow('Keychain indisponibil');
    await expect(AsyncStorage.getItem('authTokenRevoked')).resolves.toBe('1');
  });

  it('still clears Keychain when the revocation marker cannot be written', async () => {
    const setItemSpy = jest
      .spyOn(AsyncStorage, 'setItem')
      .mockRejectedValueOnce(new Error('AsyncStorage indisponibil'));

    await expect(clearAuthToken()).rejects.toThrow('AsyncStorage indisponibil');
    expect(Keychain.resetGenericPassword).toHaveBeenCalledTimes(1);

    setItemSpy.mockRestore();
  });

  it('finishes an older cleanup before writing the next session token', async () => {
    let finishCleanup: (value: boolean) => void = () => undefined;
    const cleanup = new Promise<boolean>(resolve => {
      finishCleanup = resolve;
    });
    jest.mocked(Keychain.resetGenericPassword).mockReturnValueOnce(cleanup);

    const clearing = clearAuthToken();
    const writing = setAuthToken('next-token');
    await new Promise<void>(resolve => setTimeout(resolve, 0));
    expect(Keychain.setGenericPassword).not.toHaveBeenCalled();

    finishCleanup(true);
    await Promise.all([clearing, writing]);
    expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
      'sanctum',
      'next-token',
      expect.any(Object),
    );
    await expect(AsyncStorage.getItem('authTokenRevoked')).resolves.toBeNull();
  });
});
