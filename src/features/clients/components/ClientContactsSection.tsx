import React from 'react';
import { Text } from 'react-native-paper';
import { View } from 'react-native';
import { Client, ClientContact } from '@/features/clients/types';
import { clientDetailsStyles as styles } from '@/features/clients/components/clientDetailsStyles';
import { AppButton } from '@/shared/components/AppButton';
import { Card } from '@/shared/components/Card';
import { CommunicationChannel } from '@/shared/types/contact';
import { contactChannelIcons, openContact } from '@/shared/utils/contactLinks';
import { theme } from '@/shared/theme/theme';

const contactLabels: Record<ClientContact['kind'], string> = {
  phone: 'Telefon',
  email: 'Email',
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  olx: 'OLX',
};

export function ClientContactsSection({ client }: { client: Client }) {
  const savedContacts = client.contacts ?? [];
  const contacts =
    client.phone && !savedContacts.some(contact => contact.kind === 'phone')
      ? [
          ...savedContacts,
          { id: 'legacy-phone', kind: 'phone' as const, value: client.phone },
        ]
      : savedContacts;

  return (
    <Card style={styles.section}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>
        Contacte
      </Text>
      {contacts.length ? (
        contacts.map(contact => (
          <ContactRow contact={contact} key={contact.id} />
        ))
      ) : (
        <Text style={styles.emptyText}>Nu există contacte salvate.</Text>
      )}
    </Card>
  );
}

function ContactRow({ contact }: { contact: ClientContact }) {
  const channel: CommunicationChannel | null =
    contact.kind === 'phone' ? null : contact.kind;

  return (
    <View style={styles.entry}>
      <Text style={styles.label}>{contactLabels[contact.kind]}</Text>
      <Text selectable style={styles.value}>
        {contact.value}
      </Text>
      <View style={styles.actions}>
        {contact.kind === 'phone' ? (
          <>
            <AppButton
              accessibilityLabel={`Sună clientul la ${contact.value}`}
              icon="call-outline"
              label="Sună"
              onPress={() => openContact('call', contact.value)}
              variant="outline"
            />
            <AppButton
              accessibilityLabel={`Deschide WhatsApp pentru ${contact.value}`}
              color={theme.colors.success}
              icon="logo-whatsapp"
              label="WhatsApp"
              onPress={() => openContact('whatsapp', contact.value)}
              variant="outline"
            />
          </>
        ) : channel ? (
          <AppButton
            icon={contactChannelIcons[channel]}
            label={`Deschide ${contactLabels[contact.kind]}`}
            multiline
            onPress={() => openContact(channel, contact.value)}
            variant="outline"
          />
        ) : null}
      </View>
    </View>
  );
}
