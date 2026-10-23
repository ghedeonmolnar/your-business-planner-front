export type ApiErrorReason =
  | 'http'
  | 'network'
  | 'timeout'
  | 'aborted'
  | 'configuration'
  | 'invalid_response';

export type ApiResponseBody =
  { kind: 'empty' } | { kind: 'json'; value: unknown } | { kind: 'other' };

export const HTTP_OK = 200;
export const HTTP_NO_CONTENT = 204;
export const HTTP_UNAUTHORIZED = 401;
export const HTTP_TOO_MANY_REQUESTS = 429;
export const HTTP_SERVER_ERROR = 500;
export const NO_HTTP_STATUS = 0;

export const MISSING_API_URL_MESSAGE =
  'API_URL nu este configurat pentru aplicație.';
export const SESSION_EXPIRED_MESSAGE =
  'Sesiunea a expirat. Autentifică-te din nou.';
export const CONNECTION_FAILED_MESSAGE = 'Nu se poate conecta la server.';
export const TIMEOUT_MESSAGE =
  'Serverul nu răspunde. Verifică conexiunea și încearcă din nou.';
export const ABORTED_MESSAGE = 'Cererea a fost anulată.';
export const INVALID_RESPONSE_MESSAGE =
  'Serverul a trimis un răspuns neașteptat. Încearcă din nou.';

const SERVER_ERROR_MESSAGE = 'A apărut o eroare pe server. Încearcă din nou.';
const TOO_MANY_REQUESTS_MESSAGE =
  'Prea multe încercări. Așteaptă puțin și încearcă din nou.';
