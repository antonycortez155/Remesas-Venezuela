export const countries = {
  VE: {
    code: 'VE',
    name: 'Venezuela',
    flag: '🇻🇪',
    currency: 'VES',
    paymentMethods: [
      { id: 'bank_transfer', name: 'Transferencia Bancaria', icon: '🏦' },
      { id: 'mobile_payment', name: 'Pago Móvil', icon: '📱' },
      { id: 'cash_pickup', name: 'Retiro en Efectivo', icon: '💵' }
    ]
  },
  CO: {
    code: 'CO',
    name: 'Colombia',
    flag: '🇨🇴',
    currency: 'COP',
    paymentMethods: [
      { id: 'bank_transfer', name: 'Transferencia Bancaria', icon: '🏦' },
      { id: 'nequi', name: 'Nequi', icon: '💳' },
      { id: 'daviplata', name: 'Daviplata', icon: '📱' },
      { id: 'cash_pickup', name: 'Retiro en Efectivo', icon: '💵' }
    ]
  },
  PE: {
    code: 'PE',
    name: 'Perú',
    flag: '🇵🇪',
    currency: 'PEN',
    paymentMethods: [
      { id: 'bank_transfer', name: 'Transferencia Bancaria', icon: '🏦' },
      { id: 'yape', name: 'Yape', icon: '📱' },
      { id: 'plin', name: 'Plin', icon: '💳' },
      { id: 'cash_pickup', name: 'Retiro en Efectivo', icon: '💵' }
    ]
  },
  EC: {
    code: 'EC',
    name: 'Ecuador',
    flag: '🇪🇨',
    currency: 'USD',
    paymentMethods: [
      { id: 'bank_transfer', name: 'Transferencia Bancaria', icon: '🏦' },
      { id: 'cash_pickup', name: 'Retiro en Efectivo', icon: '💵' }
    ]
  },
  US: {
    code: 'US',
    name: 'Estados Unidos',
    flag: '🇺🇸',
    currency: 'USD',
    paymentMethods: [
      { id: 'bank_transfer', name: 'Transferencia Bancaria', icon: '🏦' },
      { id: 'zelle', name: 'Zelle', icon: '💳' },
      { id: 'cash_pickup', name: 'Retiro en Efectivo', icon: '💵' }
    ]
  },
  PA: {
    code: 'PA',
    name: 'Panamá',
    flag: '🇵🇦',
    currency: 'USD',
    paymentMethods: [
      { id: 'bank_transfer', name: 'Transferencia Bancaria', icon: '🏦' },
      { id: 'yappy', name: 'Yappy', icon: '📱' },
      { id: 'cash_pickup', name: 'Retiro en Efectivo', icon: '💵' }
    ]
  }
};

export const exchangeRates = {
  'US-VE': 50.25,
  'US-CO': 4250.00,
  'US-PE': 3.75,
  'US-EC': 1.00,
  'US-PA': 1.00,
  'PA-VE': 50.25,
  'PA-CO': 4250.00,
  'PA-PE': 3.75,
  'PA-EC': 1.00,
  'VE-US': 0.0199,
  'VE-CO': 84.58,
  'VE-PE': 0.0747,
  'VE-EC': 0.0199,
  'VE-PA': 0.0199,
  'CO-US': 0.000235,
  'CO-VE': 0.0118,
  'CO-PE': 0.000883,
  'CO-EC': 0.000235,
  'CO-PA': 0.000235,
  'PE-US': 0.267,
  'PE-VE': 13.40,
  'PE-CO': 1133.33,
  'PE-EC': 0.267,
  'PE-PA': 0.267,
  'EC-US': 1.00,
  'EC-VE': 50.25,
  'EC-CO': 4250.00,
  'EC-PE': 3.75,
  'EC-PA': 1.00
};

export const paymentInstructions = {
  bank_transfer: {
    title: 'Transferencia Bancaria',
    instructions: [
      'Realiza la transferencia a la siguiente cuenta:',
      'Banco: Banco Nacional',
      'Cuenta: 0123-4567-8901-2345',
      'Titular: Cambios A&V C.A.',
      'Cédula/RIF: J-12345678-9'
    ]
  },
  zelle: {
    title: 'Zelle',
    instructions: [
      'Envía el pago por Zelle a:',
      'Email: pagos@cambiosav.com',
      'Teléfono: +1 (555) 123-4567',
      'Nombre: Cambios A&V LLC'
    ]
  },
  yappy: {
    title: 'Yappy',
    instructions: [
      'Envía el pago por Yappy a:',
      'Teléfono: +507 6123-4567',
      'Nombre: Cambios A&V S.A.'
    ]
  },
  mobile_payment: {
    title: 'Pago Móvil',
    instructions: [
      'Realiza el pago móvil a:',
      'Banco: 0102 - Banco de Venezuela',
      'Teléfono: 0412-1234567',
      'Cédula: V-12345678'
    ]
  },
  nequi: {
    title: 'Nequi',
    instructions: [
      'Envía el dinero por Nequi a:',
      'Teléfono: +57 300 123 4567',
      'Nombre: Cambios A&V Colombia'
    ]
  },
  daviplata: {
    title: 'Daviplata',
    instructions: [
      'Envía el dinero por Daviplata a:',
      'Teléfono: +57 301 234 5678',
      'Nombre: Cambios A&V Colombia'
    ]
  },
  yape: {
    title: 'Yape',
    instructions: [
      'Envía el dinero por Yape a:',
      'Teléfono: +51 987 654 321',
      'Nombre: Cambios A&V Perú'
    ]
  },
  plin: {
    title: 'Plin',
    instructions: [
      'Envía el dinero por Plin a:',
      'Teléfono: +51 987 654 322',
      'Nombre: Cambios A&V Perú'
    ]
  }
};