import {
  WorkerProtoMessageTypes,
} from '$lib/workers/constants/WorkerProtoMessageTypes.js';
import { 
  BroadcastChannelNames,
} from './constants/BroadCastChannelNames';
import {
  LDRStore,
} from '$lib/stores/LDR.svelte.js';
import {
  LDRMachine,
} from './ldr.xstate/LDR.machine.js';
import {
  log,
} from './ldr.xstate/actions/logAction.js';
import {
  LDRSignals,
} from './ldr.xstate/LDRSignals.js';

export class Loader {
  /** @type {Map} */
  #workers = new Map();
  #broadcastChannels = null;
  #workersMap = {
    DB: {
      url: './db.worker/db.js',
      conf: {
        a: 'b',
      },
    },
  }
  #allWorkersNames = [];
  #workerCTORs = [];
  #workerCONFIGd = [];
  #workerSTARTd = [];
  #ldrMachine = null;

  constructor() {
    this.#allWorkersNames = Object.freeze(Object.keys(this.#workersMap).sort());

    this.#broadcastChannels = {
      [BroadcastChannelNames.PROTO]: {
        /** @type {BroadcastChannel} ptr */
        ptr: null,
        handlers: {
          /** @type {MessageEvent} e */
          onmessage: (e) => {
            console.log(`${[BroadcastChannelNames.PROTO]}::onmessage:`, e);
          },
          onmessageerror: (e) => {
            console.error(`${[BroadcastChannelNames.PROTO]}::onmessageerror`, e);
          },
        }
      },
    };
  }

  #initBroadcastChannels() {
    console.log('#initBroadcastChannels');

    const channelNames = [];

    Object.entries(this.#broadcastChannels).forEach(([key, value]) => {
      channelNames.push(key);
      value.ptr = new BroadcastChannel(key);
      value.ptr.onmessage = value.handlers.onmessage;
      value.ptr.onmessageerror = value.handlers.onmessageerror;
    });
  
    LDRStore.setLogMessage(`[${this.constructor.name}] initialized broadcast channels: ${channelNames.join(', ')}`);
    this.#ldrMachine.send({
      type: LDRSignals.BROADCAST_CHANNELS_INITIALIZED,
    });
  }

  #loadWorker({ context, event }, params) {
    const {
      workerName,
    } = params;

    if (typeof workerName === 'undefined') {
      throw new ReferenceError('workerName is undefined');
    }

    const workerInfo = this.#workersMap[workerName];
    const worker = new Worker(new URL(workerInfo.url, import.meta.url), {
      type: 'module',
      name: workerName,
    });

    this.#workers.set(workerName, worker);

    worker.onerror = this.#handleWorkerError.bind(this);
    worker.onmessage = this.#handleWorkerMessage.bind(this);

    LDRStore.setLogMessage(`[${this.constructor.name}] worker ${workerName} has been loaded`);
  }

  #configWorker({ context, event }, params) {
    const {
      workerName,
    } = params;

    if(typeof workerName === 'undefined') {
      throw new ReferenceError('workerName is undefined');
    }

    this.#workers.get(workerName).postMessage({
      type: WorkerProtoMessageTypes.CONFIG,
      payload: this.#workersMap[workerName].conf,
    });
  }

  #handleWorkerError(e) {
    console.error(e);
  }

  #areArraysEqual(left, right) {
    return left.every((element, idx) => element === right[idx]);
  }

  #startWorkers() {
    this.#workers.forEach((worker, workerName) => {
      LDRStore.setLogMessage(`[${this.constructor.name}] starting worker ${workerName}...`);

      worker.postMessage({
        type: WorkerProtoMessageTypes.START,
        payload: null,
      });
    });
  }

  #startWorker({ context, event }, params) {
    const {
      workerName,
    } = params;

    console.log('#startWorker', workerName);

    this.#workers.get(workerName).postMessage({
      type: WorkerProtoMessageTypes.START,
      payload: null,
    });
  }

  #handleWorkerCONFIG(payload) {
    const {
      name,
    } = payload;

    console.log('#handleWorkerCONFIG', name);

    this.#ldrMachine.send({
      type: LDRSignals.WORKER_CONFIGURED,
      payload: {
        name,
      },
    });
  }

  #handleWorkerStart(payload) {
    const {
      name,
    } = payload;

    console.log('#handleWorkerStart', name);
    
    this.#ldrMachine.send({
      type: LDRSignals.WORKER_STARTED,
      payload: {
        name,
      },
    });

    LDRStore.setIsLoaded(true);

    // LDRStore.setLogMessage(`[${this.constructor.name}] worker ${payload.name} has been started`);
  }

  #handleWorkerMessage(e) {
    const {
      data: {
        type,
        payload,
      }
    } = e;

    switch(type) {
      case WorkerProtoMessageTypes.CTOR: {
        this.#ldrMachine.send({
          type: LDRSignals.WORKER_LOADED,
          payload: {
            name: payload.name,
          },
        })

        break;
      }
      case WorkerProtoMessageTypes.CONFIG: {
        return this.#handleWorkerCONFIG(payload);
      }
      case WorkerProtoMessageTypes.START: {
        return this.#handleWorkerStart(payload);
      }
      default: {
        throw new TypeError(`unknown protocol message: ${type}`, payload);
      }
    }
  }

  #unloadWorkers() {
    this.#workers.forEach((worker, workerName) => {
      LDRStore.setLogMessage(`[${this.constructor.name}] stopping worker ${workerName}...`);

      worker.postMessage({
        type: WorkerProtoMessageTypes.STOP,
        payload: null,
      });
    });
  }

  #closeBroadcastChannels() {
    const channelNames = [];

    Object.entries(this.#broadcastChannels).forEach(([key, value]) => {
      value.ptr.onmessage = undefined;
      value.ptr.onmessageerror = undefined;
      value.ptr.close();

      channelNames.push(key);
    });
  
    LDRStore.setLogMessage(`[${this.constructor.name}] closed broadcast channels: ${channelNames.join(', ')}`);
  }

  #handleMachineSnapshot(snapshot) {
    console.log({ snapshot });
  }

  async init() {
    this.#ldrMachine = LDRMachine({
      workerNames: this.#allWorkersNames,
    }, {
      actions: {
        log: log.bind(this),
        loadWorker: this.#loadWorker.bind(this),
        configWorker: this.#configWorker.bind(this),
        startWorker: this.#startWorker.bind(this),
        initBroadcastChannels: this.#initBroadcastChannels.bind(this),
      },
    });
    this.#ldrMachine.subscribe(this.#handleMachineSnapshot);
    this.#ldrMachine.start();
  }

  async finit() {
    await this.#unloadWorkers();
    await this.#closeBroadcastChannels();

    this.#ldrMachine.stop();
  }
}