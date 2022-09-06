// NOTE : semua handling set token bisa pake ini untuk kedepannya

export const setTokenToLocalStorage = (token: string | null, name: string) => {
    if (!token) return;
    const IS_SERVER = typeof window === "undefined";
    if (!IS_SERVER) {
      if (token) {
        localStorage.setItem(name, token);
      } else {
        localStorage.removeItem(name);
      }
    }
};