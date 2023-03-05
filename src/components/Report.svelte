<script lang="ts">
  import type { ethers } from "ethers";
  import { contract } from "../utils/connection";

  export let reportId: ethers.BigNumberish;
  export let reviewer: string;
  export let uri: string;

  let certs: string[] = [];
  let tags: string[] = [];

  // TODO: fetch report info (addresses, tags, domains, certifications)
  $: reportId, reviewer, getData().catch(console.error);
  const getData = async () => {
    if($contract) {
      const c = $contract;

      const certFilter = c.filters.IssueCertificate(null, null, reviewer);
      const certEvents = await c.queryFilter(certFilter);
      certs = certEvents.map((e: any) => ""+e.args.certificateId);

      // TODO: edit contract to emit tag string as well as indexed tag
      // const tagFilter = c.filters.TagReported(reportId);
      // const tagEvents = await c.queryFilter(tagFilter);
      // tags = tagEvents.map((e: any) => {
      //   console.log(e);
      //   return e.args.tag;
      // });
      // console.log(tags);
    }
  };

</script>

<div id="report">
  <h3>
    <span class="id">#{reportId}</span>
    <span class="reviewer">{reviewer.slice(0, 6)}...{reviewer.slice(-4)}</span>
  </h3>
  <div class="tags">
    {#each tags as tag}
      <span class="tag">{tag}</span>
    {/each}
  </div>
  <div class="full-report">
    <strong>Full Report:</strong>
    <a href={uri} target="_blank" rel="noreferrer">{uri}</a>
  </div>
  <div class="certs">
    {#each certs as cert}
      <i class="icofont-badge" title="#{cert}" style:color="hsla({Math.floor((parseInt(cert) % 8) * 360 / 8)}, 80%, 50%, 1)"></i>
    {/each}
  </div>
</div>

<style>
  #report {
    padding: 1rem;
    margin-bottom: 1rem;
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

  .certs > i {
    font-size: 24px;
  }

  .tag {
    opacity: 0.6;
    font-size: small;
    margin: 0.5rem;
    padding: 0.5rem;
    border-radius: var(--border-radius);
    background-color: var(--shadow-color);
  }
</style>