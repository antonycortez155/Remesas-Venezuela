import React, { createContext, useContext, useState } from 'react';

const ShippingFlowContext = createContext();

export const ShippingFlowProvider = ({ children }) => {
  const [step, setStep] = useState(1); // ejemplo de estado
  const [data, setData] = useState({}); // ejemplo de datos del flujo

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <ShippingFlowContext.Provider value={{ step, data, setData, nextStep, prevStep }}>
      {children}
    </ShippingFlowContext.Provider>
  );
};

export const useShippingFlow = () => {
  const context = useContext(ShippingFlowContext);
  if (!context) throw new Error("useShippingFlow debe usarse dentro de ShippingFlowProvider");
  return context;
};