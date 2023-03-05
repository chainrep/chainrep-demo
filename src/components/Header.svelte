<script type="ts">
  import { connectInjected, signer } from "../utils/connection";

  const connect = () => {
    connectInjected().catch((err) => {
      console.error(err);
    });
  }
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
    {#if !$signer}
      <button on:click={connect}>Connect</button>
    {:else}
      {#await $signer.getAddress()}
        <button>Connecting...</button>
      {:then address} 
        <button>{address.slice(0, 6)}...{address.slice(-4)}</button>
      {/await}
    {/if}

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