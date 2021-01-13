import React, { useState, useCallback, useContext } from "react";

const LOCAL_STORAGE_KEY = "pendable-place";

const ThematicContext = React.createContext("");

export function ThematicProvider({ children }) {
  const [thematic, setThematic] = useState(
    localStorage.getItem(LOCAL_STORAGE_KEY)
  );

  const updateThematic = useCallback((value) => {
    if (value === undefined) {
      throw new Error("updateThematic: the value is undefined");
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, value);
    setThematic(value);
  }, []);

  return (
    <ThematicContext.Provider value={{ thematic, updateThematic }}>
      {children}
    </ThematicContext.Provider>
  );
}

export function useThematic() {
  return useContext(ThematicContext);
}
