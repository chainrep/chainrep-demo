<script lang="ts">
  import Router from "svelte-spa-router";
  import { routes } from "../routes";
</script>

<div class="container gradient-1-2">
  <div class="wrapper">
    <main>
      <Router {routes} />
    </main>
  </div>
</div>

<style>
  div.container {
    flex: 1 1 0;
    box-shadow: inset 3px 3px 7px var(--shadow-color);
    position: relative;
  }
  
  div.wrapper {
    position: absolute;
    inset: 0;
    overflow: auto;
  }

  main {
    padding: 2rem 5rem;
  }
</style>