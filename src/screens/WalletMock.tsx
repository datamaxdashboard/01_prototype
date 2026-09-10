import { useCallback, useEffect, useState } from 'react';
import { cryptoConfig } from '../config/researchConfig';

declare global {
  interface Document {
    modelContext?: {
      registerTool: (tool: {
        name: string;
        title?: string;
        description: string;
        inputSchema: Record<string, unknown>;
        annotations?: { readOnlyHint?: boolean; untrustedContentHint?: boolean };
        execute: (input: unknown) => unknown | Promise<unknown>;
      }, options?: { signal?: AbortSignal }) => void | Promise<void>;
    };
  }
}

async function copyWithFallback(value: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }
  } catch {
    // Clipboard permissions vary in embedded/mobile browsers.
  }
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.append(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
}

export function WalletMock() {
  const [copied, setCopied] = useState(false);
  const copyAddress = useCallback(async () => {
    await copyWithFallback(cryptoConfig.walletAddress);
    setCopied(true);
    return { copied: true, asset: cryptoConfig.asset, network: cryptoConfig.walletNetwork, address: cryptoConfig.walletAddress };
  }, []);

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      void Promise.resolve(context.registerTool({
        name: 'copy_research_wallet_address',
        title: 'Copy wallet address',
        description: 'Copy the visible USDT receiving address and update the wallet view.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: copyAddress,
      }, { signal: lifecycle.signal })).catch(() => undefined);
    } catch {
      // WebMCP is optional and feature-detected.
    }
    return () => lifecycle.abort();
  }, [copyAddress]);

  return (
    <main className="phone wallet-mock">
      <header className="wallet-header"><button type="button" aria-label="Back">‹</button><h1>Receive</h1><button type="button" aria-label="More options">•••</button></header>
      <section className="wallet-balance"><span className="wallet-token">₮</span><div><small>Asset</small><h2>USDT</h2></div></section>
      <section className="wallet-card">
        <div className="wallet-network"><small>Network</small><b>{cryptoConfig.walletNetwork}</b></div>
        <div className="wallet-qr" aria-hidden="true"><span>▦</span></div>
        <small>Wallet address</small>
        <p>{cryptoConfig.walletAddress}</p>
        <button type="button" onClick={copyAddress}>{copied ? 'Copied' : 'Copy address'} <span>▣</span></button>
      </section>
    </main>
  );
}
