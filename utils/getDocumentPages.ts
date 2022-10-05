interface GetDocumentPagesOptions {
  scale?: number;
  url: string;
}

const BASE64_MARKER = ';base64,';

function convertDataURIToBinary(dataURI : string) {
  let base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
  let base64 = dataURI.substring(base64Index);
  let raw = window.atob(base64);
  let rawLength = raw.length;
  let array = new Uint8Array(new ArrayBuffer(rawLength));

  for(let i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return array;
}

export default async ({
  scale = 1,
  url,
}: GetDocumentPagesOptions): Promise<Array<string>> => {
  const pdfjsLib = require("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const pdfAsArray = convertDataURIToBinary(url)

  // First, we need to load the document using the getDocument utility
  const loadingTask = await pdfjsLib.getDocument(pdfAsArray);
  const pdf = await loadingTask.promise;

  const { numPages } = pdf;

  const canvasURLs = [];

  // Now for every page in the document, we're going to add a page to the array
  for (let i = 0; i < numPages; i++) {
    const page = await pdf.getPage(i + 1);

    const viewport = page.getViewport({scale:scale});
    const { width, height } = viewport;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.className = "page";
    await page.render({
      canvasContext: canvas.getContext("2d"),
      viewport,
    }).promise;

    canvasURLs.push(canvas.toDataURL());
  }

  return canvasURLs;
};
