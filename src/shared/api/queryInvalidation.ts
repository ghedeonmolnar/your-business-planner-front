import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryKeys';

type QueryKey = readonly unknown[];

export const invalidatePlannerBooking = (
  client: QueryClient,
  companyId: string,
  bookingId: string,
) => {
  invalidateAll(client, [
    queryKeys.planner.bookingLists(companyId),
    queryKeys.planner.booking(companyId, bookingId),
    queryKeys.planner.calendars(companyId),
    queryKeys.planner.overviews(companyId),
    queryKeys.planner.directories(companyId, 'availability'),
    queryKeys.planner.directories(companyId, 'hall-day'),
    queryKeys.planner.reminderWindows(companyId),
    queryKeys.planner.directories(companyId, 'clients'),
    queryKeys.planner.hallLists(companyId),
    queryKeys.planner.hallDetails(companyId),
  ]);
};

export const refreshPlannerCalendar = (
  client: QueryClient,
  companyId: string,
) =>
  Promise.all([
    client.refetchQueries({
      queryKey: queryKeys.planner.calendars(companyId),
      type: 'active',
    }),
    client.refetchQueries({
      queryKey: queryKeys.planner.directories(companyId, 'hall-day'),
      type: 'active',
    }),
  ]);

export const invalidatePlannerPayments = (
  client: QueryClient,
  companyId: string,
  bookingId: string,
) => {
  invalidateAll(client, [
    queryKeys.planner.bookingLists(companyId),
    queryKeys.planner.booking(companyId, bookingId),
    queryKeys.planner.overviews(companyId),
    queryKeys.planner.finance(companyId, bookingId, 'payments'),
    queryKeys.planner.reminderWindows(companyId),
  ]);
};

export const invalidatePlannerDocuments = (
  client: QueryClient,
  companyId: string,
  bookingId: string,
) => {
  invalidateAll(client, [
    queryKeys.planner.bookingLists(companyId),
    queryKeys.planner.booking(companyId, bookingId),
    queryKeys.planner.finance(companyId, bookingId, 'documents'),
  ]);
};

export const invalidatePlannerTeam = (
  client: QueryClient,
  companyId: string,
) => {
  invalidateAll(client, [
    queryKeys.planner.directories(companyId, 'team'),
    queryKeys.planner.directories(companyId, 'invitations'),
  ]);
};

export const invalidatePlannerCompany = (
  client: QueryClient,
  companyId: string,
) => {
  invalidateAll(client, [queryKeys.planner.companyProfile(companyId)]);
};

export const invalidatePlannerDirectory = (
  client: QueryClient,
  companyId: string,
  kind: 'clients' | 'employees' | 'halls',
) => {
  invalidateAll(client, [
    queryKeys.planner.directories(companyId, kind),
    queryKeys.planner.bookingLists(companyId),
    queryKeys.planner.bookingDetails(companyId),
    queryKeys.planner.reminderWindows(companyId),
  ]);
  if (kind === 'halls') {
    invalidateAll(client, [
      queryKeys.planner.hallLists(companyId),
      queryKeys.planner.hallDetails(companyId),
      queryKeys.planner.calendars(companyId),
      queryKeys.planner.overviews(companyId),
      queryKeys.planner.directories(companyId, 'hall-day'),
    ]);
  }
  if (kind === 'employees') {
    invalidateAll(client, [
      queryKeys.planner.directories(companyId, 'availability'),
      queryKeys.planner.directories(companyId, 'team'),
    ]);
  }
  if (kind === 'clients') {
    invalidateAll(client, [queryKeys.planner.hallDetails(companyId)]);
  }
};

export const invalidatePlannerHall = (
  client: QueryClient,
  companyId: string,
) => {
  invalidatePlannerDirectory(client, companyId, 'halls');
};

const invalidateAll = (queryClient: QueryClient, keys: QueryKey[]) => {
  keys.forEach(queryKey => {
    queryClient.invalidateQueries({ queryKey });
  });
};

export const invalidateSummaries = (queryClient: QueryClient) => {
  invalidateAll(queryClient, [queryKeys.summaries]);
};

export const invalidateSchedulingData = (queryClient: QueryClient) => {
  invalidateAll(queryClient, [
    queryKeys.events.all,
    queryKeys.clients.all,
    queryKeys.employees.all,
    queryKeys.mascots.all,
    queryKeys.summaries,
  ]);
};

export const invalidateEventDetails = (
  queryClient: QueryClient,
  eventId: string,
) => {
  invalidateSchedulingData(queryClient);
  invalidateAll(queryClient, [
    queryKeys.events.detail(eventId),
    queryKeys.events.payments(eventId),
    queryKeys.events.documents(eventId),
  ]);
};

export const invalidateEventFinancials = (
  queryClient: QueryClient,
  eventId: string,
) => {
  invalidateAll(queryClient, [
    queryKeys.events.lists,
    queryKeys.events.upcoming,
    queryKeys.events.reminderWindows,
    queryKeys.events.detail(eventId),
    queryKeys.events.payments(eventId),
    queryKeys.summaries,
    queryKeys.employees.details,
    queryKeys.mascots.details,
  ]);
  queryClient.invalidateQueries({
    queryKey: queryKeys.clients.all,
    predicate: query => queryKeys.clients.isEvents(query.queryKey),
  });
};

export const invalidateEventDocuments = (
  queryClient: QueryClient,
  eventId: string,
) => {
  invalidateAll(queryClient, [queryKeys.events.documents(eventId)]);
};

export const invalidateClientData = (
  queryClient: QueryClient,
  clientId?: string,
) => {
  invalidateAll(queryClient, [queryKeys.clients.all, queryKeys.summaries]);
  invalidateAll(queryClient, [
    queryKeys.events.lists,
    queryKeys.events.upcoming,
    queryKeys.events.details,
  ]);

  if (clientId) {
    invalidateAll(queryClient, [queryKeys.clients.detail(clientId)]);
  }
};

export const invalidateEventMapLocation = (
  queryClient: QueryClient,
  eventId: string,
) => {
  invalidateAll(queryClient, [
    queryKeys.clients.all,
    queryKeys.events.lists,
    queryKeys.events.upcoming,
    queryKeys.events.detail(eventId),
    queryKeys.employeeWorkspace.agenda,
    queryKeys.employeeWorkspace.events,
  ]);
};
