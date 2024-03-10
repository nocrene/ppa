import {
  WorkerProtoMessageTypes,
} from '$lib/workers/constants/WorkerProtoMessageTypes.js';
import { 
  BroadcastChannelNames,
} from './constants/BroadCastChannelNames';
import {
  LDRStore,
} from '$lib/stores/LDR.svelte.js';

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
    const channelNames = [];

    Object.entries(this.#broadcastChannels).forEach(([key, value]) => {
      channelNames.push(key);
      value.ptr = new BroadcastChannel(key);
      value.ptr.onmessage = value.handlers.onmessage;
      value.ptr.onmessageerror = value.handlers.onmessageerror;
    });
  
    LDRStore.setLogMessage(`[${this.constructor.name}] initialized broadcast channels: ${channelNames.join(', ')}`);
  }

  #loadWorkers() {
    const workerNames = Object.keys(this.#workersMap);

    for(let workerName of workerNames) {
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
  }

  #configWorkers() {
    this.#workers.forEach((worker, workerName) => {
      LDRStore.setLogMessage(`configuring worker ${workerName}`, worker);

      worker.postMessage({
        type: WorkerProtoMessageTypes.CONFIG,
        payload: this.#workersMap[workerName].conf,
      });
    });
  }

  #handleWorkerError(e) {
    console.error(e);
  }

  #areArraysEqual(left, right) {
    return left.every((element, idx) => element === right[idx]);
  }

  #handleWorkerCTOR(payload) {
    const {
      name,
    } = payload;
    
    if (this.#workerCTORs.includes(name) === true) {
      throw new Error(`worker ${name} is already CTORd`);
    }

    this.#workerCTORs.push(name);

    LDRStore.setLogMessage(`[${this.constructor.name}] worker ${name} constructor called`);
    
    if (this.#allWorkersNames.length !== this.#workerCTORs.length) {
      return;
    }

    this.#workerCTORs.sort();

    if (this.#areArraysEqual(this.#allWorkersNames, this.#workerCTORs) === false) {
      return;
    }

    this.#configWorkers();
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

  #handleWorkerCONFIG(payload) {
    const {
      name,
    } = payload;

    if (this.#workerCONFIGd.includes(name) === true) {
      throw new Error(`worker ${name} has already been configured`);
    }

    this.#workerCONFIGd.push(name);
    LDRStore.setLogMessage(`[${this.constructor.name}] worker ${name} has been configured`);

    if (this.#areArraysEqual(this.#allWorkersNames, this.#workerCONFIGd) === false) {
      return;
    }

    this.#startWorkers();
  }

  #handleWorkerStart(payload) {
    const {
      name,
    } = payload;

    if (this.#workerSTARTd.includes(name) === true) {
      throw new Error(`worker ${name} has already been started`);
    }

    this.#workerSTARTd.push(name);

    if (this.#areArraysEqual(this.#allWorkersNames, this.#workerSTARTd) === false) {
      return;
    }

    LDRStore.setIsLoaded(true);

    LDRStore.setLogMessage(`[${this.constructor.name}] worker ${payload.name} has been started`);
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
        return this.#handleWorkerCTOR(payload);
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

  async init() {
    this.#initBroadcastChannels();

    await this.#loadWorkers();
  }

  async finit() {
    await this.#unloadWorkers();
    await this.#closeBroadcastChannels();
  }
}