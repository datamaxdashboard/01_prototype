import {
  cryptoConfig,
  formatNumber,
  pixCommonFields,
  pixConditionalFields,
  pixWalletTypes,
  type FieldDefinition,
  type FiatMethodConfig,
  type PixWalletType,
  type ResearchConfig,
} from '../config/researchConfig';
import type { SessionState } from '../state/session';
import { AccountSelectorCard, BottomSheet, Chevron, CloseButton, CoinIcon, PrimaryButton, Radio, StatusBar } from '../components/Ui';

type ScreenProps = {
  config: ResearchConfig;
  state: SessionState;
  patch: (patch: Partial<SessionState>) => void;
  log: (name: string, payload?: Record<string, unknown>) => void;
  onClose: () => void;
};

const parseAmount = (value: string) => Number(value.replace(/\s/g, '').replace(',', '.'));

export function WithdrawalScreen(props: ScreenProps) {
  const { config, state } = props;
  if (config.scenario === 'fiat') return <FiatWithdrawal {...props} />;

  const selectAccount = (accountId: string) => {
    const bitcoinInline = accountId === 'btc' && config.wager.active && config.wagerUi === 'inline';
    props.log('select_account', { accountId });
    props.patch({
      selectedAccountId: accountId,
      overlay: null,
      selectedNetworkId: accountId === 'usdt' ? state.selectedNetworkId : null,
      amountRaw: accountId === 'usdt' ? String(cryptoConfig.minAmount) : bitcoinInline ? config.wager.bitcoin.amount : '',
      fieldValues: accountId === 'usdt' || bitcoinInline ? state.fieldValues : {},
      completed: false,
      wagerVisible: false,
    });
  };

  return (
    <main className="phone redesigned withdrawal-phone">
      <StatusBar />
      <section className="light-sheet withdrawal-sheet">
        <header className="sheet-header"><h1>Withdrawal</h1><CloseButton onClick={props.onClose} /></header>
        {state.selectedAccountId === 'usdt'
          ? <CryptoForm {...props} />
          : state.selectedAccountId === 'btc' && config.wager.active && config.wagerUi === 'inline'
            ? <BitcoinInlineWagerForm {...props} />
            : <CryptoEntry {...props} />}
      </section>
      {state.overlay === 'account' && (
        <BottomSheet title="Account" onClose={() => props.patch({ overlay: null })}>
          <div className="option-list account-options">
            <AccountOption coin="USDT" name="Tether" code="USDT" amount={formatNumber(config.cryptoBalance)} secondary={`${formatNumber(config.cryptoBalance)} USD`} selected={state.selectedAccountId === 'usdt'} onClick={() => selectAccount('usdt')} />
            <AccountOption coin="BTC" name="Bitcoin" code="BTC" amount="0,003132" secondary="188,24 USD" selected={state.selectedAccountId === 'btc'} onClick={() => selectAccount('btc')} />
            <AccountOption coin="ETH" name="Ethereum" code="ETH" amount="0,019303" secondary="30,32 USD" selected={state.selectedAccountId === 'eth'} onClick={() => selectAccount('eth')} />
            <AccountOption coin="EUR" name="Euro" code="EUR" amount="940.44" secondary="1,072.09 USD" selected={state.selectedAccountId === 'fiat'} onClick={() => selectAccount('fiat')} />
            <AccountOption coin="TON" name="Gram (Toncoin)" code="GRAM" amount="0,00" secondary="0,00 USD" selected={state.selectedAccountId === 'ton'} onClick={() => selectAccount('ton')} />
          </div>
        </BottomSheet>
      )}
      {state.overlay === 'network' && (
        <BottomSheet title="Network" onClose={() => props.patch({ overlay: null })}>
          <div className="option-list network-options">
            {cryptoConfig.networks.map((network) => (
              <button type="button" key={network.id} onClick={() => {
                props.log('select_network', { networkId: network.id, label: network.label });
                props.patch({ selectedNetworkId: network.id, overlay: null, completed: false, wagerVisible: false });
              }}>
                <span><b>{network.label}</b><small>Crediting time {network.eta}</small></span>
                <Radio selected={state.selectedNetworkId === network.id} />
              </button>
            ))}
          </div>
        </BottomSheet>
      )}
    </main>
  );
}

function AccountOption({ coin, name, code, amount, secondary, selected, onClick }: { coin: string; name: string; code: string; amount: string; secondary: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={selected ? 'is-selected' : ''}>
      <CoinIcon coin={coin} /><span><b>{name}</b><small>{code}</small></span><span className="option-amount"><b>{amount}</b><small>{secondary}</small></span>
    </button>
  );
}

