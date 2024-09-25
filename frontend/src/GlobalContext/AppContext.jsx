import React, { createContext, useContext, useState } from "react";

const AppContext = createContext();

const AppFieldsProvider = ({ children }) => {
  // Initialize states with default values (0) for safety
  const [bodyTemperature, setBodyTemp] = useState(0);
  const [spo2, setSpo2] = useState(0);
  const [fallDetected, setFallDetected] = useState(0);
  const [ecgLevels, setEcgLevels] = useState(0);

  return (
    <AppContext.Provider
      value={{
        bodyTemperature,
        setBodyTemp,
        spo2,
        setSpo2,
        fallDetected,
        setFallDetected,
        ecgLevels,
        setEcgLevels,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  return useContext(AppContext);
};

export default AppFieldsProvider;
