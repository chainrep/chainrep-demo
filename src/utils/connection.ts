import { ethers } from "ethers";
import { writable, get } from "svelte/store";
import { pushNotification } from "../components/Notifications.svelte";
import ChainRepABI from "./abi/chainrep";

const chain = 5; // Goerli
const contractAddress = "0xad5989448181b3ea613a32c0e5442780cf8805ea" // Goerli
// const chain = 420; // OP Goerli
// const contractAddress = "0x43047BC64CE59Ea68fc983e0C3Ded63C9bF9A716"; // OP Goerli

export const signer = writable<ethers.Signer | null>(null);
export const contract = writable<ethers.Contract | null>(null);

// Injected Wallet:
export const connectInjected = async () => {
  if(!("ethereum" in window)) {
    throw new Error("missing ethereum interface on window");
  }
  const browserProvider = new ethers.BrowserProvider(ethereum, "any");
  await browserProvider.send("eth_requestAccounts", []);
  const newSigner = await browserProvider.getSigner();
  console.log(newSigner);
  signer.set(newSigner);
  await switchChain(chain);
  contract.set(new ethers.Contract(contractAddress, ChainRepABI, newSigner));
  pushNotification({ message: `Connected: ${await newSigner.getAddress()}`, type: "success" });
};
window.addEventListener("load", () => connectInjected().catch(console.error));

// Function to switch chains:
export const switchChain = async (chain: number) => {
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
  }
};