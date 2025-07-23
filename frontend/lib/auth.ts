// Utility functions for handling cookies and localStorage

// Helper function to get token from cookies
export const getTokenFromCookies = (): string | null => {
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'token') {
        return decodeURIComponent(value);
      }
    }
  }
  return null;
};

// Helper function to get any value from cookies
export const getCookieValue = (cookieName: string): string | null => {
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === cookieName) {
        return decodeURIComponent(value);
      }
    }
  }
  return null;
};

// Helper function to set a cookie
export const setCookie = (name: string, value: string, days: number = 7): void => {
  if (typeof document !== 'undefined') {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
  }
};

// Helper function to remove a cookie
export const removeCookie = (name: string): void => {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
};

// Helper function to get profileId from localStorage (keeping this for backward compatibility)
export const getProfileId = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('profileId');
  }
  return null;
};

// Helper function to get any localStorage value
export const getFromLocalStorage = (key: string): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};
