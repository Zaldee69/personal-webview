import i18n from "i18";

const { t }: any = i18n;

export const inputValidator = {
  nikValidator: (nik: string) => {
    const nikLength = nik.length;
    if (
      nik[0] === "0" ||
      (nik[nikLength - 1] === "0" &&
        nik[nikLength - 2] === "0" &&
        nik[nikLength - 3] === "0" &&
        nik[nikLength - 4] === "0")
    ) {
      return t("manualForm.nik.errorMessage2");
    } else if (nikLength < 1) {
      return t("manualForm.nik.errorMessage1");
    } else if (nikLength > 16 || nikLength < 16) {
      return t("manualForm.nik.errorMessage3");
    } else {
      return "";
    }
  },
  requiredInput: (value: string, message: string) => {
    if (value.length < 1) {
      return message;
    } else {
      return "";
    }
  },
};