function CryptoEntry({ config, state, patch, log }: ScreenProps) {
  const selected = state.selectedAccountId === 'fiat'
    ? { name: 'Euro', code: 'EUR', amount: '940.44', secondary: '1,072.09 USD', coin: 'EUR' }
    : state.selectedAccountId === 'btc'
      ? { name: 'Bitcoin', code: 'BTC', amount: '0,003132', secondary: '188,24 USD', coin: 'BTC' }
      : state.selectedAccountId === 'eth'
        ? { name: 'Ethereum', code: 'ETH', amount: '0,019303', secondary: '30,32 USD', coin: 'ETH' }
        : { name: 'Gram (Toncoin)', code: 'GRAM', amount: '0,00', secondary: '0,00 USD', coin: 'TON' };
  return (
    <>
      <AccountSelectorCard {...selected} onClick={() => { log('open_account_selector'); patch({ overlay: 'account' }); }} />
      <div className="method-grid crypto-method-grid" aria-label="Withdrawal methods">
        <button type="button"><span className="piastrix-mark">✿</span><b>Piastrix</b></button>
        <button type="button"><span className="fk-mark">FK</span><b>FK Wallet</b></button>
        <button type="button"><span className="mastercard-mark"><i /><i /></span><b>Mastercard</b></button>
      </div>
      <span className="sr-only">Scenario balance {config.cryptoBalance} USDT</span>
    </>
  );
}

function CryptoForm({ config, state, patch, log }: ScreenProps) {
  const network = cryptoConfig.networks.find((item) => item.id === state.selectedNetworkId);
  const amount = parseAmount(state.amountRaw);
  const valid = Boolean(state.selectedNetworkId && state.fieldValues.walletAddress?.trim() && Number.isFinite(amount) && amount >= cryptoConfig.minAmount && amount <= config.cryptoBalance);
  const inlineBlocked = config.wager.active && config.wagerUi === 'inline';

  const attempt = () => {
    log('attempt_withdraw', { asset: 'USDT', networkId: state.selectedNetworkId, amount });
    if (config.wager.active) {
      log('withdraw_blocked_by_wager', { presentation: config.wagerUi, remaining: config.wager.remainingText });
      patch({ wagerVisible: true });
    } else {
      log('task_completed', { scenario: config.scenario, asset: 'USDT', networkId: state.selectedNetworkId, amount });
      patch({ completed: true });
    }
  };

  return (
    <>
      <AccountSelectorCard name={cryptoConfig.accountName} code="USDT" amount={formatNumber(config.cryptoBalance)} secondary={`${formatNumber(config.cryptoBalance)} USD`} coin="USDT" onClick={() => { log('open_account_selector'); patch({ overlay: 'account' }); }} />
      {inlineBlocked && <WagerProgress config={config} />}
      <button className="form-control select-control" type="button" onClick={() => { log('open_network_selector'); patch({ overlay: 'network' }); }}>
        <span>{network ? <><small>Network</small><b>{network.label}</b></> : 'Network'}</span><Chevron />
      </button>
      <label className="form-control text-control">
        <span>{state.fieldValues.walletAddress ? 'Wallet number' : 'Wallet address'}</span>
        <input
          type="text"
          autoCapitalize="none"
          autoCorrect="off"
          value={state.fieldValues.walletAddress ?? ''}
          onPaste={() => log('paste_address')}
          onChange={(event) => {
            log('enter_field', { field: 'walletAddress', filled: Boolean(event.target.value) });
            patch({ fieldValues: { ...state.fieldValues, walletAddress: event.target.value }, completed: false, wagerVisible: false });
          }}
          aria-label="Wallet address"
        />
      </label>
      <label className="form-control amount-control crypto-amount-control">
        <small>Amount</small>
        <input
          type="text"
          inputMode="decimal"
          value={state.amountRaw}
          onChange={(event) => {
            log('enter_amount', { value: event.target.value });
            patch({ amountRaw: event.target.value, completed: false, wagerVisible: false });
          }}
          aria-label="Amount"
        />
        <button type="button" onClick={(event) => {
          event.preventDefault();
          log('tap_max', { value: config.cryptoBalance });
          patch({ amountRaw: String(config.cryptoBalance), completed: false, wagerVisible: false });
        }}>All</button>
      </label>
      <p className="range-helper">from {formatNumber(cryptoConfig.minAmount)} USDT to {formatNumber(config.cryptoBalance)} USDT</p>
      <PrimaryButton disabled={!valid || state.completed || state.wagerVisible || inlineBlocked} onClick={attempt}>Withdraw</PrimaryButton>
      {config.wagerUi === 'snackbar' && state.wagerVisible && <WagerSnackbar config={config} onClose={() => { log('close_wager_state'); patch({ wagerVisible: false }); }} />}
      {config.wagerUi === 'modal' && state.wagerVisible && <WagerModal config={config} onClose={() => { log('close_wager_state'); patch({ wagerVisible: false }); }} />}
    </>
  );
}

