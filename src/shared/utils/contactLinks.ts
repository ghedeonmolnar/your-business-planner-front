import { Linking } from 'react-native';
import { CommunicationChannel } from '@/shared/types/contact';
import { showMessage } from '@/shared/feedback/showMessage';
import { getSessionGeneration } from '@/shared/api/sessionExpiry';

export const contactChannelLabels: Record<CommunicationChannel, string> = {
  whatsapp: 'WhatsApp',
  olx: 'OLX',
  facebook: 'Facebook',
  instagram: 'Instagram',
  call: 'Telefon',
  tiktok: 'TikTok',
  email: 'Email',
};

export const contactChannelIcons = {
  whatsapp: 'logo-whatsapp',
  olx: 'open-outline',
  facebook: 'logo-facebook',
  instagram: 'logo-instagram',
  call: 'call-outline',
  tiktok: 'logo-tiktok',
  email: 'mail-outline',
} as const;

const socialHosts: Record<
  Extract<CommunicationChannel, 'facebook' | 'instagram' | 'tiktok'>,
  string[]
> = {
  facebook: ['facebook.com', 'www.facebook.com', 'm.me'],
  instagram: ['instagram.com', 'www.instagram.com'],
  tiktok: ['tiktok.com', 'www.tiktok.com'],
};

export const normalizePhone = (value: string) => {
  if (!/^[+0-9\s().-]+$/.test(value.trim())) {
    return null;
  }
  let phone = value.trim().replace(/[^0-9+]/g, '');

  if (phone.startsWith('00')) {
    phone = `+${phone.slice(2)}`;
  } else if (phone.startsWith('0')) {
    phone = `+40${phone.slice(1)}`;
  } else if (phone.startsWith('40')) {
    phone = `+${phone}`;
  } else if (!phone.startsWith('+')) {
    phone = `+${phone}`;
  }

  return /^\+[1-9][0-9]{7,14}$/.test(phone) ? phone : null;
};

const socialHandle = (
  channel: 'facebook' | 'instagram' | 'tiktok',
  value: string,
) => {
  let handle = value.trim();

  if (/^https?:\/\//i.test(handle)) {
    try {
      const url = new URL(handle);
      const host = url.hostname.toLowerCase();

      if (!socialHosts[channel].includes(host)) {
        return null;
      }

      handle = url.pathname.split('/').filter(Boolean)[0] ?? '';
    } catch {
      return null;
    }
  }

  handle = handle.replace(/^@/, '');

  return /^[A-Za-z0-9._-]{1,100}$/.test(handle) ? handle : null;
};

const olxUrl = (value: string) => {
  try {
    const url = new URL(value.trim());
    const host = url.hostname.toLowerCase();

    if (
      url.protocol !== 'https:' ||
      (host !== 'olx.ro' && !host.endsWith('.olx.ro'))
    ) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
};

export const contactValidationMessage = (
  channel: CommunicationChannel,
  value: string,
) => {
  if (!value.trim()) {
    return 'Completează datele de contact.';
  }

  if (channel === 'whatsapp' || channel === 'call') {
    return normalizePhone(value)
      ? null
      : 'Completează un număr de telefon valid.';
  }

  if (channel === 'email') {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
      ? null
      : 'Completează o adresă de email validă.';
  }

  if (channel === 'olx') {
    return olxUrl(value)
      ? null
      : 'Completează un link HTTPS de pe domeniul olx.ro.';
  }

  return socialHandle(channel, value)
    ? null
    : 'Completează un username sau un link valid.';
};

export const buildContactUrl = (
  channel?: CommunicationChannel | null,
  value?: string | null,
) => {
  if (!channel || !value) {
    return null;
  }

  if (channel === 'whatsapp' || channel === 'call') {
    const phone = normalizePhone(value);

    if (!phone) {
      return null;
    }

    return channel === 'whatsapp'
      ? `https://wa.me/${phone.slice(1)}`
      : `tel:${phone}`;
  }

  if (channel === 'email') {
    return contactValidationMessage(channel, value) === null
      ? `mailto:${value.trim().toLowerCase()}`
      : null;
  }

  if (channel === 'olx') {
    return olxUrl(value);
  }

  const handle = socialHandle(channel, value);

  if (!handle) {
    return null;
  }

  if (channel === 'facebook') {
    return `https://m.me/${handle}`;
  }

  return channel === 'instagram'
    ? `https://www.instagram.com/${handle}/`
    : `https://www.tiktok.com/@${handle}`;
};

type EventContactFields = {
  communication_channel?: CommunicationChannel | null;
  contact_value?: string | null;
  contact_phone?: string | null;
};

export const eventContactPhone = (event: EventContactFields) => {
  const directPhone =
    event.communication_channel === 'call' ||
    event.communication_channel === 'whatsapp'
      ? event.contact_value
      : null;

  return (
    [event.contact_phone, directPhone].find(phone =>
      Boolean(buildContactUrl('call', phone)),
    ) ?? null
  );
};

export const buildWhatsAppShareUrl = (
  phone: string | null | undefined,
  message: string,
) => {
  const normalizedPhone = phone ? normalizePhone(phone) : null;
  const text = encodeURIComponent(message);

  return normalizedPhone
    ? `https://wa.me/${normalizedPhone.slice(1)}?text=${text}`
    : `https://wa.me/?text=${text}`;
};

export const openWhatsAppShare = async (
  phone: string | null | undefined,
  message: string,
) => {
  const generation = getSessionGeneration();
  try {
    await Linking.openURL(buildWhatsAppShareUrl(phone, message));
  } catch {
    if (generation !== getSessionGeneration()) return;
    showMessage(
      'Nu am putut deschide WhatsApp',
      'Verifică dacă aplicația este instalată și încearcă din nou.',
    );
  }
};

export const openContact = async (
  channel?: CommunicationChannel | null,
  value?: string | null,
) => {
  const generation = getSessionGeneration();
  const url = buildContactUrl(channel, value);

  if (!url) {
    showMessage('Contact indisponibil', 'Datele de contact nu sunt valide.');
    return;
  }

  try {
    await Linking.openURL(url);
  } catch {
    if (generation !== getSessionGeneration()) return;
    showMessage(
      'Nu am putut deschide aplicația',
      'Verifică dacă aplicația potrivită este instalată și încearcă din nou.',
    );
  }
};
