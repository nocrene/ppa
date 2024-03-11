import {
  setup,
  createActor,
  assign,
  raise,
} from 'xstate';
import {
  LDRStates,
} from './LDRStates.js';
import {
  LDRSignals,
} from './LDRSignals.js';

const ldrMachine = ({ actions }) => setup({
  types: {},
  schemas: {},
  actors: {},
  actions,
  guards: {
    isWorkerListUndefined: ({ context }) => {
      const {
        workerNames,
      } = context;

      if (workerNames === null || typeof workerNames === 'undefined') {
        return true;
      }

      return false;
    },
    isWorkerListEmpty: ({ context }) => {
      const {
        workerNames,
      } = context;

      return workerNames.length === 0
    },
    isAllWorkersLoaded: ({ context }) => {
      const result = context.workerNames.length <= (context.workerToLoadId + 1);

      console.log('guard:isAllWorkersLoaded:', result);

      return result;
    },
    isAllWorkersConfigured: ({ context }) => {
      const result = context.workerNames.length <= (context.workerToConfigId + 1);

      console.log('guard:isAllWorkersConfigured:', result);

      return result;
    },
    isAllWorkersStarted: ({ context }) => {
      const result = context.workerNames.length <= (context.workerToStartId + 1);

      console.log('guard:isAllWorkersStarted:', result);

      return result;
    },
  },
  delays: {},
}).createMachine({
  id: 'LDR',
  initial: LDRStates.INITIAL,
  context: ({ input }) => {
    return { ...input.ctx, ...{
      workerToLoadId: 0,
      workerToConfigId: 0,
      workerToStartId: 0,
      errors: [],
    }};
  },
  states: {
    [LDRStates.INITIAL]: {
      entry: [
        {
          type: 'log',
          params: () => ({
            hello: 'world',
          }),
        },
      ],
      always: {
        target: LDRStates.INIT_BROADCAST_CHANNELS,
      },
    },
    [LDRStates.INIT_BROADCAST_CHANNELS]: {
      entry: [
        {
          type: 'initBroadcastChannels',
        }
      ],
      on: {
        [LDRSignals.BROADCAST_CHANNELS_INITIALIZED]: {
          target: LDRStates.CHECK_WORKERS_DEFINED,
        },
      },
    },
    [LDRStates.CHECK_WORKERS_DEFINED]: {
      always: [
        {
          guard: 'isWorkerListUndefined',
          target: LDRStates.ER,
          actions: [
            assign({
              errors: ({ context }) => {
                return [...context.errors, 'the workerNames array is undefined'];
              },
            })
          ],
        },
        {
          guard: 'isWorkerListEmpty',
          target: LDRStates.ER,
          actions: [
            assign({
              errors: ({ context }) => {
                return [...context.errors, 'the workerNames array should not be empty'];
              },
            }),
          ],
        },
        {
          target: LDRStates.LOAD_WORKER,
        },
      ],
    },
    [LDRStates.LOAD_WORKER]: {
      always: [
        {
          actions: [
            {
              type: 'loadWorker',
              params: ({ context }) => ({
                workerName: context.workerNames[context.workerToLoadId],
              }),
            },
          ],
        },
      ],
      on: {
        [LDRSignals.WORKER_LOADED]: {
          actions: [
            assign({
              workerToLoadId: ({ context, event }) => {
                const {
                  payload: {
                    name,
                  },
                } = event;
                console.log(`on ${LDRSignals.WORKER_LOADED} signal for ${name}`);

                return context.workerToLoadId + 1;
              },
            }),
          ],
          target: LDRStates.CHECK_ALL_WORKERS_LOADED,
        },
      },
    },
    [LDRStates.CHECK_ALL_WORKERS_LOADED]: {
      always: [
        {
          guard: 'isAllWorkersLoaded',
          target: LDRStates.CONFIG_WORKER,
        },
        {
          target: LDRStates.LOAD_WORKER,
        }
      ],
    },
    [LDRStates.CONFIG_WORKER]: {
      always: [
        {
          actions: [
            {
              type: 'configWorker',
              params: ({ context }) => ({
                workerName: context.workerNames[context.workerToConfigId],
              }),
            },
          ],
        },
      ],
      on: {
        [LDRSignals.WORKER_CONFIGURED]: {
          actions: [
            assign({
              workerToConfigId: ({ context, event }) => {
                const {
                  payload: {
                    name,
                  },
                } = event;
                console.log(`on ${LDRSignals.WORKER_CONFIGURED} signal for ${name}`);

                return context.workerToConfigId + 1;
              },
            }),
          ],
          target: LDRStates.CHECK_ALL_WORKERS_CONFIGURED,
        },
      }
    },
    [LDRStates.CHECK_ALL_WORKERS_CONFIGURED]: {
      always: [
        {
          guard: 'isAllWorkersConfigured',
          target: LDRStates.START_WORKER,
        },
        {
          target: LDRStates.LOAD_WORKER,
        }
      ],
    },
    [LDRStates.START_WORKER]: {
      always: [
        {
          actions: [
            {
              type: 'startWorker',
              params: ({ context }) => ({
                workerName: context.workerNames[context.workerToStartId],
              }),
            },
          ],
        },
      ],
      on: {
        [LDRSignals.WORKER_STARTED]: {
          actions: [
            assign({
              workerToStartId: ({ context, event }) => {
                const {
                  payload: {
                    name,
                  },
                } = event;
                console.log(`on ${LDRSignals.WORKER_STARTED} signal for ${name}`);

                return context.workerToStartId + 1;
              },
            }),
          ],
          target: LDRStates.CHECK_ALL_WORKERS_STARTED,
        },
      }
    },
    [LDRStates.CHECK_ALL_WORKERS_STARTED]: {
      always: [
        {
          guard: 'isAllWorkersStarted',
          target: LDRStates.OK,
        },
        {
          target: LDRStates.START_WORKER,
        }
      ],
    },
    //
    [LDRStates.OK]: {
      type: 'final',
    },
    [LDRStates.ER]: {
      type: 'final',
    },
  },
});

export const LDRMachine = (ctx, { actions }) => createActor(ldrMachine({ actions }), {
  input: { ctx },
});
