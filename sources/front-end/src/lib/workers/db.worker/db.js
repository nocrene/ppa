import {
  WorkerProtoMessageTypes,
} from '$lib/workers/constants/WorkerProtoMessageTypes.js';
import {
  BroadcastChannelNames,
} from '$lib/workers/constants/BroadCastChannelNames.js';

/** @type {BroadcastChannel} */
self.protoBroadcastChannel = null;
self.ownBroadcastChannel = null;

self.handleConfig = (config) => {
  console.log(`[${self.name}].handleConfig`, config);

  self.postMessage({
    type: WorkerProtoMessageTypes.CONFIG,
    payload: {
      name: self.name,
    },
  });
}

self.handleStart = () => {
  self.postMessage({
    type: WorkerProtoMessageTypes.START,
    payload: {
      name: self.name,
    }
  });
}

/**
 * @param {MessageEvent} e
 */
onmessage = (e) => {
  switch(e.data.type) {
    case WorkerProtoMessageTypes.CONFIG: {
      return self.handleConfig(e.data);
    }
    case WorkerProtoMessageTypes.START: {
      return self.handleStart();
    }
    default: {
      throw new TypeError(`unknown worker protocol message type: ${e.data.type}`);
    }
  }
};

/** @param {Event} e */
self.handleProtoBroadcastChannelMessage = (e) => {
  console.log(self.name, e);
}

/** @param {Event} e */
self.handleOwnBroadcastChannelMessage = (e) => {
  console.log(self.name, e);
}

self.protoBroadcastChannel = new BroadcastChannel(BroadcastChannelNames.PROTO);
self.protoBroadcastChannel.onmessage = self.handleProtoBroadcastChannelMessage;

self.ownBroadcastChannel = new BroadcastChannel(BroadcastChannelNames.DB);
self.ownBroadcastChannel.onmessage = self.handleOwnBroadcastChannelMessage;

self.postMessage({
  type: WorkerProtoMessageTypes.CTOR,
  payload: {
    name: self.name,
  },
});