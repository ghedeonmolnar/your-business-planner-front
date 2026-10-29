import { useEffect, useRef } from 'react';
import {
  FieldPath,
  FieldValues,
  UseFormProps,
  useForm,
  useFormState,
  useWatch,
} from 'react-hook-form';
import { reportError } from '@/shared/monitoring/reportError';

type InvalidField = { name: string; server: boolean };

const errorFields = (errors: unknown, prefix = ''): InvalidField[] => {
  if (!errors || typeof errors !== 'object') return [];
  if (
    ('type' in errors && typeof errors.type === 'string') ||
    ('message' in errors && typeof errors.message === 'string')
  ) {
    return prefix
      ? [{ name: prefix, server: 'type' in errors && errors.type === 'server' }]
      : [];
  }
  return Object.entries(errors).flatMap(([key, error]) =>
    key === 'root'
      ? prefix
        ? errorFields(error, prefix)
        : []
      : errorFields(error, prefix ? `${prefix}.${key}` : key),
  );
};

const fieldValue = (values: unknown, name: string): unknown =>
  name
    .split('.')
    .reduce<unknown>(
      (value, key) =>
        value && typeof value === 'object' && key in value
          ? (value as Record<string, unknown>)[key]
          : undefined,
      values,
    );

export function useAppForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TTransformedValues = TFieldValues,
>(options?: UseFormProps<TFieldValues, TContext, TTransformedValues>) {
  const form = useForm<TFieldValues, TContext, TTransformedValues>(options);
  const values = useWatch({ control: form.control });
  const { errors } = useFormState({ control: form.control });
  const previousValues = useRef(values);
  const pendingFields = useRef(new Set<FieldPath<TFieldValues>>());
  const activeFields = useRef<FieldPath<TFieldValues>[]>([]);
  const validating = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const fieldsToRevalidate = pendingFields.current;
    return () => {
      mounted.current = false;
      fieldsToRevalidate.clear();
    };
  }, []);

  useEffect(() => {
    if (previousValues.current === values) return;
    const previous = previousValues.current;
    previousValues.current = values;
    const invalidFields = errorFields(errors)
      .filter(
        field =>
          !field.server ||
          JSON.stringify(fieldValue(previous, field.name)) !==
            JSON.stringify(fieldValue(values, field.name)),
      )
      .map(field => field.name as FieldPath<TFieldValues>);
    for (const name of [...invalidFields, ...activeFields.current]) {
      pendingFields.current.add(name);
    }
    if (validating.current || !pendingFields.current.size) return;
    validating.current = true;
    const revalidate = async () => {
      try {
        while (mounted.current && pendingFields.current.size) {
          const fields = [...pendingFields.current];
          pendingFields.current.clear();
          activeFields.current = fields;
          await form.trigger(fields);
        }
      } catch (error) {
        pendingFields.current.clear();
        reportError(error, { source: 'form-revalidation' });
      } finally {
        activeFields.current = [];
        validating.current = false;
      }
    };
    void revalidate();
  }, [errors, form, values]);

  return form;
}
