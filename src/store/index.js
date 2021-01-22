import React, { useState, createContext } from "react";
import { useThematic } from "../store/thematic";

export const penduContext = createContext(null);

export const PenduContextProvider = (props) => {
  const [lang, setLang] = useState("fr");
  const { thematic, updateThematic } = useThematic();

  const provider = {
    thematic,
    setThematic: updateThematic,
    lang,
    setLang
  };

  return (
    <penduContext.Provider value={provider}>
      {props.children}
    </penduContext.Provider>
  );
};
