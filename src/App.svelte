<script lang="ts">
	import Router from "svelte-spa-router";
  import Header from "./components/Header.svelte";
  import ServiceWorker from "./components/ServiceWorker.svelte";
  import { routes } from "./routes";
</script>

<!-- Header -->
<Header />

<!-- Main -->
<main>

  <!-- Router -->
	<Router {routes}/>

</main>

<!-- Service Worker -->
<ServiceWorker />

<!-- Style -->
<style>
  :global(html, body) {
    margin: 0;
    padding: 0;
    background-color: #222;
    color: #eee;
  }

  main {
    max-width: 1024px;
    margin: 0 auto;
    padding: 1rem;
  }
</style>