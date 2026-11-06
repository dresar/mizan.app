
export interface Bank {
  code: string;
  name: string;
  logo: string;
}

export const INDONESIAN_BANKS: Bank[] = [
  { 
    code: 'BCA', 
    name: 'Bank Central Asia', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg' 
  },
  { 
    code: 'BNI', 
    name: 'Bank Negara Indonesia', 
    logo: 'https://upload.wikimedia.org/wikipedia/id/5/55/BNI_logo.svg' 
  },
  { 
    code: 'BRI', 
    name: 'Bank Rakyat Indonesia', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/6/68/BANK_BRI_logo.svg' 
  },
  { 
    code: 'MANDIRI', 
    name: 'Bank Mandiri', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg' 
  },
  { 
    code: 'BSI', 
    name: 'Bank Syariah Indonesia', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Bank_Syariah_Indonesia.svg' 
  },
  { 
    code: 'BTN', 
    name: 'Bank Tabungan Negara', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/BTN_2019_logo.svg' 
  },
  { 
    code: 'CIMB', 
    name: 'CIMB Niaga', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Bank_CIMB_Niaga_logo.svg' 
  },
  { 
    code: 'DANAMON', 
    name: 'Bank Danamon', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Logo_Bank_Danamon.svg' 
  },
  { 
    code: 'PERMATA', 
    name: 'Bank Permata', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Permata_Bank_Logo.svg' 
  },
  { 
    code: 'MAYBANK', 
    name: 'Maybank Indonesia', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/6/62/Maybank_logo.svg' 
  },
  { 
    code: 'PANIN', 
    name: 'Panin Bank', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Logo_Panin_Bank.svg' 
  },
  { 
    code: 'MEGA', 
    name: 'Bank Mega', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Bank_Mega_2013.svg' 
  },
  { 
    code: 'JAGO', 
    name: 'Bank Jago', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Logo_Bank_Jago_2020.svg' 
  },
  { 
    code: 'JENIUS', 
    name: 'Jenius (BTPN)', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Jenius_logo.svg' 
  },
  { 
    code: 'MUAMALAT', 
    name: 'Bank Muamalat', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Logo_Bank_Muamalat_Indonesia.svg' 
  }
];

export const getBankLogo = (bankCode: string): string => {
  const bank = INDONESIAN_BANKS.find(b => b.code === bankCode || b.name === bankCode);
  return bank?.logo || '';
};
