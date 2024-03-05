<style>
  header {
    display: grid;
    grid-template-areas:
      'site-title'
      'nav'
    ;
    justify-content: center;
    align-items: center;

    & h1 {
      grid-area: site-title;
      color: var(--theme-black);
    }

    & nav {
      grid-area: nav;
      display: grid;
      grid-auto-flow: column;
      gap: var(--main-grid-gap);

      & :is(a, a:visited) {
        color: var(--theme-orange);
      }
    }
  }
</style>

<header>
  <h1>ppa</h1>
  <nav>
    <a href="/sites">sites</a>
    <a href="/settings">settings</a>
  </nav>
</header>