function BitcoinInlineWagerForm({ config, state, patch, log }: ScreenProps) {
  const fixture = config.wager.bitcoin;
  return (
    <>
      <AccountSelectorCard
        name="Bitcoin"
        code="BTC"
        amount={fixture.balance}
        secondary={fixture.secondaryBalance}
        coin="BTC"
        onClick={() => { log('open_account_selector'); patch({ overlay: 'account' }); }}
      />
      <WagerProgress config={config} remainingText={fixture.remainingText} />
      <label className="form-control text-control">
        <span>{state.fieldValues.walletAddress ? 'Wallet number' : 'Wallet address'}</span>
        <input
          type="text"
          autoCapitalize="none"
          autoCorrect="off"
          value={state.fieldValues.walletAddress ?? ''}
          onPaste={() => log('paste_address')}
          onChange={(event) => {
            log('enter_field', { field: 'walletAddress', filled: Boolean(event.target.value) });
            patch({ fieldValues: { ...state.fieldValues, walletAddress: event.target.value } });
          }}
          aria-label="Wallet address"
        />
      </label>
      <label className="form-control amount-control crypto-amount-control">
        <small>Amount</small>
        <input
          type="text"
          inputMode="decimal"
          value={state.amountRaw}
          onChange={(event) => {
            log('enter_amount', { value: event.target.value });
            patch({ amountRaw: event.target.value });
          }}
          aria-label="Amount"
        />
        <button type="button" onClick={(event) => {
          event.preventDefault();
          log('tap_max', { value: fixture.balance, asset: 'BTC' });
          patch({ amountRaw: fixture.balance });
        }}>All</button>
      </label>
      <p className="range-helper">from {fixture.amountMin} to {fixture.amountMax}</p>
      <PrimaryButton disabled>Withdraw</PrimaryButton>
    </>
  );
}

function WagerProgress({ config, remainingText = config.wager.remainingText }: { config: ResearchConfig; remainingText?: string }) {
  return (
    <section className="wager-progress">
      <div><span>Withdrawal will be available after the wagering requirement is complete</span><i>i</i></div>
      <progress max="100" value={config.wager.progressPercent} />
      <p><span>Wager remaining</span><b>{remainingText}</b></p>
    </section>
  );
}

function WagerSnackbar({ config, onClose }: { config: ResearchConfig; onClose: () => void }) {
  return (
    <section className="wager-snackbar" role="alert">
      <span className="warning-icon">!</span>
      <div><h3>Error</h3><WagerProgress config={config} /></div>
      <CloseButton onClick={onClose} />
    </section>
  );
}

function WagerModal({ config, onClose }: { config: ResearchConfig; onClose: () => void }) {
  return (
    <div className="wager-modal-layer" role="presentation">
      <section className="wager-modal" role="dialog" aria-modal="true" aria-label="Withdrawal interrupted">
        <header><h2>Withdrawal interrupted</h2><CloseButton onClick={onClose} /></header>
        <p>Crypto withdrawal requires wagering the deposit: 1x or 3x for sports</p>
        <WagerProgress config={config} />
        <PrimaryButton onClick={onClose}>Return to game</PrimaryButton>
      </section>
    </div>
  );
}

function FiatWithdrawal(props: ScreenProps) {
  const { config, state } = props;
  const method = config.geoConfig.methods.find((item) => item.id === state.selectedMethodId);
  return (
    <main className="phone redesigned fiat-phone">
      <StatusBar />
      <section className="light-sheet fiat-sheet">
        {!method ? (
          <>
            <header className="sheet-header fiat-picker-header"><h1>Withdrawal</h1><CloseButton onClick={props.onClose} /></header>
            <div className="method-grid fiat-method-grid">
              {config.geoConfig.methods.map((item) => <MethodCard key={item.id} method={item} onClick={() => {
                props.log('select_fiat_method', { geo: config.geo, methodId: item.id });
                props.patch({ selectedMethodId: item.id, amountRaw: String(item.amountMin), fieldValues: {}, selectedPixWalletType: null, completed: false, activeDropdown: null });
              }} />)}
            </div>
          </>
        ) : <FiatForm {...props} method={method} />}
      </section>
    </main>
  );
}

function MethodCard({ method, onClick }: { method: FiatMethodConfig; onClick: () => void }) {
  return (
    <button className={`method-card method-${method.id}`} type="button" onClick={onClick}>
      <span className="method-brand">{method.brand}</span><b>{method.label}</b>
    </button>
  );
}

