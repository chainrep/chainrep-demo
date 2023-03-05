<script lang="ts">
  import type { BigNumberish } from "ethers";
  import { pushNotification } from "../components/Notifications.svelte";
  import Report from "../components/Report.svelte";
  import { contract } from "../utils/connection";

  let searchStr: string;

  const search = async () => {
    try {
      // TODO: actually implement search
      const c = $contract;
      if(c) {
        let filter: any = null;
        if(searchStr.startsWith("0x")) {
          filter = c.filters.ContractReported(null, searchStr)
        } else if(searchStr.includes(".")) {
          filter = c.filters.DomainReported(null, searchStr)
        } else {
          filter = c.filters.TagReported(null, searchStr)
        }
        const events = (await c.queryFilter(filter)).slice(-10);
        const newReports = await Promise.all(events.map(async (e: any) => {
          const report = await c.getReport(e.args.reportId);
          return report.published ? {
            reportId: e.args.reportId,
            reviewer: report.reviewer,
            uri: report.uri
          } : null;
        }));
        reports = newReports.filter(x => !!x) as typeof reports;
      }

    } catch(err) {
      console.error(err);
    }
  };
  
  let reports: { reportId: BigNumberish, reviewer: string, uri: string }[] = [];
</script>

<h1>Search Reports</h1>
<div class="search-bar">
  <input type="text" bind:value={searchStr} placeholder="Search by address, domain, or tags" on:keypress={e => (e.key === "Enter") ? search() : null}>
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