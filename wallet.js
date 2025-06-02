import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
  WagmiCore,
  WagmiCoreChains,
  WagmiCoreConnectors,
} from "https://unpkg.com/@web3modal/ethereum@2.6.2";

import { Web3Modal } from "https://unpkg.com/@web3modal/html@2.6.2";

const { bsc } = WagmiCoreChains;
const { configureChains, createConfig } = WagmiCore;

const chains = [bsc];
const projectId = "2aca272d18deb10ff748260da5f78bfd";

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    ...w3mConnectors({ chains, version: 2, projectId }),
    new WagmiCoreConnectors.CoinbaseWalletConnector({
      chains,
      options: {
        appName: "BNB Withdraw App",
      },
    }),
  ],
  publicClient,
});

const ethereumClient = new EthereumClient(wagmiConfig, chains);

export const web3Modal = new Web3Modal(
  {
    projectId,
    themeMode: "light",
    themeVariables: {
      "--w3m-accent-color": "#f0b90b",
      "--w3m-background-color": "#ffffff",
    },
    walletImages: {
      safe: "https://pbs.twimg.com/profile_images/1566773491764023297/IvmCdGnM_400x400.jpg",
    },
  },
  ethereumClient
);

console.log("WalletConnect (Web3Modal) initialized and ready.");