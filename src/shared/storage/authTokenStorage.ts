import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

const AUTH_TOKEN_KEY = 'authToken';
const AUTH_TOKEN_REVOKED_KEY = 'authTokenRevoked';
const AUTH_TOKEN_SERVICE = 'gt-events-auth-token';
let pendingStorageOperation: Promise<void> = Promise.resolve();

const serializeStorageOperation = <T>(
  operation: () => Promise<T>,
): Promise<T> => {
  const result = pendingStorageOperation.then(operation);
  pendingStorageOperation = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
};

const KEYCHAIN_OPTIONS = {
  service: AUTH_TOKEN_SERVICE,
};

const getKeychainToken = async () => {
  const credentials = await Keychain.getGenericPassword(KEYCHAIN_OPTIONS);

  return credentials ? credentials.password : null;
};

const setKeychainToken = async (token: string) => {
  await Keychain.setGenericPassword('sanctum', token, {
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    service: AUTH_TOKEN_SERVICE,
  });
};

const clearKeychainToken = () =>
  Keychain.resetGenericPassword({
    service: AUTH_TOKEN_SERVICE,
  });

const removeStoredKeys = (keys: string[]) =>
  Promise.all(keys.map(key => AsyncStorage.removeItem(key)));

export const getAuthToken = () =>
  serializeStorageOperation(async () => {
    const tokenWasRevoked = await AsyncStorage.getItem(AUTH_TOKEN_REVOKED_KEY);

    if (tokenWasRevoked) {
      await clearKeychainToken();
      await removeStoredKeys([AUTH_TOKEN_KEY, AUTH_TOKEN_REVOKED_KEY]);

      return null;
    }

    const keychainToken = await getKeychainToken();

    if (keychainToken) {
      return keychainToken;
    }

    const legacyToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

    if (!legacyToken) {
      return null;
    }

    try {
      await setKeychainToken(legacyToken);
    } finally {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    }

    return legacyToken;
  });

export const setAuthToken = (token: string) =>
  serializeStorageOperation(async () => {
    await setKeychainToken(token);
    await removeStoredKeys([AUTH_TOKEN_KEY, AUTH_TOKEN_REVOKED_KEY]);
  });

export const clearAuthToken = () =>
  serializeStorageOperation(async () => {
    let cleanupError: unknown;
    let secureTokenCleared = false;

    try {
      await AsyncStorage.setItem(AUTH_TOKEN_REVOKED_KEY, '1');
    } catch (error) {
      cleanupError = error;
    }

    try {
      await clearKeychainToken();
      secureTokenCleared = true;
    } catch (error) {
      cleanupError ??= error;
    }

    try {
      await removeStoredKeys(
        secureTokenCleared
          ? [AUTH_TOKEN_KEY, AUTH_TOKEN_REVOKED_KEY]
          : [AUTH_TOKEN_KEY],
      );
    } catch (error) {
      cleanupError ??= error;
    }

    if (cleanupError) {
      throw cleanupError;
    }
  });
