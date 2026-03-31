import { createContext, useContext, useState, type ReactNode, type ColorValue } from "react";

type HeaderContextType = {
  backgroundColor: ColorValue | undefined;
  setBackgroundColor: (color: ColorValue | undefined) => void;
};

const HeaderContext = createContext<HeaderContextType | null>(null);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [backgroundColor, setBackgroundColor] = useState<ColorValue | undefined>("#336B57");

  return (
    <HeaderContext.Provider value={{ backgroundColor, setBackgroundColor }}>
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
