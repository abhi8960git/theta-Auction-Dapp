"use client";
import React, { useState, useEffect } from "react";
import {
  RainbowKitProvider,
  connectorsForWallets,
  ConnectButton,
} from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  walletConnectWallet,
  metaMaskWallet,
} from "@rainbow-me/rainbowkit/wallets";
import {
  useAccount,
  configureChains,
  createConfig,
  WagmiConfig,
  useContractRead,
  useContractReads,
  useContractWrite,
  usePrepareContractWrite,
  useContractEvent,
} from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import "bootstrap/dist/css/bootstrap.min.css";
import "@rainbow-me/rainbowkit/styles.css";
import { stakingTNT20ABI } from "../ABI";
import AuctionApp from "../AuctionPage";
import './style.css';

// const TNT20_CONTRACT = '0x644B6533038DA0Ee6c330f51A16940139bbbE50B'
const TNT20_CONTRACT = "0xD40905FD18c7ACf16C9eBD80Fd751C37a3d3ea63";
const TNT721_CONTRACT = "0x045eE648e4BBAb1b1bcBe95B60e76C9A8143488f";
const projectID = "73bfede1812912189a63f8b354eac692";
const tokenSymbol = "RWD";

const theta = {
  id: 365,
  name: "Theta Testnet",
  network: "theta",
  nativeCurrency: {
    decimals: 18,
    name: "TFUEL",
    symbol: "TFUEL",
  },
  rpcUrls: {
    public: { http: ["https://eth-rpc-api-testnet.thetatoken.org/rpc"] },
    default: { http: ["https://eth-rpc-api-testnet.thetatoken.org/rpc"] },
  },
  blockExplorers: {
    etherscan: {
      name: "Theta Explorer",
      url: ": https://testnet-explorer.thetatoken.org/",
    },
    default: {
      name: "Theta Explorer",
      url: ": https://testnet-explorer.thetatoken.org/",
    },
  },
};



const { chains, publicClient } = configureChains([theta], [publicProvider()]);

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      metaMaskWallet({ projectId: projectID, chains }),
      injectedWallet({ chains }),
      walletConnectWallet({ projectId: projectID, chains }),
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});



function YourApp() {
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light justify-content-between">
        <a className="navbar-brand" href="#" style={{ paddingLeft: "10px" }}>
          Decireport
        </a>
        <div style={{ paddingRight: "10px" }}>
          <ConnectButton />
        </div>
      </nav>
      <AuctionApp />
    </div>
  );
}

function Home() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} initialChain={361}>
        <YourApp />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default Home;
