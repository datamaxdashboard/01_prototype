import { useState } from 'react';
import { cryptoConfig, type ResearchConfig } from '../config/researchConfig';
import type { SessionState } from '../state/session';
import { BottomSheet, Chevron, CloseButton, CoinIcon, PrimaryButton, Radio, StatusBar } from '../components/Ui';

type Props = {
  config: ResearchConfig;
  state: SessionState;
  patch: (patch: Partial<SessionState>) => void;
  log: (name: string, payload?: Record<string, unknown>) => void;
  onClose: () => void;
};

const assets = [
  { id: 'BTC', name: 'Bitcoin', code: 'BTC' },
  { id: 'USDT', name: 'USDT', code: 'USDT' },
  { id: 'ETH', name: 'Ethereum', code: 'ETH' },
  { id: 'TON', name: 'Toncoin', code: 'TON' },
  { id: 'BNB', name: 'BNB', code: 'BNB' },
] as const;

const bonuses = ['Sports bonus', '150 free spins', '+100% on deposit', 'No bonus'] as const;
const depositAddress = 'UQDrLf2uzkKwhLz27xnKabsn7xnUAkSq';

async function copyText(value: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }
  } catch {
    // Use the fallback below for browser contexts without clipboard permission.
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

export function DepositScreen({ config, state, patch, log, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const asset = assets.find((item) => item.id === state.depositAsset)!;
  const network = cryptoConfig.networks.find((item) => item.id === state.depositNetworkId);
  const needsNetwork = state.depositAsset === 'USDT';

  const handleCopy = async () => {
    await copyText(depositAddress);
    log('copy_deposit_address', { asset: state.depositAsset, networkId: state.depositNetworkId });
    setCopied(true);
  };

  if (state.depositQrOpen) {
    return (
      <main className="phone redesigned deposit-phone">
        <StatusBar />
        <section className="light-sheet deposit-sheet qr-sheet">
          <header className="qr-nav"><button type="button" onClick={() => patch({ depositQrOpen: false })}>‹ <span>Back</span></button><CloseButton onClick={onClose} /></header>
          <h1>Deposit QR code</h1>
          <img className="deposit-qr" src="./assets/deposit-qr.png" alt="Deposit address QR code" />
          <section className="qr-details">
            <div><small>Currency</small><b>{asset.code}</b><CoinIcon coin={asset.code} /></div>
            {needsNetwork && <div><small>Network</small><b>{network?.label ?? 'Ethereum (ERC-20)'}</b></div>}
            <div><small>Crediting time</small><b>{network?.eta ?? '≈ 10 minutes'}</b></div>
            <div><small>Minimum amount</small><b>{state.depositAsset === 'USDT' ? '5 USDT' : '0.0000684 BTC'}</b></div>
            <div><small>Deposit address</small><b className="address-text">{depositAddress}</b><button type="button" onClick={handleCopy} aria-label="Copy address">▣</button></div>
          </section>
          <button className="share-address" type="button" onClick={handleCopy}>{copied ? 'Address copied' : 'Share address'}</button>
        </section>
      </main>
    );
  }

  return (
    <main className="phone redesigned deposit-phone">
      <StatusBar />
      <section className="light-sheet deposit-sheet">
        <header className="sheet-header"><h1>Deposit</h1><CloseButton onClick={onClose} /></header>
        <div className="deposit-tabs"><button type="button">Fiat</button><button className="active" type="button">Crypto</button></div>
        <div className={`deposit-select-row${needsNetwork ? ' two' : ''}`}>
          <button className="form-control select-control" type="button" onClick={() => patch({ overlay: 'depositAsset' })}><span><CoinIcon coin={asset.code} /> {asset.name}</span><Chevron /></button>
          {needsNetwork && <button className="form-control select-control" type="button" onClick={() => patch({ overlay: 'depositNetwork' })}><span>{network?.label ?? 'Network'}</span><Chevron /></button>}
        </div>
        <p className="deposit-warning"><b>{state.depositAsset === 'USDT' ? 'Minimum 5 USDT' : 'Minimum 0.0000684 BTC'}</b><span>Amounts below this will not be credited.</span></p>
        <h2>Deposit address</h2>
        <div className="deposit-address-row"><button type="button" onClick={() => patch({ depositQrOpen: true })}><span>{depositAddress.slice(0, 6)}</span>{depositAddress.slice(6, -6)}<span>{depositAddress.slice(-6)}</span><b>▦</b></button><button type="button" onClick={handleCopy} aria-label="Copy deposit address">{copied ? '✓' : 'Copy'}</button></div>
        <h2>Bonuses</h2>
        <button className="bonus-card" type="button" onClick={() => patch({ overlay: 'depositBonus' })}><span>🎁</span><p><b>{state.depositBonus}</b><small>Applied</small></p><em>2 more</em><Chevron /></button>
        <p className="bonus-note">Do not change the bonus until the payment is complete. It will be applied after funds are credited to your account.</p>
        <div className="deposit-actions"><PrimaryButton onClick={() => log('connect_wallet', { asset: state.depositAsset, networkId: state.depositNetworkId })}>Connect wallet</PrimaryButton><button type="button" onClick={() => patch({ depositQrOpen: true })}>QR code</button></div>
      </section>
      {state.overlay === 'depositAsset' && <BottomSheet title="Currency" onClose={() => patch({ overlay: null })} footer={<PrimaryButton onClick={() => patch({ overlay: null })}>Back to deposit</PrimaryButton>}>
        <div className="option-list asset-options">{assets.map((item) => <button type="button" key={item.id} onClick={() => {
          log('select_deposit_asset', { asset: item.id });
          patch({ depositAsset: item.id, depositNetworkId: null, overlay: null });
        }}><CoinIcon coin={item.code} /><span><b>{item.name}</b><small>{item.code}</small></span><Radio selected={state.depositAsset === item.id} /></button>)}</div>
      </BottomSheet>}
      {state.overlay === 'depositNetwork' && <BottomSheet title="Network" onClose={() => patch({ overlay: null })} footer={<PrimaryButton onClick={() => patch({ overlay: null })}>Back to deposit</PrimaryButton>}>
        <div className="option-list network-options">{cryptoConfig.networks.map((item) => <button type="button" key={item.id} onClick={() => {
          log('select_deposit_network', { networkId: item.id });
          patch({ depositNetworkId: item.id, overlay: null });
        }}><span><b>{item.label}</b><small>Crediting time {item.eta}</small></span><Radio selected={state.depositNetworkId === item.id} /></button>)}</div>
      </BottomSheet>}
      {state.overlay === 'depositBonus' && <BottomSheet title="Bonuses" onClose={() => patch({ overlay: null })} footer={<PrimaryButton onClick={() => patch({ overlay: null })}>Back to deposit</PrimaryButton>}>
        <p className="bonus-sheet-note">Do not change the bonus until the payment is complete. It will be applied after funds are credited to your account.</p>
        <div className="option-list bonus-options">{bonuses.map((bonus) => <button type="button" key={bonus} onClick={() => { log('select_deposit_bonus', { bonus }); patch({ depositBonus: bonus, overlay: null }); }}><span className="bonus-emoji">{bonus === 'No bonus' ? '⊘' : '🎁'}</span><span><b>{bonus}</b>{bonus !== 'No bonus' && <small>Deposit from 5 USDT</small>}</span><Radio selected={state.depositBonus === bonus} /></button>)}</div>
      </BottomSheet>}
    </main>
  );
}
