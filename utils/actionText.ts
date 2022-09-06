export const actionText = (text: String) => {
    let action = {
        "look_straight": "Wajah menghadap ke depan",
        "look_up": "Wajah menghadap ke atas",
        "look_down": "Wajah menghadap ke bawah",
        "look_left": "Wajah menghadap ke kiri",
        "look_right": "Wajah menghadap ke kanan",
        "mouth_open": "Buka mulut dengan lebar",
        "blink": "Pejamkan kedua mata selama 3 detik"
    }
    return action[text as keyof typeof action] || ""
  }