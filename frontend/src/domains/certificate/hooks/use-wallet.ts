import { useCallback, useEffect, useState } from 'react';
import { BrowserProvider } from 'ethers';

/**
 * Minimal Web3 wallet connection hook (MetaMask / EIP-1193).
 * Handles connect, account/chain change events, and exposes the provider.
 */

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export const useWallet = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const isMetaMaskInstalled = typeof window !== 'undefined' && Boolean(window.ethereum);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install it to continue.');
      return;
    }
    try {
      setIsConnecting(true);
      setError(null);
      const accounts = (await window.ethereum.request({
        method: 'eth_requestAccounts'
      })) as string[];
      const currentChain = (await window.ethereum.request({
        method: 'eth_chainId'
      })) as string;
      setAccount(accounts[0] ?? null);
      setChainId(currentChain);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccount(null);
    setChainId(null);
  }, []);

  const getProvider = useCallback(() => {
    if (!window.ethereum) return null;
    return new BrowserProvider(window.ethereum as never);
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      setAccount(accounts.length > 0 ? accounts[0] : null);
    };
    const handleChainChanged = (...args: unknown[]) => {
      setChainId(args[0] as string);
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  return {
    account,
    chainId,
    error,
    isConnecting,
    isConnected: Boolean(account),
    isMetaMaskInstalled,
    connect,
    disconnect,
    getProvider
  };
};
