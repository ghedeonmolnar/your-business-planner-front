export const suggestedFields = ['location', 'address'] as const;

export type SuggestedField = (typeof suggestedFields)[number];

export type ClientSuggestion = Partial<
  Record<SuggestedField, string | null>
> | null;

type FieldValues = Partial<Record<SuggestedField, string>>;

export const suggestionUpdates = (
  suggestion: ClientSuggestion,
  currentValues: FieldValues,
  previousProposals: FieldValues,
): FieldValues => {
  if (!suggestion) {
    return {};
  }

  return suggestedFields.reduce<FieldValues>((updates, field) => {
    const proposal = suggestion[field]?.trim();
    const currentValue = (currentValues[field] ?? '').trim();

    if (!proposal || proposal === currentValue) {
      return updates;
    }

    const isOwnProposal = currentValue === previousProposals[field];

    if (currentValue && !isOwnProposal) {
      return updates;
    }

    return { ...updates, [field]: proposal };
  }, {});
};
