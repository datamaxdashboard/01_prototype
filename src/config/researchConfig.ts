export type Scenario = 'crypto' | 'fiat' | 'wager';
export type Geo = 'mx' | 'ru' | 'in' | 'ar' | 'br' | 'kr';
export type WagerUi = 'inline' | 'snackbar' | 'modal';
export type PixWalletType = 'CPF' | 'PHONE' | 'EMAIL' | 'CNPJ' | 'EVP';

export type FieldDefinition = {
  id: string;
  label: string;
  kind: 'text' | 'tel' | 'email' | 'number' | 'select';
  required: boolean;
  options?: readonly string[];
};

export type FiatMethodConfig = {
  id: string;
  label: string;
  brand: string;
  currencyPrefix: string;
  amountMin: number;
  amountMax: number;
  fields: readonly FieldDefinition[];
  pix?: boolean;
};

export type GeoConfig = {
  label: string;
  fiatAvailable: boolean;
  accountName: string;
  accountCode: string;
  balance: number;
  balanceDisplay: string;
  methods: readonly FiatMethodConfig[];
};

const banksMx = [
  'BANXICO',
  'BANCOMEXT',
  'BANOBRAS',
  'BANJERCITO',
  'NAFIN',
  'BANSEFI',
  'HIPOTECARIA FED',
  'BANAMEX',
] as const;

const banksRu = ['Sberbank', 'T-Bank', 'ALFA-BANK', 'Raiffeisenbank'] as const;
const banksIn = ['Airtel Payments Bank', 'Allahabad Bank', 'Andhra Bank', 'AU Small Finance Bank'] as const;

export const geoConfigs: Record<Geo, GeoConfig> = {
  mx: {
    label: 'Mexico',
    fiatAvailable: true,
    accountName: 'Peso',
    accountCode: 'MXN',
    // RESEARCH_FIXTURE: replace when the MX task balance is approved.
    balance: 50000,
    balanceDisplay: '$50,000',
    methods: [
      {
        id: 'spei_simple', label: 'SPEI', brand: 'SPEI', currencyPrefix: '$', amountMin: 50, amountMax: 50000,
        fields: [
          { id: 'accountNumber', label: 'Account number', kind: 'number', required: true },
          { id: 'firstName', label: 'First name', kind: 'text', required: true },
          { id: 'lastName', label: 'Last name', kind: 'text', required: true },
        ],
      },
      {
        id: 'spei_extended', label: 'Spei', brand: 'SPEI', currencyPrefix: '$', amountMin: 50, amountMax: 17000,
        fields: [
          { id: 'bank', label: 'Bank', kind: 'select', required: true, options: banksMx },
          { id: 'accountNumber', label: 'Account number', kind: 'number', required: true },
          { id: 'accountType', label: 'Select account type', kind: 'select', required: true, options: ['Debit', 'Phone', 'Clabe'] },
          { id: 'documentNumber', label: 'Document number', kind: 'text', required: true },
          // TODO(reference-data): document type values are absent from the supplied package.
          { id: 'documentType', label: 'Document type', kind: 'select', required: true, options: [] },
          { id: 'fullName', label: 'Full name', kind: 'text', required: true },
        ],
      },
    ],
  },
  ru: {
    label: 'Russia',
    fiatAvailable: true,
    accountName: 'Ruble',
    accountCode: 'RUB',
    // RESEARCH_FIXTURE: replace when the RU task balance is approved.
    balance: 50000,
    balanceDisplay: '₽50,000',
    methods: [
      {
        id: 'sbp', label: 'Withdrawal by phone number', brand: 'SBP', currencyPrefix: '₽', amountMin: 3000, amountMax: 40000,
        fields: [
          { id: 'phone', label: 'Phone number', kind: 'tel', required: true },
          { id: 'bank', label: 'Bank', kind: 'select', required: true, options: banksRu },
        ],
      },
      {
        id: 'card', label: 'Payment', brand: 'VISA  ●  MIR', currencyPrefix: '₽', amountMin: 2000, amountMax: 50000,
        fields: [{ id: 'cardNumber', label: 'Bank card number', kind: 'number', required: true }],
      },
    ],
  },
  in: {
    label: 'India',
    fiatAvailable: true,
    accountName: 'Rupee',
    accountCode: 'INR',
    // RESEARCH_FIXTURE: replace when the IN task balance is approved.
    balance: 50000,
    balanceDisplay: '₹50,000',
    methods: [{
      id: 'imps', label: 'IMPS', brand: 'IMPS', currencyPrefix: '₹', amountMin: 1200, amountMax: 50000,
      fields: [
        { id: 'bank', label: 'Bank', kind: 'select', required: true, options: banksIn },
        { id: 'fullName', label: 'Full name', kind: 'text', required: true },
        { id: 'ifsc', label: 'IFSC code', kind: 'text', required: true },
        { id: 'impsAccount', label: 'IMPS bank account number', kind: 'number', required: true },
      ],
    }],
  },
  ar: {
    label: 'Argentina',
    fiatAvailable: true,
    accountName: 'Peso',
    accountCode: 'ARS',
    // RESEARCH_FIXTURE: replace when the AR task balance is approved.
    balance: 1000000,
    balanceDisplay: '$1,000,000',
    methods: [{
      id: 'mercado_pago', label: 'Mercado Pago', brand: 'mercado\npago', currencyPrefix: '$', amountMin: 20000, amountMax: 1000000,
      fields: [
        { id: 'documentNumber', label: 'Document number', kind: 'text', required: true },
        { id: 'firstName', label: 'First name', kind: 'text', required: true },
        { id: 'lastName', label: 'Last name', kind: 'text', required: true },
        { id: 'bankAccount', label: 'Bank account number (CBU / CVU)', kind: 'text', required: true },
      ],
    }],
  },
  br: {
    label: 'Brazil',
    fiatAvailable: true,
    accountName: 'Real',
    accountCode: 'BRL',
    // RESEARCH_FIXTURE: replace when the BR task balance is approved.
    balance: 15000,
    balanceDisplay: 'R$15,000',
    methods: [{
      id: 'pix', label: 'Pix', brand: 'pix', currencyPrefix: 'R$', amountMin: 30, amountMax: 15000, pix: true,
      fields: [],
    }],
  },
  kr: {
    label: 'South Korea',
    fiatAvailable: false,
    accountName: 'Won',
    accountCode: 'KRW',
    balance: 0,
    balanceDisplay: '₩0',
    methods: [],
  },
};

