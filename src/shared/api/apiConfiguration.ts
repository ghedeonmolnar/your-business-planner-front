export const isAllowedApiUrl = (
  value: string,
  development: boolean,
): boolean => {
  try {
    const url = new URL(value);
    return Boolean(
      url.hostname &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash &&
      (url.protocol === 'https:' || (development && url.protocol === 'http:')),
    );
  } catch {
    return false;
  }
};
