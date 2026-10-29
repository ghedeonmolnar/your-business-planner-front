type QueryFilters = Readonly<Record<string, string | undefined>>;

export const queryKeys = {
  mobilePolicy: ['mobile-policy'] as const,
  planner: {
    clientCreations: (companyId: string) =>
      ['planner', companyId, 'client-creations'] as const,
    hallLists: (companyId: string) =>
      ['planner', companyId, 'hall-lists'] as const,
    halls: (companyId: string, filters: QueryFilters) =>
      ['planner', companyId, 'hall-lists', filters] as const,
    hallDetails: (companyId: string) =>
      ['planner', companyId, 'hall-details'] as const,
    hall: (companyId: string, id: string) =>
      ['planner', companyId, 'hall-details', id] as const,
    customer: (companyId: string, id: string) =>
      ['planner', companyId, 'directory', 'clients', 'detail', id] as const,
    customerLookup: (companyId: string, phone: string) =>
      ['planner', companyId, 'directory', 'clients', 'lookup', phone] as const,
    companyProfile: (companyId: string) =>
      ['planner', companyId, 'company-profile'] as const,
    bookingLists: (companyId: string) =>
      ['planner', companyId, 'bookings'] as const,
    bookingDetails: (companyId: string) =>
      ['planner', companyId, 'booking'] as const,
    calendars: (companyId: string) =>
      ['planner', companyId, 'calendar'] as const,
    dateAvailabilities: (companyId: string) =>
      ['planner', companyId, 'date-availability'] as const,
    dateAvailability: (
      companyId: string,
      owner: string,
      filters: QueryFilters,
    ) => ['planner', companyId, 'date-availability', owner, filters] as const,
    calendarRevision: (companyId: string) =>
      ['planner', companyId, 'calendar-revision'] as const,
    calendarAuthorization: (companyId: string, socketId: string) =>
      ['planner', companyId, 'calendar-authorization', socketId] as const,
    overviews: (companyId: string) =>
      ['planner', companyId, 'overview'] as const,
    agendaSummary: (companyId: string, date: string, finance: boolean) =>
      ['planner', companyId, 'overview', 'agenda', date, finance] as const,
    agendaItems: (
      companyId: string,
      view: string,
      month: string,
      date: string,
      finance: boolean,
    ) =>
      [
        'planner',
        companyId,
        'overview',
        'agenda-items',
        view,
        month,
        date,
        finance,
      ] as const,
    directories: (companyId: string, kind: string) =>
      ['planner', companyId, 'directory', kind] as const,
    reminderWindows: (companyId: string) =>
      ['planner', companyId, 'reminders'] as const,
    reminders: (companyId: string, userId: string) =>
      ['planner', companyId, 'reminders', userId] as const,
    finance: (companyId: string, id: string, kind: string) =>
      ['planner', companyId, 'finance', id, kind] as const,
    all: (companyId: string) => ['planner', companyId] as const,
    bookings: (companyId: string, filters: QueryFilters) =>
      ['planner', companyId, 'bookings', filters] as const,
    booking: (companyId: string, id: string) =>
      ['planner', companyId, 'booking', id] as const,
    calendar: (companyId: string, filters: QueryFilters) =>
      ['planner', companyId, 'calendar', filters] as const,
    directory: (companyId: string, kind: string, filters: QueryFilters = {}) =>
      ['planner', companyId, 'directory', kind, filters] as const,
    overview: (companyId: string, from: string, to: string) =>
      ['planner', companyId, 'overview', from, to] as const,
  },
  catalogs: ['catalogs'] as const,
  summaries: ['summaries'] as const,
  dashboardSummary: ['summaries', 'dashboard'] as const,
  analytics: {
    report: (year: number) =>
      ['summaries', 'analytics', 'report', year] as const,
  },
  clients: {
    all: ['clients'] as const,
    detail: (id: string) => ['clients', id] as const,
    events: (id: string, timeframe: string) =>
      ['clients', id, 'events', timeframe] as const,
    isEvents: (key: readonly unknown[]) =>
      key[0] === 'clients' && key[2] === 'events',
    lookup: (channel: string, value: string) =>
      ['clients', 'lookup', channel, value] as const,
  },
  employees: {
    all: ['employees'] as const,
    details: ['employees', 'detail'] as const,
    detail: (id: string) => ['employees', 'detail', id] as const,
    events: (id: string) => ['employees', 'detail', id, 'events'] as const,
  },
  employeeWorkspace: {
    agenda: ['employee-workspace', 'agenda'] as const,
    agendaSummary: ['employee-workspace', 'agenda-summary'] as const,
    events: ['employee-workspace', 'events'] as const,
    list: (filters: QueryFilters) =>
      ['employee-workspace', 'events', 'list', filters] as const,
    month: (month: string) =>
      ['employee-workspace', 'events', 'month', month] as const,
    reminderWindow: (from: string, to: string) =>
      ['employee-workspace', 'events', 'reminders', from, to] as const,
    detail: (id: string) =>
      ['employee-workspace', 'events', 'detail', id] as const,
    statistics: (period: 'month' | 'all', month: string) =>
      ['employee-workspace', 'statistics', period, month] as const,
  },
  mascots: {
    all: ['mascots'] as const,
    details: ['mascots', 'detail'] as const,
    detail: (id: string) => ['mascots', 'detail', id] as const,
    events: (id: string) => ['mascots', 'detail', id, 'events'] as const,
  },
  events: {
    all: ['events'] as const,
    lists: ['events', 'list'] as const,
    list: (filters: QueryFilters) => ['events', 'list', filters] as const,
    upcoming: ['events', 'upcoming'] as const,
    reminderWindows: ['events', 'reminder-window'] as const,
    reminderWindow: (dateFrom: string, dateTo: string) =>
      ['events', 'reminder-window', dateFrom, dateTo] as const,
    details: ['events', 'detail'] as const,
    detail: (id: string) => ['events', 'detail', id] as const,
    mapSelector: (id: string) => ['events', 'map-selector', id] as const,
    availabilityRoot: ['events', 'availability'] as const,
    availability: (query: QueryFilters) =>
      ['events', 'availability', query] as const,
    payments: (eventId: string) => ['events', eventId, 'payments'] as const,
    review: (eventId: string) => ['events', eventId, 'review'] as const,
    reviewNotifications: ['events', 'review-notifications'] as const,
    documents: (eventId: string) => ['events', eventId, 'documents'] as const,
    documentDownloadUrl: (documentId: string) =>
      ['events', 'documents', documentId, 'download-url'] as const,
  },
};
