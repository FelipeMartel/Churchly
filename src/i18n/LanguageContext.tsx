import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { translations, type Language } from './translations';

const STORAGE_KEY = 'churchly.language';

function getDeviceLanguage(): Language {
  const locale = Localization.getLocales()[0]?.languageCode;
  return locale === 'es' ? 'es' : 'en';
}

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (typeof translations)['es'];
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<Language>(getDeviceLanguage());

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'es' || stored === 'en') {
        setLanguageState(stored);
      }
    });
  }, []);

  function setLanguage(next: Language) {
    setLanguageState(next);
    AsyncStorage.setItem(STORAGE_KEY, next);
  }

  const value = useMemo(
    () => ({ language, setLanguage, t: translations[language] }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
