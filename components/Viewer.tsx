import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/app/store";
import useDocument from "../hooks/useDocument";
import Pagination from "./Pagination";

interface Props {
  url: any;
  tandaTangan: any;
  setTotalPages: Dispatch<SetStateAction<number>>;
}
export const Viewer: React.FC<Props> = ({ url, setTotalPages, tandaTangan }) => {
  const { pages } = useDocument({
    url: url,
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pdfDisplayed, setPdfDisplayed] = useState<number>(2);
  const [zoomCount, setZoomCount] = useState<number>(1);
  const [isShowPagination, setIsShowPagination] = useState<boolean>(true);

  const indexOfLastPdf = currentPage * 2;
  const indexOfFirstPdf = indexOfLastPdf - 2;
  const currentPages = pages.slice(indexOfFirstPdf, indexOfLastPdf);

  let iddleState = false;
  let iddleTimer: any;

  useEffect(() => {
    if(pages){
      setTotalPages(pages.length);
    }
  }, [pages.length]);

  useEffect(() => {
    showPagination();
  },[])

  const showPagination = () => {
    clearTimeout(iddleTimer);
    if (iddleState) {
      setIsShowPagination(true);
    }
    iddleState = false;
    iddleTimer = setTimeout(() => {
      setIsShowPagination(false);
      iddleState = true;
    }, 4000);
  };

  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      showPagination();
    });
  }

  return (
    <div className=" relative overflow-auto w-full">
      <div className="w-fit mx-auto h-fit pt-14" >
        {
          tandaTangan ? <Signature /> : null
        }
        {currentPages.map((canvasURL, idx) => {
          return (
            <div key={idx} onClick={showPagination} onTouchStart={showPagination} className="relative flex flex-col items-center">
              <img
                style={{
                  transform: `matrix(${zoomCount}, 0, 0, ${zoomCount}, 0, 0)`,
                  transformOrigin: "top left",
                  transition: "all .3s",
                }}
                className=" shadow-xl"
                src={canvasURL}
                
              />
              ;
              <Pagination
                currentPage={currentPage}
                currentPages={currentPages.length}
                setCurrentPage={setCurrentPage}
                totalPages={pages.length}
                pdfDisplayed={pdfDisplayed}
                setPdfDisplayed={setPdfDisplayed}
                zoomCount={zoomCount}
                setZoomCount={setZoomCount}
                isShow={isShowPagination}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Signature = () => {
  const res = useSelector((state: RootState) => state.document);
  return (
    <div
      style={{
        transform: `translate(${res.response.data.posX}px,${res.response.data.posY}px)`,
        zIndex: "2",
      }}
      className="absolute"
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
          style={{ touchAction: "none", width: `${res.response.data.width}px`, height: `${res.response.data.height}px` }}
          src={`data:image/png;base64,${res.response.data.tandaTangan.replaceAll('"', '')}`}
          alt="signature"
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
    </div>
  );
};
