import util from 'node:util';
import {
  getServerConfig,
} from '../helpers/getServerConfig.mjs';
import {
  LibAPIGServer,
} from '../../LibAPIGServer.mjs';

export function mochaGlobalSetup() {
  const debuglog = util.debug(`${LibAPIGServer.name}:specs`);
  const serverConfig = getServerConfig(debuglog);
  const wss = new LibAPIGServer(serverConfig);

  return wss;
}
