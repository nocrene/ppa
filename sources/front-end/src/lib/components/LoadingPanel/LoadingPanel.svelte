<script>
  import LogMessage from "./LogMessage.svelte";

  let {
    logMessages,
  } = $props();
</script>
<style>
  #loading-panel {
    --loading-panel-height: 25rem;
    --loading-panel-width: 50rem;

    display: grid;
    grid-template-areas:
      'caption'
      'records'
    ;
    grid-template-rows: max-content 1fr;
    gap: var(--main-grid-gap);
  
    background-color: var(--theme-black);
    width: var(--loading-panel-width);
    height: var(--loading-panel-height);

    position: absolute;
    top: calc(50% - var(--loading-panel-height) / 2);
    left: calc(50% - var(--loading-panel-width) / 2);

    border-radius: var(--main-border-radius);
    filter: drop-shadow(0 0 6px var(--theme-gray));
  
    & #loading-panel-caption {
      grid-area: caption;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: var(--main-grid-gap) 0;
      text-transform: uppercase;
      color: var(--theme-dark_gray);
    }

    & #loading-panel-records {
      grid-area: records;
      display: grid;
      grid-auto-flow: row;
      grid-auto-rows: max-content;
      gap: var(--main-grid-gap);
      overflow-y: auto;
    }

    & .log-message {
      display: flex;
      padding: var(--main-grid-gap) 0;
    }
  }
</style>

<article id="loading-panel">
  <h1 id="loading-panel-caption">
    booting
  </h1>
  <!-- <div id="loading-panel-records">
    {#each logMessages as logMessage, idx}
      <LogMessage id={idx} message={logMessage} />
    {/each}
  </div>  -->
</article>
