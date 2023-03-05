<script lang="ts">
  import Header from "./components/Header.svelte";
  import Body from "./components/Body.svelte";
  import ServiceWorker from "./components/ServiceWorker.svelte";
  import Wrapper from "./components/Wrapper.svelte";
  import Notifications from "./components/Notifications.svelte";
</script>

<!-- Wrapper -->
<Wrapper>

  <!-- Header -->
  <Header />

  <!-- Body -->
  <Body />

</Wrapper>

<!-- Notifications -->
<Notifications />

<!-- Service Worker -->
<ServiceWorker />
