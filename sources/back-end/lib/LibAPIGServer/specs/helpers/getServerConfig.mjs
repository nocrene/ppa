// eslint-disable-next-line no-unused-vars
export const getServerConfig = () => Object.freeze({
  server: {
    host: process.env.WS_HOST,
    port: parseInt(process.env.WS_PORT, 10),
    proto: process.env.WS_PROTO,
  },
});
