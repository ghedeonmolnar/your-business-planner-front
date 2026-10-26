import { Text } from 'react-native-paper';
import { AppButton } from '@/shared/components/AppButton';
import { confirmAction } from '@/shared/feedback/confirmAction';

export function BookingCreationNotice({
  operationConflict,
}: {
  operationConflict: boolean;
}) {
  return operationConflict ? (
    <Text>
      Această încercare este înregistrată cu alte date. Închide formularul și
      verifică lista rezervărilor. Ciorna rămâne păstrată până la reconciliere.
    </Text>
  ) : (
    <Text>
      Rezultatul creării este incert. Reîncearcă aceeași operațiune pentru a
      recupera rezervarea.
    </Text>
  );
}

export function BookingCreationReconcileAction({
  onReconcile,
  busy = false,
}: {
  onReconcile: () => void;
  busy?: boolean;
}) {
  return (
    <AppButton
      disabled={busy}
      label="Am verificat lista rezervărilor"
      variant="outline"
      onPress={() =>
        confirmAction({
          title: 'Reconcilierea creării',
          message:
            'Continuă numai dacă ai verificat că această ciornă trebuie trimisă ca o rezervare nouă. Rezervările existente nu vor fi modificate.',
          confirmLabel: 'Permite o creare nouă',
          onConfirm: onReconcile,
        })
      }
    />
  );
}
