export class ClientStore {
  #CLIENT_ID_KEY = 'CLIENT_ID';
  id = $state(null);
  navigator = $state(null);

  #readClientIdFromLocalStorage() {
    return localStorage.getItem(this.#CLIENT_ID_KEY);
  }

  #saveClientIdToLocalStorage(clientId = null) {
    if (clientId === null) {
      throw new ReferenceError('clientId is undefined');
    }

    localStorage.setItem(this.#CLIENT_ID_KEY, clientId);
  }

  #defineClientId() {
    let clientId = this.#readClientIdFromLocalStorage();

    if (clientId === null) {
      clientId = crypto.randomUUID();

      this.#saveClientIdToLocalStorage(clientId);
    }

    this.id = clientId;
  }

  #handleConnectionChange(e) {
    const {
      target: {
        downlink,
        effectiveType,
        rtt,
      },
    } = e;

    this.eventHandler = {
      type: 'navigator.connection.onchange',
      payload: {
        downlink,
        effectiveType,
        rtt,
      },
    }
  }

  #defineNavigator() {
    this.navigator = window.navigator;
  }

  constructor() {
    this.#defineClientId();
    this.#defineNavigator();
  }
}