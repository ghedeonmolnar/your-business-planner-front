import { StyleSheet } from 'react-native';
import { theme } from '@/shared/theme/theme';

export const bookingTimePickerStyles = StyleSheet.create({
  field: { flexDirection: 'row', gap: theme.spacing.sm },
  fieldText: {
    flex: 1,
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.body,
    paddingVertical: theme.spacing.md,
  },
  placeholder: { color: theme.colors.muted },
  inputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  input: { flex: 1, backgroundColor: theme.colors.surface },
  inputText: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.typography.display,
    textAlign: 'center',
  },
  text: {
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.bodySmall,
    marginBottom: theme.spacing.sm,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { padding: theme.spacing.xs },
  choice: {
    minHeight: theme.controls.fieldHeight,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceVariant,
  },
  selected: { backgroundColor: theme.colors.primary },
  choiceText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodySemibold,
    fontSize: theme.typography.bodyLarge,
    paddingVertical: theme.spacing.sm,
  },
  selectedText: { color: theme.colors.onPrimary },
  error: { color: theme.colors.danger },
  actions: { gap: theme.spacing.sm },
});
