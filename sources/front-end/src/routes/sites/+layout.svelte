<script>
  /**
   * @type {Array<object>}
   */
  let sites = $state([]);

  for (let i = 0; i < 50; i += 1) {
    sites.push({
      id: crypto.randomUUID(),
      name: `Site ${i}`,
    });
  };
</script>

<style>
  #sites-list {
    display: grid;
    grid-template-areas:
      'search'
      'list'
    ;
    grid-template-rows: 4rem 1fr;
    height: 100%;
    overflow: hidden;
    padding: var(--main-grid-gap);

    & search {
      grid-area: search;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    & section {
      grid-area: list;
      display: contents;
      padding: var(--main-grid-gap);

      height: 100%;
    }
  }
</style>

<article id="sites-list">
  <search>
    <input type="search" id="search" name="search" />
  </search>

  <section>
    <slot></slot>
  </section>
</article>