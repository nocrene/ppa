class WECStoreClass {
  wecs = $state(new Map());

  #fakeWECs() {
    for (let i = 0; i < 50; i += 1) {
      const id = crypto.randomUUID();

      const wecObject = {
        id,
        name: `wec ${i}`,
      };

      this.wecs.set(id, wecObject);
    };
  }

  constructor() {
    this.#fakeWECs();

    console.log(`${this.constructor.name}.ctor`);
  }
}

let wecStore;

if (!wecStore) {
  wecStore = new WECStoreClass();
}

export const WECStore = wecStore;