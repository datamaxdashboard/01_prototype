import type { ResearchConfig } from '../config/researchConfig';
import { CloseButton, StatusBar } from '../components/Ui';

export function ProfileScreen({ config, onClose, onDeposit, onWithdraw }: { config: ResearchConfig; onClose: () => void; onDeposit: () => void; onWithdraw: () => void }) {
  const account = config.scenario === 'fiat' ? config.geoConfig.balanceDisplay : `${config.cryptoBalance.toFixed(2)} USDT`;
  const groups = [
    [['⇆', 'Swap', 'Exchange cryptocurrency', 'New']],
    [['🎁', 'Bonuses', 'Free spins and other offers'], ['◈', 'Bonus codes', 'Code activation'], ['♜', 'VIP Loyalty Program', 'Your level: Bronze 1']],
    [['◷', 'Bet history', 'Open and settled bets'], ['◷', 'Transaction history', 'Deposit and withdrawal statuses']],
    [['⚙', 'Settings', 'Edit personal data'], ['◉', '24/7 support', 'All contact info']],
  ];
  return (
    <main className="phone redesigned">
      <StatusBar />
      <section className="light-sheet profile-sheet">
        <header className="sheet-header"><h1>Profile</h1><CloseButton onClick={onClose} /></header>
        <div className="profile-identity"><div className="big-avatar"><span /></div><h2>John Shower</h2><p>▰ ID 2148600</p></div>
        <div className="account-card">
          <small>Account</small><strong>{account}</strong>
          <div><button className="green" type="button" onClick={onDeposit}>Deposit</button><button type="button" onClick={onWithdraw}>Withdraw</button></div>
        </div>
        <div className="profile-groups">
          {groups.map((group, groupIndex) => <div className="profile-rows" key={groupIndex}>
            {group.map(([icon, title, sub, badge]) => <div key={title}><span>{icon}</span><p><b>{title}</b><small>{sub}</small></p>{badge && <em>{badge}</em>}</div>)}
          </div>)}
        </div>
      </section>
    </main>
  );
}
