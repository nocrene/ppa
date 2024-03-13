import flatbuffers from 'flatbuffers';
import {
  MessagePayload,
} from '@dmitry-n-medvedev/fbs/generated/mjs/ts/svelte-websocket-demo/message-payload.js';
import {
  LibWebsocketServer,
} from '@dmitry-n-medvedev/libwebsocketserver/LibWebsocketServer.mjs';
import {
  LibWebsocketServerEvents,
} from '@dmitry-n-medvedev/libwebsocketserver/LibWebsocketServerEvents.mjs';
import {
  Topics,
} from '@dmitry-n-medvedev/libwebsocketserver/Topics.mjs';
import {
  LibDB,
} from '@dmitry-n-medvedev/libdb/LibDB.mjs';
import {
  LibDBEvents,
} from '@dmitry-n-medvedev/libdb/LibDBEvents.mjs';
import {
  Message,
} from '@dmitry-n-medvedev/fbs/generated/mjs/ts/svelte-websocket-demo/message.js';
import {
  createTimestampMessage,
} from '@dmitry-n-medvedev/serializers.timestampmessage/createTimestampMessage.mjs';
import {
  createMoneyMessage,
} from '@dmitry-n-medvedev/serializers.moneymessage/createMoneyMessage.mjs';
import {
  deserializeDonateMessage,
} from '@dmitry-n-medvedev/deserializers.donatemessage/deserializeDonateMessage.mjs';
import {
  donateMessageHandler,
} from './handlers/donateMessageHandler.mjs';

export class Controller {
  #debuglog = null;
  /** @type {LibWebsocketServer} */
  #libWebsocketServer = null;
  /** @type {LibDB} */
  #libDB = null;
  /** @type {TextDecoder} */
  #decoder = null;
  /** @type {Number} */
  #tsInterval = null;
  /** @type {Number} */
  #moneyInterval = null;
  /** @type {flatbuffers.Builder} */
  #builder = null;

  constructor(debuglog = () => {}) {
    this.#debuglog = debuglog;
    this.#decoder = new TextDecoder();
    this.#builder = new flatbuffers.Builder(0);
  }

  // eslint-disable-next-line class-methods-use-this
  #handleUserAdded(userAddedEvent) {
    const {
      payload: {
        // eslint-disable-next-line no-unused-vars
        userId,
      },
    } = userAddedEvent;
  }

  // eslint-disable-next-line class-methods-use-this
  #handleUserDeleted(userDeletedEvent) {
    const {
      payload: {
        // eslint-disable-next-line no-unused-vars
        clientId,
      },
    } = userDeletedEvent;
  }

  // eslint-disable-next-line class-methods-use-this
  #handleWalletChanged(walletChangedEvent) {
    const {
      userId,
      wallet,
      delta,
    } = walletChangedEvent;

    // const message = createServerMoneyMessage(wallet, delta);
    const message = createMoneyMessage(this.#builder, wallet, delta);

    this.#builder.clear();

    this.#libWebsocketServer.sendMessageToClient(userId, message);
  }

  #initLibDB() {
    this.#libDB = new LibDB(this.#debuglog);

    this.#libDB.addListener(LibDBEvents.USER_ADDED, this.#handleUserAdded.bind(this));
    this.#libDB.addListener(LibDBEvents.USER_DELETED, this.#handleUserDeleted.bind(this));
    this.#libDB.addListener(LibDBEvents.WALLET_CHANGED, this.#handleWalletChanged.bind(this));
  }

  #finitLibDB() {
    this.#libDB.removeAllListeners();

    this.#libDB = undefined;
  }

  #handleClientMessage(messageEvent) {
    const {
      ws,
      message,
      isBinary,
    } = messageEvent;

    if (isBinary === false) {
      this.#debuglog('message is not binary');

      return;
    }

    const byteArray = new Uint8Array(message);
    const messageObject = Message.getRootAsMessage(new flatbuffers.ByteBuffer(byteArray));
    const messageObjectPayloadType = messageObject.payloadType();

    switch (messageObjectPayloadType) {
      case MessagePayload.DonateMessage: {
        const donation = deserializeDonateMessage(byteArray);

        donateMessageHandler(this.#libDB, ws.id, { payload: donation }, this.#libWebsocketServer.Clients, this.#debuglog);

        break;
      }
      default: {
        this.#debuglog('handleClientMessage: unknown message type', messageObject);
      }
    }
  }

  #handleClientConnectedEvent({ clientId }) {
    this.#libDB.addUser(clientId);
  }

  #handleClientDisconnectedEvent({ clientId }) {
    console.log('#handleClientDisconnectedEvent', clientId);

    this.#libDB.deleteUser(clientId);
  }

  async #initLibWebsocketServer(serverConfig) {
    this.#libWebsocketServer = new LibWebsocketServer(serverConfig);
    this.#libWebsocketServer.Events.addListener(LibWebsocketServerEvents.CLIENT_CONNECTED, this.#handleClientConnectedEvent.bind(this));
    this.#libWebsocketServer.Events.addListener(LibWebsocketServerEvents.CLIENT_DISCONNECTED, this.#handleClientDisconnectedEvent.bind(this));
    this.#libWebsocketServer.Events.addListener(LibWebsocketServerEvents.MESSAGE_EVENT, this.#handleClientMessage.bind(this));

    await this.#libWebsocketServer.start();
  }

  async #finitLibWebsocketServer() {
    this.#libWebsocketServer.Events.removeAllListeners();
    await this.#libWebsocketServer.stop();

    this.#libWebsocketServer = undefined;
  }

  #startSendingTsMessages() {
    this.#tsInterval = setInterval(() => {
      this.#libWebsocketServer.publish(
        createTimestampMessage(this.#builder, Date.now()),
        Topics.SERVER.TS,
      );

      this.#builder.clear();
    }, 1000);
  }

  #stopSendingTsMessages() {
    clearInterval(this.#tsInterval);
  }

  #startAddingMoneyToWallets() {
    this.#moneyInterval = setInterval(() => {
      for (const [clientId] of this.#libDB.Data) {
        this.#libDB.addSum(clientId, Math.random() * 10);
      }
    }, 5000);
  }

  #stopAddingMoneyToWallets() {
    clearInterval(this.#moneyInterval);
  }

  async start(serverConfig) {
    this.#initLibDB();
    await this.#initLibWebsocketServer(serverConfig);

    this.#startSendingTsMessages();
    this.#startAddingMoneyToWallets();
  }

  async stop() {
    this.#stopSendingTsMessages();
    this.#stopAddingMoneyToWallets();
    this.#finitLibDB();
    await this.#finitLibWebsocketServer();
  }
}
