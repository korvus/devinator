import React, { useState, useCallback, useContext } from "react";

const LOCAL_STORAGE_KEY = "devinator-thematic";
export const LOCAL_STORAGE_KEY_PROGRESS = "devinator-progress";

const ThematicContext = React.createContext("");

const initProgress = async (thematic, existing) => {
  const allWords = await import(`../data/${thematic}.json`);

  const words = Object.entries(allWords);
  const emptyArray = Array(words.length - 1).fill(false);

  let initialisationLocalStorage;
  if(existing !== null){
    const objExistant = JSON.parse(existing);
    const KeyObjExistant = Object.keys(objExistant);
    const ValueObjExistant = Object.values(objExistant);
    const nbExistantThematic = KeyObjExistant.length;
    const obj = {[thematic]: emptyArray};
    for(let a=0; a<nbExistantThematic; a++){
      obj[KeyObjExistant[a]] = ValueObjExistant[a];
    }
    initialisationLocalStorage = JSON.stringify(obj);
  } else {
    initialisationLocalStorage = JSON.stringify({[thematic]: emptyArray});
  }

  localStorage.setItem(LOCAL_STORAGE_KEY_PROGRESS, initialisationLocalStorage);
  return initialisationLocalStorage;
};

const reinitThematicProgress = (thematic, total) => {
  const emptyArray = Array(total).fill(false);
  const currentProgress = localStorage.getItem(LOCAL_STORAGE_KEY_PROGRESS);
  const existing = JSON.parse(currentProgress);
  existing[thematic] = emptyArray;
  const formattedExisting = JSON.stringify(existing);
  localStorage.setItem(LOCAL_STORAGE_KEY_PROGRESS, formattedExisting);
  return formattedExisting;
}


export function ThematicProvider({ children }) {
  const defaultThematic = localStorage.getItem(LOCAL_STORAGE_KEY) ? localStorage.getItem(LOCAL_STORAGE_KEY) : "home";
  const currentProgress = localStorage.getItem(LOCAL_STORAGE_KEY_PROGRESS) ? localStorage.getItem(LOCAL_STORAGE_KEY_PROGRESS) : {};
  const [thematic, setThematic] = useState(defaultThematic);
  const [progress, setProgress] = useState(currentProgress);

  const updateThematic = useCallback((value) => {
    if (value === undefined) {
      throw new Error("updateThematic: the value is undefined");
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, value);
    // ** Pose problème
    setThematic(value);

  }, []);

  // Initialise le json des progressions en checkant si la progression pour la thématique donnée existe ou pas.
  const updateThematicProgress = useCallback((thematic) => {
    if (thematic === undefined) {
      throw new Error("updateThematicProgress: the value is undefined");
    }
    const currentProgress = localStorage.getItem(LOCAL_STORAGE_KEY_PROGRESS);
    // Si le cookie n'existe mm pas
    if(currentProgress === null){
      const toStore = initProgress(thematic, null);
      setProgress(toStore);
    // Si il existe, on va checker si la thématique existe
    } else {
      const existantThematic = JSON.parse(currentProgress)[thematic];
      if(!existantThematic){
        const toStore = initProgress(thematic, currentProgress);
        setProgress(toStore);
      } else {
        setProgress(currentProgress);
      }
    }
  }, []);

  const fullfillProgress = useCallback((index, theme) => {
    setProgress((stored) => {
      const objStored = JSON.parse(stored);
      objStored[theme][index] = true;
      const toStore = JSON.stringify(objStored);
      localStorage.setItem(LOCAL_STORAGE_KEY_PROGRESS, toStore);
      return toStore
    });
  }, []);

  return (
    <ThematicContext.Provider value={{ thematic, updateThematic, progress, fullfillProgress, updateThematicProgress, reinitThematicProgress }}>
      {children}
    </ThematicContext.Provider>
  );
}

export function useThematic() {
  return useContext(ThematicContext);
}