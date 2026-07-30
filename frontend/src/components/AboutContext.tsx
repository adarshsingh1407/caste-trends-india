import { createContext, useContext, useState, ReactNode } from "react";
import { AboutPanel } from "./AboutPanel";

const AboutContext = createContext<() => void>(() => {});

export function useOpenAbout() {
  return useContext(AboutContext);
}

export function AboutProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <AboutContext.Provider value={() => setOpen(true)}>
      {children}
      {open && <AboutPanel onClose={() => setOpen(false)} />}
    </AboutContext.Provider>
  );
}
