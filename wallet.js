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
const projectId = "2aca272d18deb10ff748260da5f78bfd"; // Replace with your actual project ID if needed

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

// Utility: Parse BNB to Wei
export function parseEther(value) {
  let str = String(Number(value) * 10 ** 9);
  return str + "000000000";
}