const featureDependencies = {
  analytics: [],
  auth: ['bookings', 'events'],
  bookings: ['auth', 'catalogs', 'clients', 'company', 'events', 'halls'],
  catalogs: [],
  clients: ['catalogs', 'events'],
  company: ['auth', 'bookings', 'catalogs', 'events', 'halls', 'mobilePolicy'],
  dashboard: ['auth', 'events'],
  employeeWorkspace: ['auth', 'events'],
  employees: ['mascots'],
  events: [
    'auth',
    'bookings',
    'catalogs',
    'clients',
    'company',
    'employees',
    'mascots',
  ],
  halls: ['auth', 'bookings', 'catalogs'],
  mascots: [],
  mobilePolicy: ['auth'],
  monitoring: [],
};

const featureType = name => `feature:${name}`;
const target = types => ({ to: { element: { types } } });

module.exports = {
  elements: [
    { type: 'test-support', pattern: 'src/shared/test' },
    { type: 'shared', pattern: 'src/shared' },
    { type: 'app', pattern: 'src/app' },
    ...Object.keys(featureDependencies).map(name => ({
      type: featureType(name),
      pattern: `src/features/${name}`,
    })),
  ],
  dependencies: {
    default: 'disallow',
    checkInternals: true,
    policies: [
      {
        from: { element: { type: 'shared' } },
        allow: target(['shared']),
      },
      {
        from: { element: { type: 'app' } },
        allow: target([
          'app',
          'shared',
          ...Object.keys(featureDependencies).map(featureType),
        ]),
      },
      ...Object.entries(featureDependencies).map(([name, dependencies]) => ({
        from: { element: { type: featureType(name) } },
        allow: target([
          'shared',
          featureType(name),
          ...dependencies.map(featureType),
        ]),
      })),
      {
        disallow: { to: { file: { categories: 'test' } } },
        message: 'Codul aplicatiei nu poate importa fisiere de test.',
      },
    ],
  },
};
