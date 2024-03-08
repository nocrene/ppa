<script>
  import SitePanel from "$lib/components/SitePanel/SitePanel.svelte";
	import { SiteStore } from "$lib/stores/Sites.svelte";

  let sites = $state([]);

  $effect(() => {
    sites = SiteStore.sites.values();
  });

  const padNum = (/** @type Number*/ num) => num.toString().padStart(3, '0');
</script>

<style>
  .site-items {
    display: grid;
    grid-template-columns: repeat(4, auto);
    grid-auto-rows: max-content;
    gap: var(--main-grid-gap);
    padding: var(--main-grid-gap);

    overflow-y: auto;
    height: 100%;
  }
</style>

<div class="site-items">
  {#each sites as site(site.id)}
    <SitePanel id={site.id}>
      <svelte:fragment slot="num-of-wecs">
        {padNum (site.info.numOfWECs)}
      </svelte:fragment>
      <svelte:fragment slot="site-name">
        {site.name}
      </svelte:fragment>
    </SitePanel>
  {/each}
</div>