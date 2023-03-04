<script type="ts">
  import { link } from "svelte-spa-router";
</script>

<header>
  <a href="/" use:link>Home</a>
  <a href="/about" use:link>About</a>
</header>

<style>
  header {
    max-width: 1024px;
    margin: 0 auto;
    padding: 1rem;
  }
</style>