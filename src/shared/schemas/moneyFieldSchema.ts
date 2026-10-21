import { z } from 'zod';

export const MAX_RATE_AMOUNT = 999_999.99;
export const MAX_TOTAL_AMOUNT = 99_999_999.99;

const decimalPattern = /^-?\d+(\.\d{1,2})?$/;

type MoneyFieldSchemaOptions = {
  formatMessage: string;
  maximum: number;
  maximumMessage: string;
  minimum: number;
  minimumExclusive?: boolean;
  minimumMessage: string;
};

const parsedMoneyValue = z
  .union([z.string(), z.number()])
  .transform(value => {
    if (typeof value === 'number') {
      return value;
    }

    const inputValue = value.trim();

    return inputValue === '' || decimalPattern.test(inputValue)
      ? Number(inputValue)
      : Number.NaN;
  });

const addMoneyIssues = (
  value: number,
  context: z.RefinementCtx,
  {
    formatMessage,
    maximum,
    maximumMessage,
    minimum,
    minimumExclusive = false,
    minimumMessage,
  }: MoneyFieldSchemaOptions,
) => {
  if (!Number.isFinite(value) || !decimalPattern.test(String(value))) {
    context.addIssue({ code: 'custom', message: formatMessage });
    return;
  }

  if (
    (minimumExclusive && value <= minimum) ||
    (!minimumExclusive && value < minimum)
  ) {
    context.addIssue({ code: 'custom', message: minimumMessage });
    return;
  }

  if (value > maximum) {
    context.addIssue({ code: 'custom', message: maximumMessage });
  }
};

export const moneyFieldSchema = (options: MoneyFieldSchemaOptions) =>
  parsedMoneyValue.superRefine((value, context) => {
    addMoneyIssues(value, context, options);
  });

export const nullableMoneyFieldSchema = (options: MoneyFieldSchemaOptions) =>
  z
    .union([z.string(), z.number(), z.null()])
    .transform(value => {
      if (value === null || (typeof value === 'string' && value.trim() === '')) {
        return null;
      }

      if (typeof value === 'number') {
        return value;
      }

      return decimalPattern.test(value.trim())
        ? Number(value.trim())
        : Number.NaN;
    })
    .superRefine((value, context) => {
      if (value !== null) {
        addMoneyIssues(value, context, options);
      }
    });
