import React, { useState } from 'react';
import { OnboardingUI } from './ui';

export type WalletData = { address: string; name: string };

export default function OnboardingPage({ onConnect }: { onConnect: (wallet: WalletData) => void }) {
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [connectingWalletId, setConnectingWalletId] = useState<string | null>(null);
  
  const availableWallets = [
    { id: 'metamask', name: 'MetaMask', color: '#e2761b', initial: 'M' },
    { id: 'rabby', name: 'Rabby', color: '#7084ff', initial: 'R' },
    { id: 'wc', name: 'WalletConnect', color: '#3b99fc', initial: 'W' },
    { id: 'coinbase', name: 'Coinbase Wallet', color: '#0052ff', initial: 'C' },
  ];

  const handleConnectWallet = (wallet: (typeof availableWallets)[number]) => {
    if (connectingWalletId) return;
    
    setConnectingWalletId(wallet.id);
    
    setTimeout(() => {
      const generatedAddress = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setConnectingWalletId(null);
      setIsSheetVisible(false);
      onConnect({ address: generatedAddress, name: wallet.name });
    }, 900);
  };

  return (
    <OnboardingUI 
      isSheetVisible={isSheetVisible} 
      setIsSheetVisible={setIsSheetVisible}
      connectingWalletId={connectingWalletId}
      availableWallets={availableWallets}
      onConnectWallet={handleConnectWallet}
    />
  );
}
