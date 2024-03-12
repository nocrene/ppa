import util from 'node:util';
import {
  describe,
  it,
  before,
  after,
} from 'node:test';
// eslint-disable-next-line no-unused-vars
import WebSocket from 'ws';
import {
  nanoid,
} from 'nanoid';
import {
  LibAPIGServer,
} from '../LibAPIGServer.mjs';
import {
  getServerConfig,
} from './helpers/getServerConfig.mjs';
import {
  newClient,
} from './helpers/newClient.mjs';
import {
  mochaGlobalTeardown,
} from './mocha/mocha.mochaGlobalTeardown.mjs';

describe('LibAPIG', function describeLibAPIGServer() {
  const debuglog = util.debug(`${LibAPIGServer.name}:specs`);
  let serverConfig = null;
  // eslint-disable-next-line no-unused-vars
  const decoder = new TextDecoder();
  let wss = null;

  before(async function doBefore() {
    serverConfig = getServerConfig(debuglog);
    wss = new LibAPIGServer(serverConfig);

    await wss.start();

    serverConfig = getServerConfig(debuglog);

    debuglog({ serverConfig });
  });

  after(async function doAfter() {
    return mochaGlobalTeardown(wss);
  });

  it('should ping all handlers', async function shouldPingPaths() {
    const doPingPong = async (client = null) => new Promise((ok, fail) => {
      const pingMessage = Buffer.from(nanoid());
      const isPingMasked = true;

      client.on('error', (err) => {
        debuglog(['client:on:error =>', err]);

        return fail(err);
      });

      client.on('open', () => {
        client.ping(pingMessage, isPingMasked, function pingFrameSent(networkError = null) {
          if (networkError !== null) {
            debuglog({
              networkError,
            });

            return fail(networkError);
          }

          debuglog('pingFrameSent');

          return undefined;
        });
      });

      client.on('pong', (dataBuffer = null) => {
        debuglog('on:pong', dataBuffer.toString());

        client.close();
      });

      client.on('close', (code = null, reason = null) => {
        debuglog('client:close', code, `"${reason.toString()}"`);

        return ok();
      });
    });

    let client = newClient(serverConfig.server.proto, serverConfig.server.host, serverConfig.server.port, '/');

    await doPingPong(client);

    client = null;
  });
});
