import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type RouterCtx = {
  path: string;
  navigate: (path: string) => void;
};

const Ctx = createContext<RouterCtx>({ path: '/', navigate: () => {} });

function parsePath() {
  const h = window.location.hash || '#/';
  return h.replace(/^#/, '') || '/';
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState<string>(parsePath());

  useEffect(() => {
    const onHash = () => setPath(parsePath());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (to: string) => {
    window.location.hash = to;
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  return <Ctx.Provider value={{ path, navigate }}>{children}</Ctx.Provider>;
}

export function useRouter() {
  return useContext(Ctx);
}

export function Link(props: React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) {
  const { to, children, onClick, ...rest } = props;
  const { navigate } = useRouter();
  return (
    <a
      href={`#${to}`}
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick(e);
        navigate(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

export function match(pattern: string, path: string): Record<string, string> | null {
  const ps = pattern.split('/').filter(Boolean);
  const cs = path.split('/').filter(Boolean);
  if (ps.length !== cs.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < ps.length; i++) {
    if (ps[i].startsWith(':')) {
      params[ps[i].slice(1)] = decodeURIComponent(cs[i]);
    } else if (ps[i] !== cs[i]) {
      return null;
    }
  }
  return params;
}
