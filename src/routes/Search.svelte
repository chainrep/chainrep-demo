<script lang="ts">
  import Report from "../components/Report.svelte";

  let searchStr: string;

  const search = async () => {
    try {
      // TODO
    } catch(err) {
      console.error(err);
    }
  };
  
  const reports = [
    {
      reportId: 0,
      reviewer: "0xa184aa8488908b43cCf43b5Ef13Ae528693Dfd00",
      uri: "ipfs://bafkreieb5xpcpwatmqmm2eb6y2f72fx2yokapmrq75axqt3jdoc542dpd4"
    }
  ];
</script>

<h1>Search Reports</h1>
<div class="search-bar">
  <input type="text" bind:value={searchStr}>
  <button on:click={search}>Search</button>
  <i class="icofont-search-2" />
</div>

<!-- Reports -->
<div id="reports">
  {#each reports as report}
    <Report {...report} />
  {/each}
</div>

<!-- Style -->
<style>
  .search-bar {
    position: relative;
    display: flex;
    gap: 1rem;
  }

  .search-bar > input {
    display: block;
    padding: 1rem 2rem 1rem 3rem;
    font-size: medium;
    font-weight: normal;
    max-width: 600px;
    flex-grow: 1;
    box-sizing: border-box;
  }

  .search-bar > input:focus {
    outline: none;
  }

  .search-bar > button {
    font-size: medium;
  }

  .search-bar > i {
    position: absolute;
    left: 1rem;
    top: 50%;
    font-size: large;
    transform: translateY(-50%);
  }

  #reports {
    margin-top: 3rem;
  }
</style>