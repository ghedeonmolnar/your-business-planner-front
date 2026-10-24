export type RootStackParamList = {
  CompanyProfile: undefined;
  CustomerHistory: { clientId: string };
  CompanyHalls: undefined;
  HallDetails: { hallId: string };
  HallForm: { hallId?: string; duplicateHallId?: string };
  HallAvailability: { hallId: string };
  HallBookings: { hallId: string };
  CompanyStaff: undefined;
  CompanyOverview: undefined;
  CompanyTeam: undefined;
  Login: undefined;
  HomeTabs: undefined;
  ClientDetails: { clientId: string };
  EventDetails: { eventId: string };
  EventMapPicker: { eventId: string };
  EmployeeDetails: { employeeId: string };
  MascotDetails: { mascotId: string };
};

export type HomeTabParamList = {
  Calendar: undefined;
  More: undefined;
  Dashboard: undefined;
  Analytics: undefined;
  Events: undefined;
  Employees: undefined;
  Clients: undefined;
};

export type EmployeeTabParamList = {
  Agenda: undefined;
  Statistics: undefined;
  Events: undefined;
};
