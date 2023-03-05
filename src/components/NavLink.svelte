<script lang="ts">
  import { link, location } from "svelte-spa-router";

  export let page: string;
  export let name: string;
</script>

<div class="nav-link" class:selected={page === $location}>
  <a href="{page}" class="gradient-1-2" use:link>
    {@html name}
  </a>
</div>

<style>
  .nav-link > a, .nav-link > a:visited {
    position: relative;
    display: block;
    appearance: none;
    padding: 1rem 2rem;
    border-radius: var(--border-radius);
    color: var(--c4);
    font-size: large;
    font-weight: bold;
    text-decoration: none;
    z-index: 1;
  }

  .nav-link.selected {
    left: 2rem;
  }

  .nav-link {
    position: relative;
    left: 0;
    transition: all 0.25s ease-out;
  }

  .nav-link::after {
    content: "";
    position: absolute;
    inset: -7px;
    background-color: var(--c3);
    border-radius: var(--border-radius);
  }

  .nav-link.selected > a {
    background: var(--c0);
  }
</style>