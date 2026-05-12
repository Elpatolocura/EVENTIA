import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768;

let cachedIsMobile: boolean | undefined = undefined;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (cachedIsMobile !== undefined) return cachedIsMobile;
    if (typeof window !== 'undefined') {
      cachedIsMobile = window.innerWidth < MOBILE_BREAKPOINT;
      return cachedIsMobile;
    }
    return false;
  });

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      cachedIsMobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(cachedIsMobile);
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
