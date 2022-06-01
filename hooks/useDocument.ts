import { useState, useEffect } from "react";
import getDocumentPages from "../utils/getDocumentPages";

interface URL {
  url: string;
}

export default ({ url }: URL) => {
  const [pages, setPages] = useState<string[]>([]);
  useEffect(() => {
    const getPages = async () => {
      const canvases = await getDocumentPages({
        url,
      });

      setPages(canvases);
    };
    getPages();
  }, [url]);
  return {
    pages,
  };
};
