<style>
  .icon-label {
    display: grid;
    grid-template-rows: 1fr;
    grid-template-areas:
      'icon text'
    ;
    grid-template-columns: 3rem 1fr;
    height: 100%;
    background-color: var(--theme-dark_gray);
    gap: var(--main-grid-gap);
    padding: 0 var(--main-grid-gap);

    & .icon-label-icon {
      grid-area: icon;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      aspect-ratio: 1 / 1;
    }

    & .icon-label-text {
      grid-area: text;
      display: flex;
      justify-content: end;
      align-items: center;
    }

    & :is(.icon-label-icon, .icon-label-text) {
      padding: calc(var(--main-grid-gap) / 2);
    }
  }
</style>

<div class="icon-label">
  <div class="icon-label-icon">
    <slot name="icon"></slot>
  </div>
  <div class="icon-label-text">
    <slot name="text"></slot>
  </div>
</div>