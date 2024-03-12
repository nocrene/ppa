import WebSocket from 'ws';

export const newClient = (proto = 'wss', host = null, port = null, path = null) => {
  const serverAddress = `${proto}://${host}:${port}${path}`;
  const serverProtocols = Object.freeze([]);
  const serverOpts = Object.freeze({});

  return new WebSocket(serverAddress, serverProtocols, serverOpts);
};
