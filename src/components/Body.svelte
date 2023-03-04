<script lang="ts">
  import Sidebar from "./Sidebar.svelte";
  import Page from "./Page.svelte";
</script>

<div id="container">

  <!-- Sidebar -->
  <Sidebar />

  <!-- Page -->
  <Page />

</div>

<style>
  #container {
    flex-grow: 1;
    display: flex;
    align-items: stretch;
  }
</style>