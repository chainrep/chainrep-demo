<script lang="ts">
  import type { ethers } from "ethers";
  import { pushNotification } from "../components/Notifications.svelte";
  import TextInput from "../components/TextInput.svelte";
  import { signer } from "../utils/connection";

  let certName: string = "";

  let signerAddress: string | undefined;
  $: $signer, updateCerts();
  const updateCerts = async () => {
    if($signer) {
      signerAddress = await $signer.getAddress();
    } else {
      signerAddress = undefined;
    }
  };

  const createCert = async () => {
    
  };

  let myAuthorityCerts: { id: ethers.BigNumberish, name: string }[] = [];
  $: issueTo = myAuthorityCerts.map(() => "");

  const issue = async () => {

  };

  const revoke = async () => {
    pushNotification({ message: "not implemented", type: "error" });
  };
</script>

<h1>Create a Certificate</h1>

<TextInput label="Certificate Name" bind:value={certName} />
<button on:click={createCert}>Create</button>

{#if myAuthorityCerts.length > 0}
  <h1>Issue a Certificate</h1>
  {#each myAuthorityCerts as cert, i}
    <div class="cert">
      <h3>{cert.name ?? `Cert #${cert.id}`}</h3>
      <TextInput label="Address" bind:value={issueTo[i]} placeholder="0x1234..." />
      <div>
        <button on:click={issue}>Issue</button>
        <button on:click={revoke}>Revoke</button>
      </div>
    </div>
  {/each}
{/if}

<!-- Style -->
<style>
  .cert > h3 {
    margin: 0;
  }

  .cert {
    padding: 1rem;
    background-color: var(--c3);
    border-radius: var(--border-radius);
  }
</style>