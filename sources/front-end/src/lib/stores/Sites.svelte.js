class SiteStoreClass {
  sites = $state(new Map());

  #fakeSites() {
    for (let i = 0; i < 50; i += 1) {
      const id = crypto.randomUUID();

      const siteObject = {
        id,
        name: `site ${i}`,
        info: {
          numOfWECs: Math.trunc(Math.random() * 500) + 1,
        },
      };

      this.sites.set(id, siteObject);
    };
  }

  constructor() {
    this.#fakeSites();

    console.log(`${this.constructor.name}.ctor`);
  }
}

let siteStore;

if (!siteStore) {
  siteStore = new SiteStoreClass();
}

export const SiteStore = siteStore;