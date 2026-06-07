<div align="center">

# <img src="./assets/icon.png" width="120" alt="PulsarFi" />

### Asset-backed Indonesian equity tokenization on Arbitrum Sepolia - Mobile App

[![React Native](https://img.shields.io/badge/React_Native-0.81-blue?logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54-black?logo=expo)](https://expo.dev/)
[![Nativewind](https://img.shields.io/badge/Nativewind-Tailwind-38B2AC?logo=tailwindcss)](#)
[![Wagmi](https://img.shields.io/badge/Wagmi-AppKit-blue)](#)

**PulsarFi turns selected IDX equities into 1:1 pStock receipts with custodian attestations, IDRX settlement, and on-chain liquidity.**

[Explore Docs](https://pulsarfi-docs.vercel.app)

<br/>

<img src="https://img.shields.io/badge/RWA-IDX%20Equities-c8102e?style=for-the-badge" alt="RWA IDX Equities"/>
<img src="https://img.shields.io/badge/Settlement-IDRX-16110e?style=for-the-badge" alt="IDRX Settlement"/>
<img src="https://img.shields.io/badge/Custody-3%2F5%20Multisig-1f7a4b?style=for-the-badge" alt="Custody Multisig"/>

</div>

---

## Why Mobile?

Even though the website is designed to be mobile-first, performance often feels lighter on a native mobile app, significantly reducing friction from a UX perspective.

## Overview

**A Note on Development:** This project was built with strict architectural oversight. While AI tools were leveraged to accelerate development, every line of code was explicitly directed, reviewed, and deeply understood. There is no 'vibecoding' here. AI acts solely as a velocity multiplier for a deliberately engineered system.

PulsarFi tokenizes Indonesian public equities into pStock tokens on Arbitrum Sepolia. Each pStock represents custodian-backed IDX exposure, priced through IDX market data and traded against IDRX liquidity.

The mobile app brings this experience directly to your phone:

- **Markets**: browse pStocks, IDX prices, IHSG, and token detail pages.
- **Portfolio**: view wallet holdings, transfers, swaps, and redemption requests.
- **Protocol Integration**: mint, approve, execute, and redeem pStocks through smart contracts via Reown AppKit.

## Architecture

```mermaid
flowchart TB
  User[User Wallet] --> MobileApp[Expo Mobile App]
  
  MobileApp --> API[Go API<br/>Gin + GORM]
  API --> DB[(PostgreSQL)]
  API --> Yahoo[Yahoo Finance<br/>IDX + IHSG Prices]
  API --> Chain[Arbitrum Sepolia RPC]

  MobileApp --> Wallet[Reown AppKit + Wagmi]
  Wallet --> Protocol[PulsarProtocol<br/>UUPS + 3/5 Multisig]
  Protocol --> PStock[PulsarStock ERC20]
  Protocol --> AMM[Uniswap V2 Router]
  AMM --> IDRX[IDRX Mock]
```

## Stack

| Layer | Technology |
|---|---|
| Frontend | React Native, Expo, Nativewind (TailwindCSS), Reown AppKit, Wagmi |
| Backend | Go, Gin, GORM, PostgreSQL (External) |
| Smart contracts | Solidity, UUPS, OpenZeppelin, Uniswap V2 (External) |
| Data | Yahoo Finance chart API, on-chain AMM reserves |
| Network | Arbitrum Sepolia |

## Quick Start

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run the project (with tunnel for WalletConnect reliability)
npx expo start --tunnel --clear
```

> **Note:** To test WalletConnect interactions and web3 libraries properly, the app must be run on a physical device using `expo-dev-client` or via a direct APK build. The standard Expo Go app does not support all the native modules required for the Web3 wallet integrations.

## Docs

Full documentation lives at [pulsarfi-docs.vercel.app](https://pulsarfi-docs.vercel.app).
