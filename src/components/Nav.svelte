<script lang="ts">
  import NavLink from "./NavLink.svelte";

  const links = [
    { page: "/search", name: "<i class='icofont-search-2'></i> Search" },
    { page: "/report", name: "<i class='icofont-search-document'></i> Report" },
    { page: "/certificate", name: "<i class='icofont-badge'></i> Certificate" },
    { page: "/about", name: "<i class='icofont-info-circle'></i> About" }
  ];
</script>

<nav>
  {#each links as link}
    <NavLink {...link} />
  {/each}
</nav>

<style>
  nav {
    flex-grow: 1;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
</style>