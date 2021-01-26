import React, { useState, createContext, useContext } from "react";
import { useThematic } from "../store/thematic";
import { languageOptions, dictionaryList } from './languages.js'; 

export const penduContext = createContext(null);

export function getCurrentLanguage () {
  let defaultLanguage = window.localStorage.getItem('lependable-lang');
  if (!defaultLanguage) {
    defaultLanguage = window.navigator.language.substring(0, 2);
  }
  return defaultLanguage;
}

export const PenduContextProvider = (props) => {
  const [lang, setLang] = useState("fr");
  const { thematic, updateThematic } = useThematic();
  const [ userLanguage, setUserLanguage ] = useState('fr');

  const provider = {
    thematic,
    setThematic: updateThematic,
    lang,
    setLang,
    userLanguage,
    dictionary: dictionaryList[userLanguage],
    userLanguageChange: selected => {
      const newLanguage = languageOptions[selected] ? selected : 'fr'
      setUserLanguage(newLanguage);
      window.localStorage.setItem('lependable-lang', newLanguage);
    }
  };

  return (
    <penduContext.Provider value={provider}>
      {props.children}
    </penduContext.Provider>
  );
};

export function Text({ tid }) {
  const languageContext = useContext(penduContext);
  let str = languageContext.dictionary[tid] ? languageContext.dictionary[tid] : "";
  return str;
};