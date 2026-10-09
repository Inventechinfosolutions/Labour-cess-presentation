import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DESIGNS } from "@/lib/design";
import { asset } from "@/lib/utils";

type Visibility = { hidden: string[]; admin: boolean; ready: boolean };

const VisibilityContext = createContext<Visibility>({ hidden: [], admin: false, ready: false });

// The demo Worker answers visibility.json; without it (local dev) every design is shown.
export function VisibilityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Visibility>({ hidden: [], admin: false, ready: false });
  useEffect(() => {
    fetch(asset("visibility.json"), { cache: "no-store" })
      .then((r) => (r.ok && r.headers.get("content-type")?.includes("json") ? r.json() : null))
      .then((data) =>
        setState({
          hidden: Array.isArray(data?.hidden) ? data.hidden.filter((p: unknown) => typeof p === "string") : [],
          admin: data?.admin === true,
          ready: true,
        }),
      )
      .catch(() => setState((s) => ({ ...s, ready: true })));
  }, []);
  return <VisibilityContext.Provider value={state}>{children}</VisibilityContext.Provider>;
}

export function useVisibility() {
  const { hidden, admin, ready } = useContext(VisibilityContext);
  const isHidden = (id: string) => hidden.includes(id);
  return {
    ready,
    admin,
    isHidden,
    designs: DESIGNS.map((d, i) => ({ ...d, number: i + 1 })).filter((d) => admin || !isHidden(d.id)),
  };
}
