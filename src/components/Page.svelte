<script lang="ts">
  import Router from "svelte-spa-router";
  import { routes } from "../routes";
</script>

<main class="gradient-1-2">
  <Router {routes} />
</main>

<style>
  main {
    flex-grow: 1;
    padding: 2rem 5rem;
    overflow: auto;
    box-shadow: inset 3px 3px 7px #0004;
  }
</style>