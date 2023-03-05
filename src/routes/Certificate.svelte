<script lang="ts">
  import type { ethers } from "ethers";
  import { pushNotification } from "../components/Notifications.svelte";
  import TextInput from "../components/TextInput.svelte";
  import { contract, signer } from "../utils/connection";

  let certName: string = "";

  let signerAddress: string | undefined;
  $: $signer, $contract, updateCerts();
  const updateCerts = async () => {
    if($signer) {
      signerAddress = await $signer.getAddress();
      if($contract) {
        const filter = $contract.filters.CreateCertificate(null, signerAddress);
        const events = await $contract.queryFilter(filter);
        myAuthorityCerts = events.map((e: any) => {
          return {
            id: e.args.certificateId,
            name: e.args.name
          };
        })
      } else {
        myAuthorityCerts = [];
      }
    } else {
      signerAddress = undefined;
    }
  };

  const createCert = async () => {
    try {
      if(!$contract) return pushNotification({ message: "Not connected...", type: "warning" });
      const tx = await $contract.createCertificate(certName);
      pushNotification({ message: "Submitting transaction...", type: "standard" });
      const receipt = await tx.wait();
      pushNotification({ message: "Transaction submitted!", type: "success" });
      await updateCerts();
    } catch(err) {
      console.error(err);
      pushNotification({ message: "Failed to create certificate...", type: "error" });
    }
  };

  let myAuthorityCerts: { id: ethers.BigNumberish, name: string }[] = [];
  let issueTo: string[] = [];
  $: myAuthorityCerts, resetIssueTo();
  const resetIssueTo = () => issueTo = myAuthorityCerts.map(() => "");
  const issueToProxy = (i: number) => issueTo[i];

  const issue = async (certificateId: ethers.BigNumberish, reviewer: string) => {
    try {
      if(!$contract) return pushNotification({ message: "Not connected...", type: "warning" });
      const tx = await $contract.issueCertificate(certificateId, reviewer);
      pushNotification({ message: "Submitting transaction...", type: "standard" });
      const receipt = await tx.wait();
      pushNotification({ message: "Transaction submitted!", type: "success" });
    } catch(err) {
      console.error(err);
      pushNotification({ message: "Failed to issue certificate...", type: "error" });
    }
  };

  const revoke = async (certificateId: ethers.BigNumberish, reviewer: string) => {
    try {
      if(!$contract) return pushNotification({ message: "Not connected...", type: "warning" });
      const tx = await $contract.revokeCertificate(certificateId, reviewer);
      pushNotification({ message: "Submitting transaction...", type: "standard" });
      const receipt = await tx.wait();
      pushNotification({ message: "Transaction submitted!", type: "success" });
    } catch(err) {
      console.error(err);
      pushNotification({ message: "Failed to revoke certificate...", type: "error" });
    }
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
        <button on:click={() => issue(cert.id, issueToProxy(i))}>Issue</button>
        <button on:click={() => revoke(cert.id, issueToProxy(i))}>Revoke</button>
      </div>
    </div>
  {/each}
{/if}

<!-- Style -->
<style>
  .cert > h3 {
    margin: 0.5rem 0;
  }

  .cert {
    margin-bottom: 1rem;
    padding: 1rem;
    background-color: var(--c3);
    border-radius: var(--border-radius);
  }
</style>