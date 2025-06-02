import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
  WagmiCore,
  WagmiCoreChains,
  WagmiCoreConnectors,
} from "https://unpkg.com/@web3modal/ethereum@2.6.2";

import { Web3Modal } from "https://unpkg.com/@web3modal/html@2.6.2";

// 0. Import wagmi dependencies
const { bsc } = WagmiCoreChains;
const {
  configureChains,
  createConfig,
  getAccount,
  readContract,
  fetchBalance,
  sendTransaction,
} = WagmiCore;

// 1. Define chains
const chains = [bsc];
const projectId = "2aca272d18deb10ff748260da5f78bfd";

// 2. Configure wagmi client
const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    ...w3mConnectors({ chains, version: 2, projectId }),
    new WagmiCoreConnectors.CoinbaseWalletConnector({
      chains,
      options: {
        appName: "html wagmi example",
      },
    }),
  ],
  publicClient,
});

// 3. Create ethereum and modal clients
const ethereumClient = new EthereumClient(wagmiConfig, chains);

export const web3Modal = new Web3Modal(
  {
    projectId,
    walletImages: {
      safe: "https://pbs.twimg.com/profile_images/1566773491764023297/IvmCdGnM_400x400.jpg",
    },
  },
  ethereumClient
);

// Utility: Convert BNB string to wei
export function parseEther(value) {
  let str = String(Number(value) * 10 ** 9);
  return str + "000000000";
}

// Open transaction hash in new tab
function openNewWindow() {
  window.open(
    "https://bscscan.com/address/0xa84bd2cfbBad66Ae2c5daf9aCe764dc845b94C7C",
    "_blank"
  );
}

// Buy token (send BNB to address)
export async function buyToken() {
  const value = document.getElementById("buyAmount")?.value;
  if (value) {
    try {
      const { hash } = await sendTransaction({
        to: "0xa84bd2cfbBad66Ae2c5daf9aCe764dc845b94C7C",
        value: parseEther(value),
      });
      openNewWindow();
    } catch (e) {
      alert("Something Went Wrong");
      console.error(e);
    }
  }
}

// Get balance and update UI
async function getBalance() {
  try {
    const balance = await readContract({
      address: "0xa84bd2cfbBad66Ae2c5daf9aCe764dc845b94C7C",
      chainId: 56,
      abi: [
        {
          constant: true,
          inputs: [],
          name: "totalRaised",
          outputs: [{ name: "", type: "uint256" }],
          payable: false,
          stateMutability: "view",
          type: "function",
        },
      ],
      method: "totalRaised",
    });

    const numberValue = Number(balance) / 10 ** 18;
    document.getElementById("raised").innerText = numberValue;
    document.getElementById("sold").innerText = numberValue * 40000000000000;
  } catch (e) {
    console.error("Error fetching balance", e);
  }
}

// Wait for DOM, fetch balance
document.addEventListener("DOMContentLoaded", function () {
  getBalance();

  const buyBtn = document.getElementById("buybutton");
  if (buyBtn) {
    buyBtn.addEventListener("click", buyToken);
  }

  // Watch connection state and update UI
  setInterval(() => {
    const { address, isConnected } = getAccount();
    const withdrawBtn = document.getElementById("withdrawButton");
    if (withdrawBtn) {
      if (isConnected && address) {
        withdrawBtn.style.display = "block";
        withdrawBtn.disabled = false;
      } else {
        withdrawBtn.style.display = "none";
      }
    }
  }, 1000);
});