import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import useDocument from "../hooks/useDocument";
import Draggable from "react-draggable";
import { Resizable } from "re-resizable";
import Pagination from "./Pagination";

interface Props {
  url: any;
  setTotalPages: Dispatch<SetStateAction<number>>;
}
export const Viewer: React.FC<Props> = ({ url, setTotalPages }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pdfDisplayed, setPdfDisplayed] = useState<number>(2);
  const [zoomCount, setZoomCount] = useState<number>(1);
  const { pages } = useDocument({
    url: url,
  });

  const indexOfLastPdf = currentPage * 2;
  const indexOfFirstPdf = indexOfLastPdf - 2;
  const currentPages = pages.slice(indexOfFirstPdf, indexOfLastPdf);
  useEffect(() => {
    setTotalPages(pages.length);
  }, []);

  return (
    <div className="mt-20 relative overflow-auto w-full">
      <div
        style={{
          transform: `matrix(${zoomCount}, 0, 0, ${zoomCount}, 0, 0)`,
          transformOrigin: "top left",
          transition: "all .3s",
        }}
        className="content-parent "
      >
        <DraggableSignature />
        {currentPages.map((canvasURL, idx) => {
          return <img className="mt-10" src={canvasURL} key={idx} />;
        })}
      </div>
      <Pagination
        currentPage={currentPage}
        currentPages={currentPages.length}
        setCurrentPage={setCurrentPage}
        totalPages={pages.length}
        pdfDisplayed={pdfDisplayed}
        setPdfDisplayed={setPdfDisplayed}
        zoomCount={zoomCount}
        setZoomCount={setZoomCount}
      />
    </div>
  );
};

const DraggableSignature = () => {
  return (
    <div className=" absolute ">
      <Draggable
        bounds=".content-parent"
        handle=".handle"
        defaultPosition={{ x: 20, y: 634 }}
        grid={[4, 4]}
        scale={1}
        disabled={true}
      >
        <Resizable
          maxHeight={200}
          maxWidth={200}
          bounds="window"
          enable={{ top: false, left: false, right: false, bottom: false }}
          defaultSize={{
            width: 150,
            height: 150,
          }}
        >
          <div
            style={{
              borderWidth: "1px",
              boxSizing: "border-box",
              touchAction: "none",
            }}
            className=" relative border-[#1A73E8] handle "
          >
            <img
              style={{ touchAction: "none" }}
              src="/images/download.png"
              alt=""
            />
            <div
              style={{ borderWidth: "2px", left: "-7px", top: "-5px" }}
              className="bg-[#1A73E8] rounded-full border-[#1A73E8] w-3 h-3 absolute "
            ></div>
            <div
              style={{ borderWidth: "2px", right: "-7px", top: "-5px" }}
              className="bg-[#1A73E8] rounded-full border-[#1A73E8] w-3 h-3 absolute "
            ></div>
            <div
              style={{ borderWidth: "2px", bottom: "-7px", left: "-5px" }}
              className="bg-[#1A73E8] rounded-full border-[#1A73E8] w-3 h-3 absolute "
            ></div>
            <div
              style={{ borderWidth: "2px", bottom: "-7px", right: "-5px" }}
              className="bg-[#1A73E8] rounded-full border-[#1A73E8] w-3 h-3 absolute -bottom-2 -right-2"
            ></div>
          </div>
        </Resizable>
      </Draggable>
    </div>
  );
};
