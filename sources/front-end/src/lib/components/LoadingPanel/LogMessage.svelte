<script>
  let {
    id,
    message,
  } = $props();
</script>

<style>
  .log-message {
    display: grid;
    grid-template-areas:
      'id message'
    ;
    gap: var(--main-grid-gap);
    padding: var(--main-grid-gap) 0;
    grid-template-columns: 3rem max-content;

    & .log-message-id {
      grid-area: id;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    & .log-message-message {
      grid-area: message;
      display: flex;
      justify-content: start;
      align-items: center;
    }
  }
</style>

<div id={`log_${id}`} class="log-message">
  <div class='log-message-id'>{id}</div>
  <div class='log-message-message'>
    {message}
  </div>
</div> 