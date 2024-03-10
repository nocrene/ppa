import {
  Loader,
} from '$lib/workers/ldr.js';

let ldr = new Loader();

/** @argument {BeforeUnloadEvent} e */
const handleBeforeUnload = (e) => {
  window.removeEventListener('beforeunload', handleBeforeUnload);

  ldr.finit();
  ldr = undefined;
}

window.addEventListener('beforeunload', handleBeforeUnload);

await ldr.init();