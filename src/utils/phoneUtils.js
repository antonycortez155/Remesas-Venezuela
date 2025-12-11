import { countries } from '../data/countries';

export const getCountryCodeFromPhone = (phoneNumber) => {
  // Ordenar los países por la longitud del código telefónico de forma descendente
  // para asegurar que los códigos más largos (más específicos) se prueben primero.
  const sortedCountries = countries.sort((a, b) => {
    const phoneCodeA = getPhoneCode(a.code);
    const phoneCodeB = getPhoneCode(b.code);
    return (phoneCodeB ? phoneCodeB.length : 0) - (phoneCodeA ? phoneCodeA.length : 0);
  });

  for (const country of sortedCountries) {
    const phoneCode = getPhoneCode(country.code);
    if (phoneCode && phoneNumber.startsWith(phoneCode)) {
      return country.code;
    }
  }
  return null; // Si no se encuentra ningún país
};

// Función auxiliar para obtener el código telefónico de un país
// Esto es una simulación, en un caso real usarías una librería o una lista más completa
const getPhoneCode = (countryCode) => {
  switch (countryCode) {
    case 'VE': return '+58';
    case 'CO': return '+57';
    case 'PE': return '+51';
    case 'EC': return '+593';
    case 'US': return '+1';
    default: return null;
  }
};