export const setPersonalChangePasswordTokenToLocalStorage = (
  token: string | null
) => {
  if (!token) return;
  const IS_SERVER = typeof window === "undefined";
  if (!IS_SERVER) {
    if (token) {
      localStorage.setItem("personal_change_password_token", token);
    } else {
      localStorage.removeItem("personal_change_password_token");
    }
  }
};
