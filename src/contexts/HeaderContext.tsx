import { createContext, useContext, useState, type ReactNode } from "react";

type HeaderVariant = "primary" | "light";

type HeaderContextType = {
  variant: HeaderVariant;
  setVariant: (variant: HeaderVariant) => void;
};

const HeaderContext = createContext<HeaderContextType | null>(null);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [variant, setVariant] = useState<HeaderVariant>("primary");

  return (
    <HeaderContext.Provider value={{ variant, setVariant }}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error("useHeader must be used within a HeaderProvider");
  }
  return context;
}