function FiatForm({ config, state, patch, log, onClose, method }: ScreenProps & { method: FiatMethodConfig }) {
  const pixFields = method.pix
    ? [...pixCommonFields, ...(state.selectedPixWalletType && pixConditionalFields[state.selectedPixWalletType] ? [pixConditionalFields[state.selectedPixWalletType]!] : [])]
    : [];
  const fields = method.pix ? pixFields : method.fields;
  const amount = parseAmount(state.amountRaw);
  const fieldsValid = fields.every((field) => !field.required || Boolean(state.fieldValues[field.id]?.trim()));
  const valid = fieldsValid
    && (!method.pix || Boolean(state.selectedPixWalletType))
    && Number.isFinite(amount)
    && amount >= method.amountMin
    && amount <= method.amountMax
    && amount <= config.geoConfig.balance;

  const selectValue = (fieldId: string, value: string) => {
    log('select_dropdown_option', { field: fieldId, value });
    patch({ fieldValues: { ...state.fieldValues, [fieldId]: value }, activeDropdown: null, completed: false });
  };

  const submit = () => {
    log('attempt_withdraw', { geo: config.geo, methodId: method.id, amount });
    log('task_completed', { scenario: 'fiat', geo: config.geo, methodId: method.id, amount });
    patch({ completed: true });
  };

  return (
    <>
      <header className="fiat-form-nav">
        <button type="button" onClick={() => patch({ selectedMethodId: null, activeDropdown: null, fieldValues: {}, completed: false })}>‹ <span>Back</span></button>
        <CloseButton onClick={onClose} />
      </header>
      <div className={`fiat-brand fiat-brand-${method.id}`}><span>{method.brand}</span><h1>{method.label}</h1></div>
      {method.pix && (
        <SelectField
          id="pixWalletType"
          label="Select pix wallet type"
          value={state.selectedPixWalletType ?? ''}
          options={pixWalletTypes}
          open={state.activeDropdown === 'pixWalletType'}
          onOpen={() => { log('open_dropdown', { field: 'pixWalletType' }); patch({ activeDropdown: state.activeDropdown === 'pixWalletType' ? null : 'pixWalletType' }); }}
          onSelect={(value) => {
            log('select_dropdown_option', { field: 'pixWalletType', value });
            patch({ selectedPixWalletType: value as PixWalletType, activeDropdown: null, completed: false });
          }}
        />
      )}
      {fields.map((field) => field.kind === 'select' ? (
        <SelectField
          key={field.id}
          id={field.id}
          label={field.label}
          value={state.fieldValues[field.id] ?? ''}
          options={field.options ?? []}
          open={state.activeDropdown === field.id}
          onOpen={() => {
            log('open_dropdown', { field: field.id });
            patch({ activeDropdown: state.activeDropdown === field.id ? null : field.id });
          }}
          onSelect={(value) => selectValue(field.id, value)}
        />
      ) : (
        <TextField key={field.id} field={field} value={state.fieldValues[field.id] ?? ''} onChange={(value) => {
          log('enter_field', { field: field.id, filled: Boolean(value) });
          patch({ fieldValues: { ...state.fieldValues, [field.id]: value }, completed: false });
        }} />
      ))}
      <label className="form-control amount-control fiat-amount-control">
        <small>Amount</small>
        <span className="currency-prefix">{method.currencyPrefix}</span>
        <input type="text" inputMode="decimal" value={state.amountRaw} onChange={(event) => {
          log('change_amount', { value: event.target.value, methodId: method.id });
          patch({ amountRaw: event.target.value, completed: false });
        }} aria-label="Amount" />
      </label>
      <p className="range-helper fiat-helper">from {method.currencyPrefix}{formatNumber(method.amountMin)} to {method.currencyPrefix}{formatNumber(method.amountMax)}</p>
      <PrimaryButton disabled={!valid || state.completed} onClick={submit}>Withdraw</PrimaryButton>
    </>
  );
}

function TextField({ field, value, onChange }: { field: FieldDefinition; value: string; onChange: (value: string) => void }) {
  const inputMode = field.kind === 'tel' ? 'tel' : field.kind === 'number' ? 'numeric' : field.kind === 'email' ? 'email' : 'text';
  return (
    <label className="form-control text-control fiat-text-control">
      <input type={field.kind === 'email' ? 'email' : 'text'} inputMode={inputMode} value={value} placeholder={field.label} aria-label={field.label} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SelectField({ id, label, value, options, open, onOpen, onSelect }: { id: string; label: string; value: string; options: readonly string[]; open: boolean; onOpen: () => void; onSelect: (value: string) => void }) {
  return (
    <div className={`dropdown-field${open ? ' is-open' : ''}`}>
      <button className="form-control select-control" type="button" onClick={onOpen} aria-expanded={open} aria-controls={`${id}-options`}>
        <span>{value || label}</span><Chevron up={open} />
      </button>
      {open && (
        <div className="dropdown-options" id={`${id}-options`} role="listbox">
          {options.length ? options.map((option) => <button type="button" role="option" aria-selected={option === value} key={option} onClick={() => onSelect(option)}>{option}</button>) : <p>Options not configured</p>}
        </div>
      )}
    </div>
  );
}
