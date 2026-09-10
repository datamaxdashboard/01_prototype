import { useMemo, useReducer } from 'react';
import { cryptoConfig, resolveResearchConfig } from './config/researchConfig';
import { DebugPanel } from './components/DebugPanel';
import { CurrentBalance, CurrentHome } from './screens/CurrentShell';
import { DepositScreen } from './screens/DepositScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { WalletMock } from './screens/WalletMock';
import { WithdrawalScreen } from './screens/WithdrawalScreen';
import { createInitialState, sessionReducer, type Screen, type SessionState } from './state/session';

export default function App() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const config = useMemo(() => resolveResearchConfig(params), [params]);
  const [state, dispatch] = useReducer(sessionReducer, config, createInitialState);

  if (params.get('view') === 'wallet') return <WalletMock />;

  const patch = (next: Partial<SessionState>) => dispatch({ type: 'patch', patch: next });
  const log = (name: string, payload?: Record<string, unknown>) => dispatch({ type: 'log', name, payload });
  const navigate = (screen: Screen) => patch({ currentScreen: screen, menuOpen: false, overlay: null, activeDropdown: null });

  const openDeposit = (origin: Screen) => {
    log('tap_deposit', { origin });
    patch({ currentScreen: 'deposit', depositOrigin: origin, menuOpen: false, overlay: null, depositQrOpen: false });
  };

  const jump = (screen: Screen) => {
    const next: Partial<SessionState> = { currentScreen: screen, menuOpen: false, overlay: null, activeDropdown: null };
    if (screen === 'withdraw') {
      next.selectedMethodId = null;
      const inlineBitcoinWager = config.scenario === 'wager' && config.wagerUi === 'inline';
      next.selectedAccountId = config.scenario === 'fiat' ? 'fiat' : inlineBitcoinWager ? 'btc' : 'usdt';
      next.amountRaw = config.scenario === 'fiat' ? '' : inlineBitcoinWager ? config.wager.bitcoin.amount : String(cryptoConfig.minAmount);
    }
    if (screen === 'deposit') next.depositOrigin = 'profile';
    patch(next);
    log('debug_jump', { screen });
  };

  let screen;
  switch (state.currentScreen) {
    case 'balance':
      screen = <CurrentBalance config={config} onBack={() => { log('back_from_balance'); navigate('home'); }} onDeposit={() => openDeposit('balance')} />;
      break;
    case 'profile':
      screen = <ProfileScreen config={config} onClose={() => navigate('home')} onDeposit={() => openDeposit('profile')} onWithdraw={() => { log('tap_withdraw'); navigate('withdraw'); }} />;
      break;
    case 'withdraw':
      screen = <WithdrawalScreen config={config} state={state} patch={patch} log={log} onClose={() => navigate('profile')} />;
      break;
    case 'deposit':
      screen = <DepositScreen config={config} state={state} patch={patch} log={log} onClose={() => navigate(state.depositOrigin)} />;
      break;
    default:
      screen = <CurrentHome
        config={config}
        menuOpen={state.menuOpen}
        onOpenMenu={() => { log('open_menu'); patch({ menuOpen: true }); }}
        onCloseMenu={() => patch({ menuOpen: false })}
        onProfile={() => { log('open_profile'); navigate('profile'); }}
        onBalance={() => { log('tap_balance'); log('open_balance'); navigate('balance'); }}
        onDeposit={() => openDeposit('home')}
      />;
  }

  return <>{screen}{config.debug && <DebugPanel config={config} state={state} jump={jump} />}</>;
}
