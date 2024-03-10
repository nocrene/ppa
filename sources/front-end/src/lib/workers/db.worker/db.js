import {
  WorkerProtoMessageTypes,
} from '$lib/workers/constants/WorkerProtoMessageTypes.js';
import {
  BroadcastChannelNames,
} from '$lib/workers/constants/BroadCastChannelNames.js';

/** @type {BroadcastChannel} */
self.protoBroadcastChannel = null;
self.ownBroadcastChannel = null;
self.config = null;

self.handleConfig = (config) => {
  self.config = Object.assign({}, config);

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

self.initBroadcastChannels = () => {
  self.protoBroadcastChannel = new BroadcastChannel(BroadcastChannelNames.PROTO);
  self.protoBroadcastChannel.onmessage = self.handleProtoBroadcastChannelMessage;

  self.ownBroadcastChannel = new BroadcastChannel(BroadcastChannelNames.DB);
  self.ownBroadcastChannel.onmessage = self.handleOwnBroadcastChannelMessage;
}

self.closeBroadcastChannels = () => {
  self.protoBroadcastChannel.onmessage = undefined;
  self.protoBroadcastChannel.close();
  self.protoBroadcastChannel = undefined;

  self.ownBroadcastChannel.onmessage = undefined;
  self.ownBroadcastChannel.close();
  self.ownBroadcastChannel = undefined;
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
    case WorkerProtoMessageTypes.STOP: {
      return self.closeBroadcastChannels();
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

self.initBroadcastChannels();

self.postMessage({
  type: WorkerProtoMessageTypes.CTOR,
  payload: {
    name: self.name,
  },
});