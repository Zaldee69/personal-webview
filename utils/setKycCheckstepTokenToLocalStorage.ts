export const setKycCheckstepTokenToLocalStorage = (token: string | null) => {
  if (!token) return;
  const IS_SERVER = typeof window === "undefined";
  if (!IS_SERVER) {
    if (token) {
      localStorage.setItem("kyc_checkstep_token", token);
    } else {
      localStorage.removeItem("kyc_checkstep_token");
    }
  }
};
