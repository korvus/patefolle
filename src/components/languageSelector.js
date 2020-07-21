import React, { useContext, useEffect } from 'react';
import styles from '../styles/lang.module.css';

import { languageOptions } from '../languages';
import { LanguageContext, getCurrentLanguage } from '../containers/language';

export default function LanguageSelector() {
  const { userLanguage, userLanguageChange } = useContext(LanguageContext);

  // set selected language by calling context method
  const handleLanguageChange = e => {
    userLanguageChange(e.target.getAttribute("value"))
  };

  useEffect(() => {
    const defaultLanguage = getCurrentLanguage()
    userLanguageChange(defaultLanguage);
  }, [userLanguageChange]);

  return (
    <div className={styles.wrapper}>
      {Object.entries(languageOptions).map(([id, name]) => (
        <span className={`${userLanguage === id ? `${styles.current}` : ""}`} onClick={e => handleLanguageChange(e)} key={id} value={id}>{name}</span>
      ))}
    </div>
  );
};