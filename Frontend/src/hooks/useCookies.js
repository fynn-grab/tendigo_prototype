// src/hooks/useCookies.js
import Cookies from 'js-cookie';

const COOKIE_PREFIX = 'procuma_';

export function useProcumaCookies() {
  const getCookie = (name) => {
    const value = Cookies.get(COOKIE_PREFIX + name);
    try {
      return value ? JSON.parse(value) : null;
    } catch (e) {
      return value; // Return as string if not JSON
    }
  };

  const setCookie = (name, value, options = { expires: 7 }) => { // Default: 7 days
    Cookies.set(COOKIE_PREFIX + name, JSON.stringify(value), options);
  };

  const removeCookie = (name) => {
    Cookies.remove(COOKIE_PREFIX + name);
  };

  return { getCookie, setCookie, removeCookie };
}