const REQUEST_FAILED_MESSAGE = 'Cererea nu a putut fi procesată.';
const errorMessagesByCode: Record<string, string> = {
  RESOURCE_VERSION_CONFLICT:
    'Înregistrarea a fost modificată de altcineva. Ciorna ta este păstrată; verifică versiunea salvată înainte de a continua.',
  PAYMENT_OPERATION_CONFLICT:
    'Această operațiune de plată a fost deja înregistrată cu alte date. Verifică istoricul plăților.',
  BOOKING_STAFF_SCHEDULE_LOCKED:
    'Programul personalului trebuie reconciliat. Reactivează modulul de personal înainte de a muta această rezervare.',
  CLIENT_FILTERS_INVALID:
    'Verifică intervalul evenimentelor și opțiunile listei de clienți.',
  FISCAL_COMPANY_NOT_FOUND:
    'Nu am găsit firma pentru acest CUI. Verifică numărul sau completează datele manual.',
  FISCAL_LOOKUP_UNAVAILABLE:
    'Serviciul ANAF nu este disponibil acum. Poți completa datele manual sau încerca mai târziu.',
  FISCAL_LOOKUP_BUSY:
    'Așteaptă câteva secunde înainte de o nouă căutare a firmei.',
  MODULE_DISABLED: 'Această funcție nu este activată pentru compania ta.',
  USER_LIMIT_REACHED:
    'Limita conturilor de acces a fost atinsă. Contactează echipa de suport sau eliberează un loc.',
  CATEGORY_UNAVAILABLE: 'Categoria companiei este În pregătire.',
  PLAN_UNAVAILABLE: 'Planul selectat nu este disponibil.',
  COMPANY_ACCESS_DENIED: 'Contul nu are acces la o companie.',
  SUBSCRIPTION_INACTIVE:
    'Abonamentul companiei este inactiv. Contactează administratorul platformei.',
  ACCOUNT_EMAIL_IN_USE:
    'Adresa de email nu poate fi folosită pentru această invitație.',
  HALL_ALREADY_BOOKED:
    'Sala este deja rezervată pentru această dată sau acest interval.',
  HALL_NOT_AVAILABLE: 'Sala nu mai este disponibilă pentru rezervări noi.',
  EMPLOYEE_ALREADY_ASSIGNED:
    'O persoană selectată este deja alocată în acest interval.',
  EMPLOYEE_NOT_AVAILABLE: 'O persoană selectată nu este disponibilă.',
  BOOKING_INVALID_INTERVAL:
    'Verifică data și orele evenimentului, inclusiv ziua de încheiere.',
  BOOKING_DETAILS_INCOMPLETE:
    'Completează programul, minimul garantat și prețul meniului.',
  BOOKING_AMOUNT_TOO_LARGE: 'Valoarea calculată depășește limita permisă.',
  CALENDAR_RANGE_TOO_LARGE: 'Alege o perioadă de maximum un an.',
  SERVER_ERROR: SERVER_ERROR_MESSAGE,
  HTTP_ERROR: REQUEST_FAILED_MESSAGE,
  METHOD_NOT_ALLOWED: 'Această acțiune nu este disponibilă.',
  VALIDATION_FAILED: 'Verifică datele introduse și încearcă din nou.',
  RESOURCE_NOT_FOUND: 'Resursa nu mai este disponibilă.',
  FORBIDDEN: 'Nu ai acces la această resursă.',
  CLIENT_NOT_FOUND: 'Clientul nu mai este disponibil.',
  CLIENT_EVENTS_FILTERS_INVALID:
    'Filtrele evenimentelor nu sunt valide. Alege din nou ce afișăm.',
  CLIENT_PHONE_DUPLICATE: 'Există deja un client cu acest număr de telefon.',
  CLIENT_PHONE_INVALID: 'Numărul de telefon nu este valid.',
  CONTACT_VALUE_INVALID: 'Datele de contact nu sunt valide.',
  MAP_POINT_INVALID: 'Alege o locație validă pe hartă.',
  MAP_OUTSIDE_BIHOR:
    'Locația trebuie să fie în județul Bihor. Alege un alt punct.',
  MAP_GOOGLE_UNAVAILABLE:
    'Serviciul Google Maps nu răspunde. Încearcă din nou.',
  MAP_CONFIGURATION_MISSING:
    'Harta nu este încă activată. Contactează administratorul.',
  MAP_EVENT_NOT_FOUND: 'Evenimentul nu mai este disponibil.',
  MAP_LOCATION_CHANGED:
    'Adresa evenimentului s-a schimbat. Redeschide harta și confirmă din nou locația.',
  EVENT_NOT_FOUND: 'Evenimentul nu mai este disponibil.',
  EVENT_CONTACT_PHONE_INVALID: 'Completează un număr de telefon valid.',
  EVENT_VALIDATION_FAILED: 'Verifică datele rezervării și încearcă din nou.',
  EVENT_DETAILS_INCOMPLETE:
    'Completează toate detaliile obligatorii ale evenimentului rezervat.',
  EVENT_SLOT_CONFLICT:
    'Un animator sau o mascotă este deja ocupat în intervalul selectat.',
  EVENT_PAYMENT_NOT_FOUND: 'Plata nu mai este disponibilă.',
  EVENT_DOCUMENT_NOT_FOUND: 'Documentul nu mai este disponibil.',
  EVENT_REVIEW_NOT_FOUND: 'Recenzia nu mai este disponibilă.',
  EVENT_REVIEW_NOT_AVAILABLE:
    'Linkul de recenzie este disponibil doar pentru evenimentele încheiate.',
  REVIEW_NOTIFICATION_NOT_FOUND:
    'Notificarea de recenzie nu mai este disponibilă.',
  PAYMENT_CATEGORY_RESERVED:
    'Această categorie de plată este administrată automat.',
  PAYMENT_AUTO_IMMUTABLE:
    'Plata automată a animatorului nu poate fi modificată manual.',
  PAYMENT_OVERTIME_REQUIRES_FULL_INCOMING:
    'Prelungirea se salvează doar la o încasare integrală.',
  PAYMENT_OVERTIME_EMPLOYEE_INVALID:
    'Selectează doar animatorii acestui eveniment.',
  PAYMENT_OVERTIME_AMOUNT_TOO_LARGE: 'Totalul prelungirii este prea mare.',
  PAYMENT_OVERTIME_EXCEEDS_AMOUNT:
    'Suma încasată trebuie să includă totalul prelungirii.',
  EMPLOYEE_NOT_FOUND: 'Angajatul nu mai este disponibil.',
  EMPLOYEE_HAS_NO_ACCOUNT: 'Angajatul nu are cont.',
  EMPLOYEE_MUST_BE_INACTIVE:
    'Dezactivează angajatul înainte de ștergerea definitivă.',
  EMPLOYEE_HAS_HISTORY_OR_ACCOUNT:
    'Angajatul are evenimente în istoric sau un cont asociat și nu poate fi șters definitiv.',
  EMPLOYEE_NOT_INVITABLE: 'Acest angajat nu poate primi o invitație.',
  EMPLOYEE_EMAIL_TAKEN: 'Adresa de email este deja folosită.',
  EMPLOYEE_MUST_BE_ACTIVE: 'Activează angajatul înainte de deblocare.',
  INVITATION_ALREADY_USED: 'Invitația a fost deja folosită.',
  INVITATION_INVALID: 'Codul de invitație este invalid sau expirat.',
  MASCOT_NOT_FOUND: 'Mascota nu mai este disponibilă.',
  MASCOT_MUST_BE_INACTIVE:
    'Dezactivează mascota înainte de ștergerea definitivă.',
  MASCOT_HAS_HISTORY:
    'Mascota are evenimente în istoric și nu poate fi ștearsă definitiv.',
  AUTH_INVALID_CREDENTIALS: 'Datele de autentificare sunt incorecte.',
  PASSWORD_RESET_INVALID: 'Codul de resetare este invalid sau expirat.',
};

export class ApiError extends Error {
  status: number;
  reason: ApiErrorReason;
  details?: unknown;

  constructor(
    message: string,
    status: number,
    details?: unknown,
    reason: ApiErrorReason = 'http',
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.reason = reason;
    this.details = details;
  }
}

type ErrorRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is ErrorRecord =>
  typeof value === 'object' && value !== null;

export const responseErrorCode = (body: ApiResponseBody): string | null =>
  body.kind === 'json' &&
  isRecord(body.value) &&
  isRecord(body.value.error) &&
  typeof body.value.error.code === 'string'
    ? body.value.error.code
    : null;

export const errorMessageForResponse = (
  status: number,
  body: ApiResponseBody,
) => {
  if (status === HTTP_TOO_MANY_REQUESTS) {
    return TOO_MANY_REQUESTS_MESSAGE;
  }

  if (status === HTTP_UNAUTHORIZED) {
    return SESSION_EXPIRED_MESSAGE;
  }

  if (
    body.kind === 'json' &&
    isRecord(body.value) &&
    isRecord(body.value.error) &&
    typeof body.value.error.code === 'string'
  ) {
    const message = errorMessagesByCode[body.value.error.code];
    return typeof message === 'string' ? message : REQUEST_FAILED_MESSAGE;
  }

  if (status >= HTTP_SERVER_ERROR) {
    return SERVER_ERROR_MESSAGE;
  }

  return REQUEST_FAILED_MESSAGE;
};
