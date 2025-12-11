export const countries = [
  {
    code: 'VE',
    name: 'Venezuela',
    flag: '🇻🇪',
    currency: 'VES',
    paymentMethods: ['Transferencia Bancaria', 'Pago Móvil', 'Efectivo']
  },
  {
    code: 'CO',
    name: 'Colombia',
    flag: '🇨🇴',
    currency: 'COP',
    paymentMethods: ['Nequi', 'Daviplata', 'Bancolombia', 'Efectivo']
  },
  {
    code: 'PE',
    name: 'Perú',
    flag: '🇵🇪',
    currency: 'PEN',
    paymentMethods: ['Yape', 'Plin', 'BCP', 'Interbank']
  },
  {
    code: 'EC',
    name: 'Ecuador',
    flag: '🇪🇨',
    currency: 'USD',
    paymentMethods: ['Transferencia Bancaria', 'Efectivo']
  },
  {
    code: 'US',
    name: 'Estados Unidos',
    flag: '🇺🇸',
    currency: 'USD',
    paymentMethods: ['Zelle', 'Wire Transfer', 'Cash App']
  }
];

export const exchangeRates = {
  'VE-CO': 0.00008,
  'VE-PE': 0.00009,
  'VE-EC': 0.000027,
  'VE-US': 0.000027,
  'CO-VE': 20,
  'CO-PE': 0.85,
  'CO-EC': 0.00024,
  'CO-US': 0.00024,
  'PE-VE': 11800,
  'PE-CO': 1.18,
  'PE-EC': 0.00028,
  'PE-US': 0.00028,
  'EC-VE': 37000,
  'EC-CO': 4200,
  'EC-PE': 3.57,
  'EC-US': 1,
  'US-VE': 37000,
  'US-CO': 4200,
  'US-PE': 3.57,
  'US-EC': 1
};