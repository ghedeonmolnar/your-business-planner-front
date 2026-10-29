export const formFieldLabel = (label: string, required = false) =>
  required && !label.trimEnd().endsWith('*') ? `${label} *` : label;
