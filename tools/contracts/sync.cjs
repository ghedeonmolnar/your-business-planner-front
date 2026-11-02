const path = require('node:path');
const { syncContractSnapshots } = require('./snapshots.cjs');

const repository = path.resolve(__dirname, '../..');
const backend = path.resolve(repository, '../business-api/contracts');
const destination = path.join(repository, 'contracts');
syncContractSnapshots(backend, destination);
process.stdout.write(
  'Contractul si limitele backendului au fost sincronizate.\n',
);
