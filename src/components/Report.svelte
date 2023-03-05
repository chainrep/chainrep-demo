<script lang="ts">
  import type { ethers } from "ethers";

  export let reportId: ethers.BigNumberish;
  export let reviewer: string;
  export let uri: string;

  // TODO: fetch report info (addresses, tags, domains, certifications)

</script>

<div id="report">
  <h3>
    <span class="id">#{reportId}</span>
    <span class="reviewer">{reviewer.slice(0, 6)}...{reviewer.slice(-4)}</span>
  </h3>
</div>

<style>
  #report {
    padding: 1rem;
    border-radius: var(--border-radius);
    background-color: var(--c4);

  }

  #report > h3 > span.id {
    margin-right: 1rem;
  }
</style>