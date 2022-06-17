import React from "react";
import ChevronRight from "../public/icons/ChevronRight";
import ChevronLeft from "../public/icons/ChevronLeft";
import PlusIcon from "../public/icons/PlusIcon";
import MinusIcon from "../public/icons/MinusIcon";


interface Props {
  currentPages: number;
  totalPages: number;
  currentPage: number;
  pdfDisplayed: number;
  zoomCount: number;
  isShow: boolean
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  setPdfDisplayed: React.Dispatch<React.SetStateAction<number>>;
  setZoomCount: React.Dispatch<React.SetStateAction<number>>;
}

const Pagination: React.FC<Props> = ({
  totalPages,
  setCurrentPage,
  currentPage,
  pdfDisplayed,
  setPdfDisplayed,
  currentPages,
  zoomCount,
  setZoomCount,
  isShow
}) => {
  const zoomInHandler = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    zoomCount = parseFloat(zoomCount.toFixed(1));
    if (zoomCount === 1.9) {
      setZoomCount(2);
    }
    if (zoomCount < 2.9) {
      setZoomCount((zoomCount += 0.3));
    }
  };

  const zoomOutHandler = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    zoomCount = parseFloat(zoomCount.toFixed(1));
    if (zoomCount === 2) {
      setZoomCount((zoomCount = 1.9));
    }
    if (zoomCount > 1) {
      setZoomCount((zoomCount -= 0.3));
    }
  };
  return (
    <div
      className={` ${!isShow ? "opacity-0" : "opacity-100"} bottom-20 fixed transition-all duration-500 flex justify-center w-full  left-0 right-0`}
    >
      <div className=" w-64 h-10 flex justify-center rounded py-1  bg-[#424242]">
        <div className="flex items-center gap-1">
          <button
            disabled={currentPage == 1}
            onClick={() => {
              currentPage < 1 ? null : setCurrentPage(currentPage - 1);
              setPdfDisplayed(pdfDisplayed - currentPages);
            }}
            className={` ${
              currentPage === 1 ? "bg-[#515151]" : "bg-[#616161]"
            } rounded-bl rounded-tl px-1 py-2`}
          >
            <ChevronLeft />
          </button>
          <p
            style={{ paddingTop: 5, paddingBottom: 6 }}
            className="text-white px-5 font-poppins block text-sm  bg-[#616161]"
          >
            {pdfDisplayed}
          </p>
          <button
            disabled={currentPage >= totalPages / 2}
            onClick={() => {
              setCurrentPage(currentPage + 1);
              setPdfDisplayed(
                pdfDisplayed + currentPages > totalPages
                  ? totalPages
                  : pdfDisplayed + currentPages
              );
            }}
            className={`${
              currentPage >= totalPages / 2 ? "bg-[#515151]" : "bg-[#616161]"
            } rounded-tr rounded-br  px-1 py-2 `}
          >
            <ChevronRight />
          </button>
          <span className="text-white font-poppins text-sm">
            dari {totalPages}
          </span>
          <button
            disabled={zoomCount >= 2.9}
            className={`${zoomCount >= 2.9 ? "opacity-50" : ""} `}
            onClick={zoomInHandler}
          >
            <PlusIcon />
          </button>
          <button
            disabled={zoomCount === 1}
            onClick={zoomOutHandler}
            className={`${zoomCount === 1 ? "opacity-50" : ""} `}
          >
            <MinusIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
