<script>
  import IconLabel from "$lib/components/IconLabel/IconLabel.svelte";
  import WecIcon from "$lib/icons/wec.svelte";

  let {
    /** @type {id} string */
    id,
  } = $props();

  let fillColor = "#ffffff";
</script>

<style>
  .site-panel {
    display: grid;
    grid-template-areas:
      'site-name'
      'num-of-wecs'
    ;
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    gap: var(--main-grid-gap);
    background-color: var(--theme-black);
    padding: calc(var(--main-grid-gap) * 2);
    min-height: 15rem;
    border-radius: var(--main-border-radius);
    border: 1px solid transparent;

    container-name: site-panel;
    aspect-ratio: 3 / 1;

    & .site-name {
      grid-area: site-name;
      display: flex;
      justify-content: center;
      align-items: center;
      text-transform: uppercase;
    }

    & .num-of-wecs {
      grid-area: num-of-wecs;
      display: flex;
      justify-content: end;
      align-items: center;
      font-size: 6rem;
      font-variation-settings: "wght" 900, "slnt" 0;
      background-color: var(--theme-dark_gray);
      color: var(--theme-black);
      padding: var(--main-grid-gap);
      border-radius: var(--main-border-radius);
    }
  }

  .site-panel:hover {
    & .num-of-wecs {
      color: var(--theme-green);
    }
  }
</style>

<a {id} href="/site/{id}" class="site-panel container">
  <div class="site-name">
    <slot name="site-name"></slot>
  </div>
  <div class="num-of-wecs num">
    <slot name="num-of-wecs"></slot>
  </div>
</a>