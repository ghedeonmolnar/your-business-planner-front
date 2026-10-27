const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { createHash } = require('node:crypto');
const { existsSync, readFileSync } = require('node:fs');
const { resolve } = require('node:path');

const environmentFile =
  process.env.ENVFILE ||
  (process.env.NODE_ENV === 'production' ? '.env.production' : '.env');
const environmentPath = resolve(__dirname, environmentFile);
const environmentFingerprint = createHash('sha256')
  .update(environmentFile)
  .update(
    existsSync(environmentPath) ? readFileSync(environmentPath) : 'missing',
  )
  .digest('hex');

/** @type {import('@react-native/metro-config').MetroConfig} */
const config = { cacheVersion: environmentFingerprint };

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
