import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { AuthUser } from '@/features/auth/types';
import { MorePanel } from '@/features/company/hooks/useMoreActions';
import { hasCompanyFeature } from '@/features/company/utils/companyFeatures';
import { ActionList } from '@/shared/components/ActionList';
import { AppButton } from '@/shared/components/AppButton';
import { ContentSection } from '@/shared/components/ContentSection';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import { theme } from '@/shared/theme/theme';
import { ReminderStatusPanel } from '@/features/events/components/ReminderStatusPanel';

type MoreInfoModalProps = {
  panel: MorePanel;
  user: AuthUser;
  email: string | null;
  phone: string | null;
  onClose: () => void;
  onEmail: () => void;
  onPhone: () => void;
  onSettings: () => void;
};

const titles: Record<MorePanel, string> = {
  support: 'Contactează-ne',
  subscription: 'Gestionează abonamentul',
  help: 'Ajutor și ghiduri',
  notifications: 'Notificări',
  about: 'Despre aplicație',
};

export function MoreInfoModal({
  panel,
  user,
  email,
  phone,
  onClose,
  onEmail,
  onPhone,
  onSettings,
}: MoreInfoModalProps) {
  const contactPanel = panel === 'support' || panel === 'subscription';
  return (
    <FormModalFrame
      visible
      fitContent
      closeLabel="Închide"
      title={titles[panel]}
      onClose={onClose}
    >
      <View style={styles.content}>
        {contactPanel ? (
          <>
            <Text style={styles.text}>
              {panel === 'subscription'
                ? 'Pentru activarea, prelungirea sau modificarea abonamentului, contactează administratorul platformei.'
                : 'Ai nevoie de ajutor? Contactează echipa de suport prin email sau telefon.'}
            </Text>
            {email || phone ? (
              <ActionList
                items={[
                  ...(email
                    ? [
                        {
                          id: 'email',
                          label: email,
                          icon: 'mail-outline' as const,
                          onPress: onEmail,
                        },
                      ]
                    : []),
                  ...(phone
                    ? [
                        {
                          id: 'phone',
                          label: phone,
                          icon: 'call-outline' as const,
                          onPress: onPhone,
                        },
                      ]
                    : []),
                ]}
              />
            ) : (
              <Text style={styles.text}>
                Datele de contact nu sunt disponibile. Solicită ajutor
                administratorului companiei.
              </Text>
            )}
          </>
        ) : null}
        {panel === 'help' ? (
          <>
            <ContentSection
              title="Unde văd rezervările?"
              subtitle="În Rezervări găsești lista evenimentelor. Deschide o rezervare pentru a vedea detaliile disponibile contului tău."
            />
            {user.role !== 'employee' ? (
              <View style={styles.content}>
                <ContentSection
                  title="Cum creez o rezervare?"
                  subtitle="Din Agendă sau Rezervări, apasă Rezervare nouă, alege sala și completează detaliile evenimentului."
                />
                <ContentSection
                  title="Unde văd programul sălilor?"
                  subtitle="În Calendar, selectează luna și ziua pentru a vedea rezervările. Poți filtra lista după sală."
                />
              </View>
            ) : null}
            {hasCompanyFeature(user, 'staff') && user.role !== 'employee' ? (
              <ContentSection
                title="Cum gestionez personalul?"
                subtitle="În Mai multe → Personal poți adăuga persoane și verifica disponibilitatea lor pentru evenimente."
              />
            ) : null}
            {user.role === 'owner' ? (
              <ContentSection
                title="Cum modific datele de facturare?"
                subtitle="În Mai multe → Profil și facturare, editează firma și datele fiscale. Poți precompleta informațiile după CUI, apoi le salvezi."
              />
            ) : null}
          </>
        ) : null}
        {panel === 'notifications' ? (
          <>
            {hasCompanyFeature(user, 'reminders') ? (
              <ReminderStatusPanel />
            ) : null}
            <Text style={styles.text}>
              {hasCompanyFeature(user, 'reminders')
                ? 'Mementourile pentru evenimente sunt disponibile pentru compania ta. Permisiunile și afișarea notificărilor se gestionează din setările dispozitivului.'
                : 'Mementourile pentru evenimente nu sunt incluse în configurația actuală a companiei. Contactează administratorul platformei pentru detalii.'}
            </Text>
            <AppButton
              label="Deschide setările aplicației"
              icon="settings-outline"
              onPress={onSettings}
              multiline
            />
          </>
        ) : null}
        {panel === 'about' ? (
          <ContentSection
            title="Your Business Planner"
            subtitle={`Planificarea rezervărilor și administrarea afacerii tale.${user.business_category?.name ? `\nTipul afacerii: ${user.business_category.name}` : ''}`}
          />
        ) : null}
      </View>
    </FormModalFrame>
  );
}

const styles = StyleSheet.create({
  content: { gap: theme.spacing.xl },
  text: {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.typography.bodySmall,
  },
});
