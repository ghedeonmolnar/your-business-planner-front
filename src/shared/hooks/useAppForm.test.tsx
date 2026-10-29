import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Resolver, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppForm } from '@/shared/hooks/useAppForm';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import {
  ControlledSelectField,
  SearchableSelect,
} from '@/shared/components/ControlledSelectField';
import { ControlledDateField } from '@/shared/components/ControlledDateField';
import { DatePickerField } from '@/shared/components/DatePickerField';
import { plannerAccount } from '@/features/bookings/utils/plannerTestFixtures';
import {
  jsonResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';
import { renderedText } from '@/shared/test/renderedText';
import { waitForUi } from '@/shared/test/waitForUi';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

const schema = z
  .object({
    name: z.string().min(3, 'Nume prea scurt.'),
    hall: z.string().min(1, 'Alege sala.'),
    date: z.iso.date('Alege data.'),
    children: z.string(),
    child_price: z.string(),
    services: z.array(
      z.object({ name: z.string().min(1, 'Completează serviciul.') }),
    ),
  })
  .superRefine((values, context) => {
    if (Number(values.children) > 0 && !values.child_price) {
      context.addIssue({
        code: 'custom',
        path: ['child_price'],
        message: 'Completează prețul.',
      });
    }
  });
type Values = z.infer<typeof schema>;
type Holder = { form?: UseFormReturn<Values> };
function Probe({ holder }: { holder: Holder }) {
  const form = useAppForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      hall: '',
      date: '',
      children: '0',
      child_price: '',
      services: [{ name: '' }],
    },
  });
  holder.form = form;
  return (
    <>
      <ControlledTextField
        control={form.control}
        name="name"
        label="Nume"
        placeholder="Numele clientului"
        required
      />
      <ControlledSelectField
        control={form.control}
        name="hall"
        label="Sală"
        required
        options={[{ id: 'hall-1', name: 'Sala Garden' }]}
        placeholder="Alege sala"
        searchPlaceholder="Caută sala"
        single
      />
      <ControlledDateField
        control={form.control}
        name="date"
        label="Data"
        required
        placeholder="Alege data"
      />
      <ControlledTextField
        control={form.control}
        name="child_price"
        label="Preț copii"
        required={Number(form.watch('children')) > 0}
        placeholder="Opțional fără copii"
      />
      <ControlledTextField
        control={form.control}
        name="services.0.name"
        label="Serviciu"
        required
        placeholder="Denumire"
      />
    </>
  );
}

beforeEach(() => {
  globalThis.fetch = jest.fn(() =>
    Promise.resolve(jsonResponse(200, plannerAccount)),
  ) as typeof globalThis.fetch;
});

test('revalidează textul, selecția și data după eroarea unui pas, păstrând valorile încă invalide', async () => {
  const holder: Holder = {};
  const { renderer, unmount } = await renderWithProviders(
    <Probe holder={holder} />,
  );
  const error = (name: keyof Values) => holder.form?.getFieldState(name).error;
  try {
    expect(error('name')).toBeUndefined();
    expect(renderedText(renderer)).toContain('Sală *');
    expect(renderedText(renderer)).toContain('Data *');
    expect(
      renderer.root.findByProps({ accessibilityLabel: 'Nume' }).props.label,
    ).toBe('Nume *');
    expect(renderedText(renderer)).not.toContain('Preț copii *');
    await ReactTestRenderer.act(async () => {
      await holder.form?.trigger(['name', 'hall', 'date']);
    });
    expect(error('name')?.message).toBe('Nume prea scurt.');
    await ReactTestRenderer.act(async () =>
      renderer.root
        .findByProps({ accessibilityLabel: 'Nume' })
        .props.onChangeText('A'),
    );
    expect(error('name')?.message).toBe('Nume prea scurt.');
    await ReactTestRenderer.act(async () => {
      renderer.root
        .findByProps({ accessibilityLabel: 'Nume' })
        .props.onChangeText('Ana');
      renderer.root.findByType(SearchableSelect).props.onChange(['hall-1']);
      renderer.root.findByType(DatePickerField).props.onChange('2027-11-13');
    });
    await waitForUi(() => {
      expect(error('name')).toBeUndefined();
      expect(error('hall')).toBeUndefined();
      expect(error('date')).toBeUndefined();
    });
  } finally {
    await unmount();
  }
});

test('revalidează condițiile dependente și câmpurile din liste fără submit', async () => {
  const holder: Holder = {};
  const { renderer, unmount } = await renderWithProviders(
    <Probe holder={holder} />,
  );
  try {
    await ReactTestRenderer.act(async () => {
      holder.form?.setValue('children', '5');
      await holder.form?.trigger(['child_price', 'services.0.name']);
    });
    expect(renderedText(renderer)).toContain('Preț copii *');
    expect(holder.form?.getFieldState('child_price').error).toBeDefined();
    await ReactTestRenderer.act(async () => {
      holder.form?.setValue('children', '0');
      holder.form?.setValue('services.0.name', 'Decor');
    });
    await waitForUi(() => {
      expect(holder.form?.getFieldState('child_price').error).toBeUndefined();
      expect(
        holder.form?.getFieldState('services.0.name').error,
      ).toBeUndefined();
    });
    expect(renderedText(renderer)).not.toContain('Preț copii *');
  } finally {
    await unmount();
  }
});

test('păstrează eroarea serverului până este modificat câmpul vizat', async () => {
  const holder: Holder = {};
  const { unmount } = await renderWithProviders(<Probe holder={holder} />);
  try {
    await ReactTestRenderer.act(async () =>
      holder.form?.setError('name', {
        type: 'server',
        message: 'Numele nu este disponibil.',
      }),
    );
    await ReactTestRenderer.act(async () =>
      holder.form?.setValue('hall', 'hall-1'),
    );
    expect(holder.form?.getFieldState('name').error?.type).toBe('server');
    await ReactTestRenderer.act(async () =>
      holder.form?.setValue('name', 'Ana'),
    );
    await waitForUi(() =>
      expect(holder.form?.getFieldState('name').error).toBeUndefined(),
    );
  } finally {
    await unmount();
  }
});

test('o validare întârziată este urmată de reevaluarea ultimei valori', async () => {
  let form: UseFormReturn<{ name: string }> | undefined;
  let release: (() => void) | undefined;
  const calls: string[] = [];
  const resolver: Resolver<{ name: string }> = async values => {
    const name = values.name;
    calls.push(name);
    if (name === 'lent')
      await new Promise<void>(resolve => {
        release = resolve;
      });
    return name === 'corect'
      ? { values: { name }, errors: {} }
      : {
          values: {},
          errors: { name: { type: 'validate', message: 'Nume invalid.' } },
        };
  };
  function AsyncProbe() {
    form = useAppForm({ resolver, defaultValues: { name: '' } });
    return null;
  }
  const { unmount } = await renderWithProviders(<AsyncProbe />);
  try {
    await ReactTestRenderer.act(async () =>
      form?.setError('name', { type: 'validate', message: 'Nume invalid.' }),
    );
    await ReactTestRenderer.act(async () => form?.setValue('name', 'lent'));
    expect(release).toBeDefined();
    await ReactTestRenderer.act(async () => form?.setValue('name', 'corect'));
    await ReactTestRenderer.act(async () => release?.());
    await waitForUi(() =>
      expect(form?.getFieldState('name').error).toBeUndefined(),
    );
    expect(calls).toEqual(['lent', 'corect']);
  } finally {
    await unmount();
  }
});
