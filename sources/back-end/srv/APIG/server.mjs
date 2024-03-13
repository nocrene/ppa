#!/usr/bin/env -S NODE_ENV=production NODE_DEBUG=APIG,LibAPIGServer* node --env-file=./.env

import util from 'util';
// import {
//   Controller,
// } from './controller.mjs';

const EXIT_CODE_OK = 0;
const EXIT_CODE_ER = 1;
const debuglog = util.debuglog('APIG');
const serverConfig = Object.freeze({
  server: {
    host: process.env.WS_HOST,
    port: parseInt(process.env.WS_PORT, 10),
  },
  pathOpts: {},
});

debuglog(`process.env.NODE_DEBUG: ${process.env.NODE_DEBUG}`);
debuglog({
  serverConfig,
});

process.exitCode = EXIT_CODE_ER;

// eslint-disable-next-line prefer-const
let ctrl = null;

const handleProcessSignal = async (signal = null) => {
  if (signal !== null) {
    debuglog(`signal "${signal}" received. Exiting.`);
  } else {
    debuglog('exiting');
  }

  await ctrl.stop();

  // eslint-disable-next-line no-process-exit
  process.exit(EXIT_CODE_OK);
};

const handleUncaughtExceptionMonitor = (error, origin) => {
  debuglog('handleUncaughtExceptionMonitor', error, origin);
};

const handleUncaughtException = (error, origin) => {
  debuglog('handleUncaughtException', error, origin);

  // eslint-disable-next-line no-process-exit
  process.exit(error.code);
};

const handleUnhandledRejection = (reason, promise) => {
  debuglog('handleUnhandledRejection', reason, promise);

  // eslint-disable-next-line no-process-exit
  process.exit();
};

const handleWarning = (warning) => {
  debuglog('handleWarning', warning);
};

process.once('SIGINT', handleProcessSignal);
process.once('SIGTERM', handleProcessSignal);
process.on('uncaughtExceptionMonitor', handleUncaughtExceptionMonitor);
process.on('uncaughtException', handleUncaughtException);
process.on('unhandledRejection', handleUnhandledRejection);
process.on('warning', handleWarning);

// ctrl = new Controller(debuglog);

// await ctrl.start(serverConfig);

debuglog('ready');