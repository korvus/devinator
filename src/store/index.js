import React, { useState, createContext } from "react";

export const penduContext = createContext(null);

export const PenduContextProvider = props => {
  const existing = localStorage.getItem("pendable-place");
  let them = existing ? existing : "";

  const [thematic, setThematic] = useState(them);
  const [lang, setLang] = useState("fr")

  const provider = {
      thematic,
      setThematic,
      lang,
      setLang
  };

  return (
    <penduContext.Provider value={provider}>
      {props.children}
    </penduContext.Provider>
  );
};