export const cryptoConfig = {
  asset: 'USDT',
  accountName: 'Tether',
  minAmount: 5,
  networks: [
    { id: 'erc20', label: 'Ethereum (ERC-20)', eta: '≈ 10 minutes' },
    { id: 'trc20', label: 'Tron (TRC-20)', eta: '≈ 5 minutes' },
    { id: 'bep20', label: 'Binance Smart Chain (BEP-20)', eta: '≈ 5 minutes' },
  ],
  walletNetworkId: 'erc20',
  walletNetwork: 'Ethereum (ERC-20)',
  walletAddress: '293iq23dh03701209291ySOHUd12RVE29',
} as const;

export const pixWalletTypes: readonly PixWalletType[] = ['CPF', 'PHONE', 'EMAIL', 'CNPJ', 'EVP'];

export const pixCommonFields: readonly FieldDefinition[] = [
  { id: 'name', label: 'Name', kind: 'text', required: true },
  { id: 'lastName', label: 'Last name', kind: 'text', required: true },
  { id: 'cpf', label: 'Enter your CPF number', kind: 'number', required: true },
];

export const pixConditionalFields: Partial<Record<PixWalletType, FieldDefinition>> = {
  PHONE: { id: 'phone', label: 'Phone number', kind: 'tel', required: true },
  EMAIL: { id: 'email', label: 'Email', kind: 'email', required: true },
  CNPJ: { id: 'cnpj', label: 'Enter your CNPJ number', kind: 'number', required: true },
  EVP: { id: 'evp', label: 'EVP', kind: 'text', required: true },
};

export type ResearchConfig = {
  scenario: Scenario;
  geo: Geo;
  geoConfig: GeoConfig;
  debug: boolean;
  cryptoBalance: number;
  wagerUi: WagerUi;
  wager: {
    active: boolean;
    // RESEARCH_FIXTURE: independent of deposit/withdrawal values; replace for the session script.
    remainingText: string;
    progressPercent: number;
    bitcoin: {
      balance: string;
      secondaryBalance: string;
      amount: string;
      amountMin: string;
      amountMax: string;
      remainingText: string;
    };
  };
};

const isOneOf = <T extends string>(value: string | null, values: readonly T[]): value is T =>
  Boolean(value && values.includes(value as T));

export function resolveResearchConfig(params: URLSearchParams): ResearchConfig {
  const scenarioValue = params.get('scenario');
  const scenario: Scenario = isOneOf(scenarioValue, ['crypto', 'fiat', 'wager']) ? scenarioValue : 'crypto';
  const geoValue = params.get('geo');
  const geo: Geo = isOneOf(geoValue, ['mx', 'ru', 'in', 'ar', 'br', 'kr']) ? geoValue : 'ru';
  const wagerValue = params.get('wagerUi');
  const wagerUi: WagerUi = isOneOf(wagerValue, ['inline', 'snackbar', 'modal']) ? wagerValue : 'modal';

  return {
    scenario,
    geo,
    geoConfig: geoConfigs[geo],
    debug: params.get('debug') === '1',
    cryptoBalance: scenario === 'wager' ? 40 : 50,
    wagerUi,
    wager: {
      active: scenario === 'wager',
      remainingText: '0.005359 / 0.003132 BTC',
      progressPercent: 58,
      // RESEARCH_FIXTURE: values are transcribed from 13/14/15 wager references.
      bitcoin: {
        balance: '0.003132',
        secondaryBalance: '188.24 USD',
        amount: '0.000078',
        amountMin: '0.000078 BTC',
        amountMax: '2.33 USDT',
        remainingText: '0.005359 / 0.003132 BTC',
      },
    },
  };
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 8 }).format(value);
}
