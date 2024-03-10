class LDRStoreClass {
  isReady = $state(false);
  log = $state([]);

  constructor() {
    console.log(`${this.constructor.name}.ctor`);
  }

  setIsLoaded(value = false) {
    if (this.isReady !== value) {
      this.isReady = value;
    }
  }

  setLogMessage(message = null) {
    if (message === null) {
      return;
    }

    this.log.push(message);
  }
}

let ldrStore;

if (!ldrStore) {
  ldrStore = new LDRStoreClass();
}

export const LDRStore = ldrStore;