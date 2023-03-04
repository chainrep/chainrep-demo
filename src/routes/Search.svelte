<script lang="ts">
  let searchStr: string;

  const search = async () => {
    try {
      // TODO
    } catch(err) {
      console.error(err);
    }
  };
</script>

<h1>Search Reports</h1>
<div class="search-bar">
  <input type="text" bind:value={searchStr}>
  <button on:click={search}>Search</button>
  <i class="icofont-search-2" />
</div>

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
</style>