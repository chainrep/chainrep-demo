<script lang='ts'>
  import { pushNotification } from "../components/Notifications.svelte";
  import TextInput from "../components/TextInput.svelte";
  import { contract } from "../utils/connection";

  let uri: string = "";
  let contractAddressesStr: string = "";
  let domainsStr: string = "";
  let tagsStr: string = "";

  $: contractAddresses = contractAddressesStr.split(',').map(x => x.trim());
  $: domains = domainsStr.split(',').map(x => x.trim());
  $: tags = tagsStr.split(',').map(x => x.trim());

  const submitReport = async () => {
    try {
      console.log(contractAddresses, domains, tags);
      if(!$contract) return pushNotification({ message: "Not connected...", type: "warning" });
      const tx = await $contract.publishReport(contractAddresses, domains, tags, uri);
      pushNotification({ message: "Submitting transaction...", type: "standard" });
      const receipt = await tx.wait();
      pushNotification({ message: "Transaction submitted!", type: "success" });
    } catch(err) {
      console.error(err);
      pushNotification({ message: "Failed to submit report...", type: "error" });
    }
  };
</script>

<h1>File a Report</h1>

<p>
  Use this form to report scams, rug-pulls, grifts, vulnerabilities, hacks, and security issues.
</p>
<ol>
  <li>
    Please ensure that you only submit reports on the relevant chain(s) that they have occurred on.
  </li>
  <li>
    Please provide all addresses, domains, and tags that are relevant to the report.
  </li>
  <li>
    All reports must have a full report link with additional information and proof if necessary.
  </li>
</ol>

<TextInput label="Link to Full Report" placeholder="Report URI (https://, ipfs://, etc..)" bind:value={uri} />
<TextInput label="Effected Contracts" placeholder="ContractAddresses (comma-separated)" bind:value={contractAddressesStr} />
<TextInput label="Effected Domains" placeholder="Domains (comma-separated)" bind:value={domainsStr} />
<TextInput label="Relevant Tags" placeholder="Tags (comma-separated)" bind:value={tagsStr} />

<button on:click={submitReport}>Submit</button>