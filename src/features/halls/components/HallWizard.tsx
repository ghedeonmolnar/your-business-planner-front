import React, {
  ComponentRef,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { FieldPath, UseFormReturn } from 'react-hook-form';
import { HallFormValues } from '@/features/halls/schemas/hallFormSchema';
import { HallPhotoDraft } from '@/features/halls/types';
import { HallBasicsFields } from '@/features/halls/components/HallBasicsFields';
import { HallMenuPricingFields } from '@/features/halls/components/HallMenuPricingFields';
import { HallFinalFields } from '@/features/halls/components/HallFinalFields';
import { HallWizardProgress } from '@/features/halls/components/HallWizardProgress';
import { HallScreenHeader } from '@/features/halls/components/HallScreenHeader';
import {
  hallWizardStyles as styles,
  HALL_FIELD_COLUMNS_MAX_FONT_SCALE,
} from '@/features/halls/components/hallWizardStyles';
import {
  FormInteractionContext,
  FormFocusContext,
} from '@/shared/components/FormInteractionContext';
import { AppButton } from '@/shared/components/AppButton';
import { showMessage } from '@/shared/feedback/showMessage';
import { theme } from '@/shared/theme/theme';

const stepFields: FieldPath<HallFormValues>[][] = [
  [
    'name',
    'capacity',
    'minimum_guests',
    'address',
    'description',
    'area_sqm',
    'is_active',
  ],
  ['menu_price', 'child_menu_price', 'menu_pricing_mode', 'menu_price_rules'],
  [
    'amenities',
    'internal_notes',
    'arrangement',
    'business_hours',
    'setup_minutes',
    'cleanup_minutes',
  ],
];

export function HallWizard({
  form,
  editing,
  title,
  busy,
  disabled,
  uncertain,
  saving,
  photos,
  onPhotosChange,
  picking,
  onPicking,
  onSubmit,
  onBack,
  ruleDraftDirty,
  onRuleDraftChange,
  children,
}: {
  form: UseFormReturn<HallFormValues>;
  editing: boolean;
  title: string;
  busy: boolean;
  disabled: boolean;
  uncertain: boolean;
  saving: boolean;
  photos: HallPhotoDraft[];
  onPhotosChange: (photos: HallPhotoDraft[]) => void;
  picking: boolean;
  onPicking: (value: boolean) => void;
  onSubmit: () => Promise<void>;
  onBack: () => void;
  ruleDraftDirty: boolean;
  onRuleDraftChange: (dirty: boolean) => void;
  children?: ReactNode;
}) {
  const [step, setStep] = useState(0);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const { fontScale } = useWindowDimensions();
  const stackedFooter = fontScale > HALL_FIELD_COLUMNS_MAX_FONT_SCALE;
  const revealFocusedInput = () => {
    const focused = TextInput.State.currentlyFocusedInput();
    if (focused)
      scroll.current?.scrollResponderScrollNativeHandleToKeyboard(
        focused,
        theme.spacing.lg,
        true,
      );
  };
  const changeStep = (next: number) => {
    Keyboard.dismiss();
    setStep(next);
    scroll.current?.scrollTo({ y: 0, animated: false });
  };
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (busy) return true;
        if (!step) return false;
        Keyboard.dismiss();
        setStep(current => current - 1);
        scroll.current?.scrollTo({ y: 0, animated: false });
        return true;
      },
    );
    return () => subscription.remove();
  }, [busy, step]);
  const advance = async () => {
    if (busy || disabled) return;
    if (uncertain) {
      await onSubmit();
      return;
    }
    if (step > 0 && ruleDraftDirty) {
      changeStep(1);
      showMessage(
        'Regulă în lucru',
        'Adaugă sau salvează regula în listă, ori renunță la ea înainte de a continua.',
      );
      return;
    }
    const valid = await form.trigger(stepFields[step], { shouldFocus: true });
    if (!valid) {
      showMessage(
        'Verifică formularul',
        'Corectează câmpurile marcate înainte de a continua.',
      );
      return;
    }
    if (step < 2) {
      changeStep(step + 1);
      return;
    }
    if (!(await form.trigger())) {
      const first = stepFields.findIndex(fields =>
        fields.some(field => form.getFieldState(field).invalid),
      );
      changeStep(first < 0 ? 0 : first);
      showMessage(
        'Verifică formularul',
        'Corectează câmpurile marcate înainte de salvare.',
      );
      return;
    }
    await onSubmit();
  };
  return (
    <KeyboardAvoidingView style={styles.flex} behavior="height">
      <HallScreenHeader
        title={title}
        onBack={() => {
          if (!busy) {
            if (step) changeStep(step - 1);
            else onBack();
          }
        }}
      />
      <HallWizardProgress step={step} />
      <ScrollView
        ref={scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onLayout={revealFocusedInput}
      >
        {children}
        <FormInteractionContext.Provider value={busy || disabled || uncertain}>
          <FormFocusContext.Provider value={revealFocusedInput}>
            {step === 0 ? (
              <HallBasicsFields form={form} editing={editing} />
            ) : null}
            <View
              style={step === 1 ? undefined : styles.hidden}
              accessibilityElementsHidden={step !== 1}
              importantForAccessibility={
                step === 1 ? 'auto' : 'no-hide-descendants'
              }
            >
              <HallMenuPricingFields
                form={form}
                onDraftChange={onRuleDraftChange}
              />
            </View>
            {step === 2 ? (
              <HallFinalFields
                form={form}
                editing={editing}
                photos={photos}
                onPhotosChange={onPhotosChange}
                picking={picking}
                onPicking={onPicking}
              />
            ) : null}
          </FormFocusContext.Provider>
        </FormInteractionContext.Provider>
      </ScrollView>
      <View style={[styles.footer, stackedFooter && styles.footerVertical]}>
        {step > 0 ? (
          <View style={stackedFooter ? undefined : styles.flex}>
            <AppButton
              label="Înapoi"
              icon="arrow-back"
              variant="outline"
              fullWidth
              disabled={busy}
              onPress={() => changeStep(step - 1)}
            />
          </View>
        ) : null}
        <View style={stackedFooter ? undefined : styles.flex}>
          <AppButton
            label={
              uncertain
                ? 'Reîncearcă salvarea'
                : step < 2
                  ? 'Continuă'
                  : editing
                    ? 'Salvează modificările'
                    : 'Salvează sala'
            }
            icon={step < 2 && !uncertain ? 'arrow-forward' : 'checkmark'}
            iconPosition={step < 2 && !uncertain ? 'right' : 'left'}
            fullWidth
            loading={saving}
            loadingLabel="Se salvează…"
            disabled={busy || disabled}
            onPress={advance}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
