import type { ResearchConfig } from '../config/researchConfig';
import { StatusBar } from '../components/Ui';

type HomeProps = {
  config: ResearchConfig;
  menuOpen: boolean;
  onOpenMenu: () => void;
  onCloseMenu: () => void;
  onProfile: () => void;
  onBalance: () => void;
  onDeposit: () => void;
};

export function CurrentHome({ config, menuOpen, onOpenMenu, onCloseMenu, onProfile, onBalance, onDeposit }: HomeProps) {
  const balance = config.scenario === 'fiat' ? config.geoConfig.balanceDisplay : `${config.cryptoBalance.toFixed(2)} USDT`;
  return (
    <main className="phone current-home">
      <StatusBar />
      <header className="home-header">
        <div className="wordmark">1win</div>
        <button className="balance-button" type="button" onClick={onBalance}>
          <small>{config.scenario === 'fiat' ? config.geoConfig.accountCode : 'USDT'}⌄</small>
          <strong>{balance.replace(/\s?(USDT|MXN|RUB|INR|ARS|BRL)$/, '')}</strong>
        </button>
        <button className="deposit-compact" type="button" onClick={onDeposit}>Deposit</button>
        <button className="bell" type="button" aria-label="Notifications"><span>●</span>♟</button>
      </header>
      <section className="hero-card" aria-label="VIP Loyalty Program promotion"><img src="./assets/home-hero.png" alt="" /></section>
      <div className="promo-grid">
        <div><img src="./assets/home-promo-free.png" alt="Free money promotion" /></div>
        <div><img src="./assets/home-promo-bonus.png" alt="Bonuses" /></div>
      </div>
      <h2 className="rail-title">◷ Continue playing <span>‹　›</span></h2>
      <div className="game-grid">
        <div><img src="./assets/game-lucky.png" alt="Lucky Jet" /><small><i /> 684 playing</small></div>
        <div><img src="./assets/game-chilli.png" alt="Hot Chilli Bells" /><small><i /> 114 playing</small></div>
        <div><img src="./assets/game-bounty.png" alt="Wild Bounty Showdown" /><small><i /> 493 playing</small></div>
      </div>
      <h2 className="rail-title brand-rail"><em>1W</em> 1win games <span>‹　›</span></h2>
      <nav className="bottom-nav" aria-label="Main navigation">
        <button type="button" onClick={onOpenMenu}>☰<small>Menu</small></button>
        <button className="active" type="button">⌂<small>Home</small></button>
        <button type="button">◉<small>Casino</small></button>
        <button type="button">＄<small>Free money</small></button>
        <button type="button">◎<small>Sports</small></button>
      </nav>
      {menuOpen && <CurrentMenu onClose={onCloseMenu} onProfile={onProfile} />}
    </main>
  );
}

function CurrentMenu({ onClose, onProfile }: { onClose: () => void; onProfile: () => void }) {
  const items = [
    ['◉', 'Casino', true], ['◎', 'Sports', true], ['＄', 'Markets', false], ['B', 'Betwave', true],
    ['🎁', 'Bonuses', false], ['♜', 'VIP Loyalty Program', false], ['♛', 'VIP Club', false],
    ['✣', 'Promotions', false], ['♢', 'Tournaments', false], ['▤', 'Blog', false], ['◎', 'Forum', false],
  ] as const;
  return (
    <div className="menu-layer">
      <aside className="menu-drawer" aria-label="Menu">
        <button type="button" className="profile-row" onClick={onProfile}>
          <span className="avatar">●</span><span><b>VvBebVXQCeT</b><small>ID 372139430</small></span><i>›</i>
        </button>
        <div className="free-card"><b>Free<br />money</b><span>💵</span></div>
        <div className="menu-list">
          {items.map(([icon, item, expandable]) => <button type="button" key={item}><i>{icon}</i>{item}{expandable && <span>⌄</span>}</button>)}
        </div>
        <div className="social-row"><span>●</span><span>➤</span><span>◉</span><span>⋮</span><span>🇬🇧 EN⌄</span></div>
        <button type="button" className="support">●　Support <b>24/7</b></button>
      </aside>
      <button className="menu-close" type="button" onClick={onClose} aria-label="Close menu">×</button>
    </div>
  );
}

export function CurrentBalance({ config, onBack, onDeposit }: { config: ResearchConfig; onBack: () => void; onDeposit: () => void }) {
  const mainAmount = config.scenario === 'fiat' ? config.geoConfig.balanceDisplay : `${config.cryptoBalance.toFixed(2)} USDT`;
  return (
    <main className="phone current-balance">
      <StatusBar />
      <header className="dark-screen-header"><button type="button" onClick={onBack}>‹</button><h1>Balance</h1><span /></header>
      <section className="balance-summary"><small>Total balance</small><strong>{mainAmount}</strong><button type="button" onClick={onDeposit}>Deposit</button></section>
      <section className="balance-list">
        <h2>Accounts</h2>
        <div><span className="balance-coin usdt">₮</span><p><b>Tether</b><small>USDT</small></p><strong>{config.cryptoBalance.toFixed(2)}</strong></div>
        <div><span className="balance-coin btc">₿</span><p><b>Bitcoin</b><small>BTC</small></p><strong>0.003132</strong></div>
        <div><span className="balance-coin eur">€</span><p><b>{config.geoConfig.accountName}</b><small>{config.geoConfig.accountCode}</small></p><strong>{config.geoConfig.balanceDisplay}</strong></div>
      </section>
      <p className="balance-footnote">Your available accounts</p>
    </main>
  );
}
