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
  <div class="full-report">
    <strong>Full Report:</strong>
    <a href={uri} target="_blank" rel="noreferrer">{uri}</a>
  </div>
  <div>
    <!-- Certs -->
  </div>
</div>

<style>
  #report {
    padding: 1rem;
    border-radius: var(--border-radius);
    background-color: var(--c3);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 600px;
    max-width: 100%;
    box-sizing: border-box;
  }

  #report > h3 {
    margin: 0;
    border-bottom: 1px solid var(--shadow-color);
  }

  #report > h3 > span.id {
    margin-right: 1rem;
  }

  .full-report {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow-x: hidden;
  }
</style>