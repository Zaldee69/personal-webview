export const onSubmitValidator = {
  nikValidator: (nik: string) => {
    const nikLength = nik.length;
    if (
      nik[0] === "0" ||
      (nik[nikLength - 1] === "0" &&
        nik[nikLength - 2] === "0" &&
        nik[nikLength - 3] === "0" &&
        nik[nikLength - 4] === "0")
    ) {
      return "Format NIK tidak sesuai";
    } else if(nik.length < 1){
      return "NIK wajib diisi";
    } else if(!/^[0-9]*$/.test(nik)){
      return "NIK Harus berupa angka";
    } else {
      return "";
    }
  },
  requiredInput: (value: string, prefix: string, suffix: string) => {
    if (value.length < 1) {
      return prefix + " wajib " + suffix;
    } else {
      return "";
    }
  },
};
