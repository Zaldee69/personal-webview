import i18n from "i18";

export const actionText = (text: String) => {
    const {t}: any = i18n
    let action = {
        "look_straight": t("lookStraight"),
        "look_up": "Wajah menghadap ke atas",
        "look_down": "Wajah menghadap ke bawah",
        "look_left": "Wajah menghadap ke kiri",
        "look_right": "Wajah menghadap ke kanan",
        "mouth_open": t("openMouth"),
        "blink": t("blink")
    }
    return action[text as keyof typeof action] || ""
  }