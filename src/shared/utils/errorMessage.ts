export const getErrorMessage = (
  error: unknown,
  fallback = 'A apărut o eroare. Încearcă din nou.',
) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};
