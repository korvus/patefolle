import React, { useState, createContext, useContext } from 'react';

import { languageOptions, dictionaryList } from '../languages';

// create the language context with default selected language
export const LanguageContext = createContext({
  userLanguage: 'en',
  dictionary: dictionaryList.en
});

// it provides the language context to app
export function LanguageProvider({ children }) {
    const [userLanguage, setUserLanguage] = useState('en');

    const provider = {
      userLanguage,
      dictionary: dictionaryList[userLanguage],
      userLanguageChange: selected => {
        const newLanguage = languageOptions[selected] ? selected : 'en'
        setUserLanguage(newLanguage);
        window.localStorage.setItem('patefolle-lang', newLanguage);
      }
    };

  return (
    <LanguageContext.Provider value={provider}>
      {children}
    </LanguageContext.Provider>
  );
};

// get text according to id & current language
export function Text({ tid }) {
  const languageContext = useContext(LanguageContext);
  let str = languageContext.dictionary[tid] ? languageContext.dictionary[tid] : "";
  return str;
};

export function FuncText(tid) {
  const lang = getCurrentLanguage();
  let str = dictionaryList[lang][tid] ? dictionaryList[lang][tid] : "";
  return str;
};

export function getCurrentLanguage () {
    let defaultLanguage = window.localStorage.getItem('patefolle-lang');
    if (!defaultLanguage) {
      defaultLanguage = window.navigator.language.substring(0, 2);
    }
    return defaultLanguage;
}