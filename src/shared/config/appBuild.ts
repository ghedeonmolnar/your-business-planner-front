import { APP_BUILD } from '@env';

export const appBuild =
  typeof APP_BUILD === 'string' && /^[0-9]{1,9}$/.test(APP_BUILD)
    ? Number(APP_BUILD)
    : 1;
