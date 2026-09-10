import type { ReactNode } from 'react';

export function StatusBar({ light = false }: { light?: boolean }) {
  return (
    <div className={`status-bar${light ? ' status-bar-light' : ''}`} aria-hidden="true">
      <span>18:47</span>
      <span className="status-icons">▮▮▮ ◓ ▰</span>
    </div>
  );
}

export function CloseButton({ onClick, label = 'Close' }: { onClick: () => void; label?: string }) {
  return <button className="icon-close" type="button" onClick={onClick} aria-label={label}>×</button>;
}

export function CoinIcon({ coin }: { coin: string }) {
  const symbol: Record<string, string> = { USDT: '₮', BTC: '₿', ETH: '◆', EUR: '€', TON: '▽', BNB: '◇' };
  return <span className={`coin-icon coin-${coin.toLowerCase()}`}>{symbol[coin] ?? coin.slice(0, 1)}</span>;
}

export function Chevron({ up = false }: { up?: boolean }) {
  return <span className={`chevron${up ? ' up' : ''}`} aria-hidden="true" />;
}

export function PrimaryButton({ children, disabled, onClick, className = '' }: { children: ReactNode; disabled?: boolean; onClick?: () => void; className?: string }) {
  return <button className={`primary-button ${className}`} type="button" disabled={disabled} onClick={onClick}>{children}</button>;
}

export function BottomSheet({ title, children, onClose, footer }: { title: string; children: ReactNode; onClose: () => void; footer?: ReactNode }) {
  return (
    <div className="overlay-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="bottom-sheet" role="dialog" aria-modal="true" aria-label={title}>
        <header><h2>{title}</h2><CloseButton onClick={onClose} /></header>
        <div className="sheet-scroll">{children}</div>
        {footer && <div className="sheet-footer">{footer}</div>}
      </section>
    </div>
  );
}

export function Radio({ selected }: { selected: boolean }) {
  return <span className={`radio-dot${selected ? ' selected' : ''}`} aria-hidden="true" />;
}

export function AccountSelectorCard({
  name,
  code,
  amount,
  secondary,
  coin,
  onClick,
}: {
  name: string;
  code: string;
  amount: string;
  secondary?: string;
  coin: string;
  onClick: () => void;
}) {
  return (
    <button className="account-selector-card" type="button" onClick={onClick}>
      <CoinIcon coin={coin} />
      <span className="account-copy"><b>{name}</b><small>{code}</small></span>
      <span className="account-amount"><b>{amount}</b>{secondary && <small>{secondary}</small>}</span>
      <Chevron />
    </button>
  );
}
