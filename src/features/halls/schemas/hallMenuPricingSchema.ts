import { z } from 'zod';
import { hallMenuRulesOverlap } from '@/features/halls/utils/hallMenuPricing';

export const MAX_HALL_MENU_RULES = 50;
const MAX_MENU_PRICE = 99_999_999.99;
export const hallOptionalPrice = z
  .string()
  .refine(
    value =>
      !value ||
      (/^\d+([.,]\d{1,2})?$/.test(value) &&
        Number(value.replace(',', '.')) <= MAX_MENU_PRICE),
    'Introdu un preț valid, cu cel mult două zecimale.',
  );
const requiredPrice = hallOptionalPrice.refine(
  value => value.length > 0,
  'Completează prețul meniului.',
);

export const hallMenuRuleSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Completează numele regulii.')
      .max(100, 'Folosește cel mult 100 de caractere.'),
    starts_on: z.iso.date('Alege data de început.'),
    ends_on: z.iso.date('Alege data de sfârșit.'),
    weekdays: z
      .array(z.number().int().min(0).max(6))
      .min(1, 'Selectează cel puțin o zi.')
      .max(7),
    menu_price: requiredPrice,
    child_menu_price: requiredPrice,
  })
  .superRefine((rule, context) => {
    if (rule.ends_on < rule.starts_on)
      context.addIssue({
        code: 'custom',
        path: ['ends_on'],
        message: 'Sfârșitul trebuie să fie după începutul perioadei.',
      });
  });

export const hallMenuPriceRuleApiSchema = z.object({
  name: z.string(),
  starts_on: z.iso.date(),
  ends_on: z.iso.date(),
  weekdays: z.array(z.number().int().min(0).max(6)).min(1).max(7),
  menu_price: z.string().regex(/^\d+\.\d{2}$/),
  child_menu_price: z.string().regex(/^\d+\.\d{2}$/),
});

export const validateHallMenuRules = (
  values: {
    menu_pricing_mode: 'simple' | 'advanced';
    menu_price_rules: HallMenuRuleValues[];
  },
  context: z.RefinementCtx,
) => {
  if (values.menu_pricing_mode !== 'advanced') return;
  if (!values.menu_price_rules.length)
    context.addIssue({
      code: 'custom',
      path: ['menu_price_rules'],
      message: 'Adaugă cel puțin o regulă sau alege modul Simplu.',
    });
  values.menu_price_rules.forEach((rule, index) => {
    if (
      values.menu_price_rules
        .slice(0, index)
        .some(previous => hallMenuRulesOverlap(previous, rule))
    )
      context.addIssue({
        code: 'custom',
        path: ['menu_price_rules', index, 'starts_on'],
        message: 'Perioada și zilele se suprapun cu o altă regulă.',
      });
  });
};

export type HallMenuRuleValues = z.infer<typeof hallMenuRuleSchema>;
export type HallMenuPriceRule = z.infer<typeof hallMenuPriceRuleApiSchema>;
