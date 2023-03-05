<script lang='ts'>
  import { pushNotification } from "../components/Notifications.svelte";
    import TextInput from "../components/TextInput.svelte";
  import { signer } from "../utils/connection";

  let uri: string = "";
  let contractAddressesStr: string = "";
  let domainsStr: string = "";
  let tagsStr: string = "";

  $: contractAddresses = contractAddressesStr.split(',').map(x => x.trim());
  $: domains = domainsStr.split(',').map(x => x.trim());
  $: tags = tagsStr.split(',').map(x => x.trim());

  const submitReport = async () => {
    pushNotification({ message: "not implemented yet", type: "error" });
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