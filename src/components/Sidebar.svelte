<script lang="ts">
  import Footer from "./Footer.svelte";
  import Nav from "./Nav.svelte";

</script>

<div id="container">

  <!-- Nav -->
  <Nav />

  <!-- Footer -->
  <Footer />

</div>

<style>
  #container {
    width: 20vw;
    max-width: 300px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
</style>