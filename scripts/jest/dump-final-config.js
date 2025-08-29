#!/usr/bin/env node
/**
 * Resolve a configuração async do jest.config.js e imprime coverageThreshold efetivo.
 */
(async () => {
  const cfgExport = require('../../jest.config.js');
  const resolved = typeof cfgExport === 'function' ? await cfgExport() : cfgExport;
  console.log(
    '[jest:config] coverageThreshold:',
    JSON.stringify(resolved.coverageThreshold, null, 2),
  );
  console.log('[jest:config] keys:', Object.keys(resolved));
})();
