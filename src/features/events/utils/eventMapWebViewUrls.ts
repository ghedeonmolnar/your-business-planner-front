export const isMapSelectorDocumentUrl = (
  candidate: string,
  selector: string,
): boolean => {
  try {
    const candidateUrl = new URL(candidate);
    const selectorUrl = new URL(selector);
    return (
      !candidateUrl.username &&
      !candidateUrl.password &&
      candidateUrl.origin === selectorUrl.origin &&
      candidateUrl.pathname === selectorUrl.pathname
    );
  } catch {
    return false;
  }
};

export const isMapSelectorMessageSource = (
  candidate: string,
  selector: string,
  platform: string,
): boolean => {
  if (isMapSelectorDocumentUrl(candidate, selector)) return true;
  if (platform !== 'android') return false;
  try {
    const candidateUrl = new URL(candidate);
    const selectorUrl = new URL(selector);
    return (
      candidateUrl.origin === selectorUrl.origin &&
      candidateUrl.href === `${candidateUrl.origin}/`
    );
  } catch {
    return false;
  }
};
