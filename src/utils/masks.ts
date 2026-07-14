// Utility masks for fields in REDCap Form

export function maskCEP(value: string): string {
  const cleanValue = value.replace(/\D/g, '');
  if (cleanValue.length <= 5) {
    return cleanValue;
  }
  return `${cleanValue.substring(0, 5)}-${cleanValue.substring(5, 8)}`;
}

export function maskCNPJ(value: string): string {
  const cleanValue = value.replace(/\D/g, '');
  if (cleanValue.length <= 2) return cleanValue;
  if (cleanValue.length <= 5) return `${cleanValue.substring(0, 2)}.${cleanValue.substring(2)}`;
  if (cleanValue.length <= 8) return `${cleanValue.substring(0, 2)}.${cleanValue.substring(2, 5)}.${cleanValue.substring(5)}`;
  if (cleanValue.length <= 12) return `${cleanValue.substring(0, 2)}.${cleanValue.substring(2, 5)}.${cleanValue.substring(5, 8)}/${cleanValue.substring(8)}`;
  return `${cleanValue.substring(0, 2)}.${cleanValue.substring(2, 5)}.${cleanValue.substring(5, 8)}/${cleanValue.substring(8, 12)}-${cleanValue.substring(12, 14)}`;
}

export function maskPhone(value: string): string {
  const cleanValue = value.replace(/\D/g, '');
  if (cleanValue.length <= 2) {
    return cleanValue.length > 0 ? `(${cleanValue}` : '';
  }
  if (cleanValue.length <= 6) {
    return `(${cleanValue.substring(0, 2)}) ${cleanValue.substring(2)}`;
  }
  if (cleanValue.length <= 10) {
    return `(${cleanValue.substring(0, 2)}) ${cleanValue.substring(2, 6)}-${cleanValue.substring(6)}`;
  }
  return `(${cleanValue.substring(0, 2)}) ${cleanValue.substring(2, 7)}-${cleanValue.substring(7, 11)}`;
}

export function unmaskValue(value: string): string {
  return value.replace(/\D/g, '');
}

export function validateCNPJ(cnpj: string): boolean {
  const clean = cnpj.replace(/\D/g, '');
  if (clean.length !== 14) return false;
  
  // Reject simple repetitive sequences
  if (/^(\y)\1+$/.test(clean)) return false;
  
  // Basic validation calculation
  let tamanho = clean.length - 2;
  let numeros = clean.substring(0, tamanho);
  const digitos = clean.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;
  
  tamanho = tamanho + 1;
  numeros = clean.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) return false;
  
  return true;
}

export function validateCEP(cep: string): boolean {
  const clean = cep.replace(/\D/g, '');
  return clean.length === 8;
}

export function validatePhone(phone: string): boolean {
  const clean = phone.replace(/\D/g, '');
  return clean.length === 10 || clean.length === 11;
}

export function validateEmail(email: string): boolean {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
}
