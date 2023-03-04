<script type="ts">

</script>

<header>

  <!-- Title -->
  <h1>
    <i class="icofont-link"></i>
    ChainRep
  </h1>

  <div id="connection">

    <!-- Chain -->
    <select>
      <option value="eth">Optimism Goerli</option>
    </select>

    <!-- Wallet -->
    <button>Connect</button>

  </div>
</header>

<style>
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: var(--c4);
    color: var(--c3);
  }

  h1 {
    margin: 0;
  }

  #connection {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  #connection > * {
    height: 32px;
  }
</style>