const dom: {
  log: HTMLDivElement | undefined;
  status: HTMLDivElement | undefined;
  perf: HTMLDivElement | undefined;
} = { log: undefined, status: undefined, perf: undefined };

export const log = (...msg: any) => {
  if (typeof document !== "undefined") {
    const track: any = document.querySelector(".track");
    if (!dom.log) dom.log = document.getElementById("log") as HTMLDivElement;
    dom.log.innerText = msg[0];
    dom.log.style.color = "rgba(107, 119, 140, 1)";
    track.style.stroke = "#fff";
    if (
      msg[0] === "Dekatkan wajah Anda" ||
      msg[0] === "Move your face closer" ||
      msg[0] === "Wajah tidak terdeteksi, gambar terlalu gelap" ||
      msg[0] === "Lebih dari satu wajah terdeteksi" ||
      msg[0] === "Wajah hanya terdeteksi setengah" ||
      msg[0] === "Face not detected, image too dark" ||
      msg[0] === "Multiple faces detected" ||
      msg[0] === "The face is only detected halfway" ||
      msg[0] === "Buka kedua mata lebih lebar" ||
      msg[0] === "Open both eyes wider"
    ) {
      dom.log.style.color = "#FF5630";
      track.style.stroke = "#DE350B";
    }
  }
};
