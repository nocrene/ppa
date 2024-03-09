<script>
  import {
    SiteStore,
  } from '$lib/stores/Sites.svelte.js';
  import {
    WECStore,
  } from '$lib/stores/WECs.svelte.js';
	import 'inter-ui/inter-variable.css';
  import Header from '../lib/containers/Header/Header.svelte';
  import Footer from '../lib/containers/Footer/Footer.svelte';
</script>

<style>
  .layout-root {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
    grid-template-areas:
      'header'
      'main'
      'footer'
    ;
    gap: var(--main-grid-gap);
  

    height: 100svh;
    min-height: 100svh;
    max-height: 100svh;
  }

  header {
    grid-area: header;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 0;
  }

  main {
    grid-area: main;
    overflow: hidden;
  }

  footer {
    grid-area: footer;
    bottom: 0;
  }

  header, footer {
    position: sticky;
  }
</style>

<div class="layout-root">
  <Header />
  <main>
	  <slot />
  </main>
  <Footer />
</div>