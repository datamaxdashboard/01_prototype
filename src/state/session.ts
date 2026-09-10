import type { PixWalletType, ResearchConfig } from '../config/researchConfig';

export type Screen = 'home' | 'balance' | 'profile' | 'withdraw' | 'deposit';
export type Overlay = null | 'account' | 'network' | 'depositAsset' | 'depositNetwork' | 'depositBonus';

export type ResearchEvent = {
  timestamp: string;
  name: string;
  payload?: Record<string, unknown>;
};

export type SessionState = {
  currentScreen: Screen;
  depositOrigin: Screen;
  menuOpen: boolean;
  overlay: Overlay;
  activeDropdown: string | null;
  selectedAccountId: string;
  selectedMethodId: string | null;
  selectedNetworkId: string | null;
  selectedPixWalletType: PixWalletType | null;
  fieldValues: Record<string, string>;
  amountRaw: string;
  completed: boolean;
  wagerVisible: boolean;
  depositAsset: 'BTC' | 'USDT' | 'ETH' | 'TON' | 'BNB';
  depositNetworkId: string | null;
  depositBonus: string;
  depositQrOpen: boolean;
  eventLog: ResearchEvent[];
};

export type SessionAction =
  | { type: 'patch'; patch: Partial<SessionState> }
  | { type: 'log'; name: string; payload?: Record<string, unknown> };

export function createInitialState(config: ResearchConfig): SessionState {
  const inlineBitcoinWager = config.scenario === 'wager' && config.wagerUi === 'inline';
  return {
    currentScreen: 'home',
    depositOrigin: 'home',
    menuOpen: false,
    overlay: null,
    activeDropdown: null,
    selectedAccountId: inlineBitcoinWager ? 'btc' : 'fiat',
    selectedMethodId: null,
    selectedNetworkId: null,
    selectedPixWalletType: null,
    fieldValues: {},
    amountRaw: inlineBitcoinWager ? config.wager.bitcoin.amount : '',
    completed: false,
    wagerVisible: false,
    depositAsset: 'USDT',
    depositNetworkId: null,
    depositBonus: '150 free spins',
    depositQrOpen: false,
    eventLog: [{ timestamp: new Date().toISOString(), name: 'open_home' }],
  };
}

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  if (action.type === 'patch') return { ...state, ...action.patch };
  return {
    ...state,
    eventLog: [...state.eventLog, {
      timestamp: new Date().toISOString(),
      name: action.name,
      ...(action.payload ? { payload: action.payload } : {}),
    }],
  };
}
