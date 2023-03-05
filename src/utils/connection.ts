import { ethers } from "ethers";
import { writable, get } from "svelte/store";

export const signer = writable<ethers.Signer | null>(null);

// Injected Wallet:
export const connectInjected = async () => {
  if(!("ethereum" in window)) {
    throw new Error("missing ethereum interface on window");
  }
  const browserProvider = new ethers.BrowserProvider(ethereum, "any");
  await browserProvider.send("eth_requestAccounts", []);
  signer.set(await browserProvider.getSigner());
};

// Function to switch chains:
export const switchChain = async (chain: number) => {
  await connectInjected();
  const signerState = get(signer);
  if(!signerState) throw new Error("Signer does not exist");
  if(!signerState.provider) throw new Error("Signer does not have a provider");
  const chainId = (await signerState.provider.getNetwork()).chainId;
  if(chainId.toString() != ""+chain) {
    const hexChainId = `0x${chain.toString(16)}`;
    const browserProvider = new ethers.BrowserProvider(ethereum, "any");
    try {
      await browserProvider.send('wallet_switchEthereumChain',
        [{ chainId: hexChainId }],
      );
      await connectInjected();
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      console.error(switchError);
      alert(`Failed to switch to chain: ${chain}`);
    }
    if((await signerState.provider.getNetwork()).chainId.toString() !== ""+chain) {
      throw new Error(`Not connected to requested chain: ${chain}`);
    }
  }
};