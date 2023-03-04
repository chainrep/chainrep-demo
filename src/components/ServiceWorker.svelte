<script type="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  // Variables:
  let installing = true;
  let pageLoaded = false;

  // Check for last load timestamp:
  let lastLoad = parseInt(localStorage.getItem("sw:lastLoad") ?? "0");
  localStorage.setItem("sw:lastLoad", "" + Date.now());

  // Check if we just updated the worker:
  let justUpdated = localStorage.getItem("sw:updated") === "true";
  localStorage.removeItem("sw:updated");
  console.log(`[Service Worker]: ${justUpdated ? "Reloaded page after update." : "Checking for updates..."}`);

  // Install Service Worker:
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      if ((location.pathname || "/") === "/") {
        try {
          // Register sw:
          const sw = await navigator.serviceWorker.register("sw.js");
          let updateFound = false;
          sw.addEventListener("updatefound", () => {
            console.log("[Service Worker]: update found!");
            updateFound = true;
            const newWorker = sw.installing;
            newWorker?.addEventListener("statechange", () => {
              console.log(`[Service Worker]: { state: ${newWorker.state} }`);
              if (newWorker.state === "activated") {
                localStorage.setItem("sw:updated", "true");
                location.reload();
              }
            });
          });
          await sw.update();
          setTimeout(() => {
            if(!updateFound) {
              console.log("[Service Worker]: Ready!");
              installing = false;
            }
          }, 100);
        } catch (err) {
          console.warn("[Service Worker]: Failed to register...");
          console.error(err);
          installing = false;
        }
      } else {
        installing = false;
      }
    });
  } else {
    installing = false;
  }

  // Trigger animations next frame:
  onMount(() => {
    pageLoaded = true;
  });
</script>

<!-- Optional install splash overlay -->
{#if installing && ((Date.now() - lastLoad > 1000 * 60 * 60) || justUpdated)}
  <div id="container" out:fade={{ duration: 1000 }}>
    {#if pageLoaded}
      <!-- Icon -->
      <img id="icon" src="favicon.png" alt="">

      <!-- Spinner -->
      <div id="spinner" in:fade={justUpdated ? { duration: 0 } : { duration: 1000, delay: 200 }}>
        <svg
          width="100mm"
          height="100mm"
          viewBox="0 0 100 100"
          version="1.1"
          id="spinner-svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          xmlns="http://www.w3.org/2000/svg">
          <defs
            id="defs2">
            <linearGradient
              id="linearGradient2083">
              <stop
                style="stop-color:currentColor;stop-opacity:1;"
                offset="0"
                id="stop2079" />
              <stop
                style="stop-color:currentColor;stop-opacity:0;"
                offset="1"
                id="stop2081" />
            </linearGradient>
            <linearGradient
              xlink:href="#linearGradient2083"
              id="linearGradient2085"
              x1="98.117805"
              y1="70.801521"
              x2="98.204498"
              y2="149.59045"
              gradientUnits="userSpaceOnUse" />
          </defs>
          <g
            id="spinner-arc">
            <path
              style="opacity:1;fill:none;stroke:url(#linearGradient2085);stroke-width:6;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:0.502336;paint-order:stroke fill markers"
              transform="translate(-41.780995,-67.474064)"
              id="spinner-path"
              d="M 63.255444,145.99962 A 40.341225,40.341225 0 0 1 54.510567,102.03615 40.341225,40.341225 0 0 1 91.780998,77.132843" />
            <animateTransform
              attributeName="transform"
              attributeType="XML"
              type="rotate"
              values="0 50 50;360 50 50"
              dur="2s"
              repeatCount="indefinite" />
          </g>
        </svg>
      </div>
    {/if}
  </div>
{/if}

<!-- Style -->
<style>
  #container {
    position: fixed;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #222;
    z-index: 200;
  }

  #icon, #spinner {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  #icon {
    width: 128px;
  }

  #spinner > svg {
    width: 256px;
  }
</style>