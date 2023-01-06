import React, { useEffect, useRef, useState } from "react";
import ChevronRight from "@/public/icons/ChevronRight";
import Image from "next/image";
import { assetPrefix } from "next.config";
import { copyToClipboard } from "@/utils/copyToClipboard";
import { LightAsync as SyntaxHighlighter } from "react-syntax-highlighter";
import { githubGist } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import { toast } from "react-toastify";
import ChevronRightGray24 from "@/public/icons/ChevronRightGray24";
import ChevronLeftGray24 from "@/public/icons/ChevronLeftGray24";
import ChevronLeft24 from "@/public/icons/ChevronLeft24";
import ChevronRight24 from "@/public/icons/ChevronRight24";
import { generateFormatedSignerPage } from "@/utils/generateFormatedSignerPage";
import useDocument from "@/hooks/useDocument";
import { fileToBase64 } from "@/utils/fileToBase64";
import Draggable, { DraggableEventHandler } from "react-draggable";
import { Resizable, ResizeCallbackData } from "react-resizable";
import { validTilakaNameFormatRegex } from "@/utils/validTilakaNameFormatRegex";
import html2canvas from "html2canvas";
import { useRouter } from "next/router";
import { v4 as uuidv4 } from "uuid";

type TPropsSignaturLocationSimulator = {};

type TUrlQuery = {
  generate_document_file?: "1";
  generate_signature_image?: "1";
};

type TPropsUploadBox = {
  show: boolean;
  fileOnChange: (file: TFile) => void;
};

type TPropsViewJsonBox = {
  show: boolean;
  json: object;
};

type TPropsPdfViewerBox = {
  show: boolean;
  file: TFile;
  fileBase64: string;
  onRemoveFile: () => void;
  onGenerateJson: (generatedJson: TRequestSignJson) => void;
};

type TFile = File | undefined;

type TSignature = {
  user_identifier: string;
  signature_image: string;
};

type TSignatureProperty = {
  user_identifier: string;
  width: number;
  height: number;
  coordinate_x: number;
  coordinate_y: number;
  page_number: number;
};

type TDocument = {
  file_name: string;
  file: string;
  signatures: TSignatureProperty[];
};

type TRequestSignJson = {
  request_id: string;
  signatures: TSignature[];
  list_pdf: TDocument[];
};

type TSigner = {
  user_identifier: string;
  page: string;
  pageType: "signer_signature_page_all" | "signer_signature_page_selective";
};

type TSigners = TSigner[];

type TDraggableData = {
  x: number;
  y: number;
  height: number;
  width: number;
  user_identifier: TSigner["user_identifier"];
  page_number: TSignatureProperty["page_number"];
};

type TDraggableWrapper = {
  signingOrder: number;
  userIdentifier: TSigner["user_identifier"];
  pageNumber: TSignatureProperty["page_number"];
  onDraggableStop: (data: TDraggableData) => void;
  onDraggableWrapperToCanvasImage: (
    base64: string,
    user_identifier: TSigner["user_identifier"]
  ) => void;
  pageIndex: number;
};

const SIGNATURE_PROPERTY_HEIGHT_DEFAULT: number = 50;
const SIGNATURE_PROPERTY_WIDTH_DEFAULT: number = 80;

const draggableDataInitial: TDraggableData = {
  x: 0,
  y: 0,
  height: SIGNATURE_PROPERTY_HEIGHT_DEFAULT,
  width: SIGNATURE_PROPERTY_WIDTH_DEFAULT,
  user_identifier: "",
  page_number: 0,
};

const requestSignJsonInitial: TRequestSignJson = {
  request_id: "",
  signatures: [],
  list_pdf: [],
};

const signerInitial: TSigner = {
  user_identifier: "",
  page: "",
  pageType: "signer_signature_page_all",
};

const SignaturLocationSimulator = (props: TPropsSignaturLocationSimulator) => {
  const [file, setFile] = useState<TFile>();
  const [fileBase64, setFileBase64] = useState<string>("");
  const [uploaded, setUploaded] = useState<boolean>(false);
  const [viewJson, setViewJson] = useState<boolean>(false);
  const [json, setJson] = useState<TRequestSignJson>(requestSignJsonInitial);
  const [shouldRenderPdfViewerBox, setShouldRenderPdfViewerBox] =
    useState<boolean>(false);

  const fileOnChange = (file: TFile) => {
    setFile(file);
    setUploaded(true);
    fileToBase64(file as File)
      .then((base64) => {
        setFileBase64(base64);
        setShouldRenderPdfViewerBox(true);
      })
      .catch((err) => {
        console.log("Error when convert file to base64", err);
      });
  };
  const viewJsonOnClick = (e: React.SyntheticEvent) => {
    setViewJson(!viewJson);
  };
  const copyOnClick = () => {
    copyToClipboard(JSON.stringify(json, null, 4));
    toast("Copied", {
      icon: (
        <Image
          src={`${assetPrefix}/images/check-circle-white-ic.svg`}
          width="16px"
          height="17px"
          alt="check-circle-white-ic"
        />
      ),
    });
  };
  const onRemoveFilePdfViewer = () => {
    setFile(undefined);
    setFileBase64("");
    setUploaded(false);
    setViewJson(false);
    setJson(requestSignJsonInitial);
    setShouldRenderPdfViewerBox(false);
  };
  const onGenerateJsonPdfViewer = (generatedJson: TRequestSignJson) => {
    setJson(generatedJson);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAFA" }}>
      <div className="simulator-header">
        <div className="simulator-header-text">Simulator PDF</div>
      </div>
      <div className="pt-8 sm:pt-12 md:pt-20 pb-2 sm:pb-6 md:pb-9 px-11 sm:px-20 md:px-32">
        <UploadBox show={!uploaded} fileOnChange={fileOnChange} />
        {shouldRenderPdfViewerBox && (
          <PdfViewerBox
            show={uploaded}
            file={file}
            fileBase64={fileBase64}
            onRemoveFile={onRemoveFilePdfViewer}
            onGenerateJson={onGenerateJsonPdfViewer}
          />
        )}
        <div className="mt-6 flex justify-between items-center">
          <button
            disabled={!uploaded}
            onClick={viewJsonOnClick}
            className="simulator-btn-primary flex items-center"
          >
            {viewJson ? "Tutup JSON" : "Lihat JSON"}
            <div
              className={[
                "ml-3",
                !uploaded ? "hidden" : "block",
                viewJson ? "rotate-90" : "",
              ].join(" ")}
            >
              <ChevronRight />
            </div>
          </button>
          <button
            disabled={!uploaded}
            onClick={copyOnClick}
            className={[
              "flex items-center font-poppins font-semibold text-sm text-neutral200 bg-neutral40 rounded px-2.5 py-2",
              viewJson ? "block" : "hidden",
            ].join(" ")}
          >
            <Image
              src={`${assetPrefix}/images/copy.svg`}
              width="16px"
              height="16px"
              alt="copy-ic"
            />
            <p className="ml-2.5">Copy</p>
          </button>
        </div>
        <ViewJsonBox show={viewJson} json={json} />
        <div className="mt-8 flex justify-center">
          <Image
            src={`${assetPrefix}/images/poweredByTilaka.svg`}
            alt="powered-by-tilaka"
            width="116px"
            height="66px"
            priority
          />
        </div>
      </div>
    </div>
  );
};

const UploadBox = ({ show, fileOnChange }: TPropsUploadBox) => {
  const [isErrorDocumentSize, setIsErrorDocumentSize] =
    useState<boolean>(false);

  const onChange = (e: React.FormEvent<HTMLInputElement>): void => {
    const targetFile: TFile = e.currentTarget.files?.[0];
    if (targetFile) {
      const fileSize = targetFile.size / 1024 / 1024; // in MiB
      if (fileSize <= 32) {
        fileOnChange(targetFile);
        setIsErrorDocumentSize(false);
      } else {
        setIsErrorDocumentSize(true);
      }
    }
  };

  return show ? (
    <div
      className={[
        "bg-white px-2 py-52 border border-dashed border-neutral50 rounded-xl",
        "flex justify-center items-center",
      ].join(" ")}
    >
      <div className="text-center">
        <label htmlFor="file">
          <input
            type="file"
            accept="application/pdf"
            id="file"
            className="hidden"
            onChange={onChange}
          />
          <p className="simulator-btn-primary cursor-pointer">Unggah Dokumen</p>
        </label>
        <p className="text-sm font-normal text-black mt-3">
          Dokumen .pdf maksimal 32 MB
        </p>
        {isErrorDocumentSize && (
          <p className="text-xs font-normal text-red300 mt-3">
            Ukuran dokumen terlalu besar
          </p>
        )}
      </div>
    </div>
  ) : null;
};

const PdfViewerBox = ({
  show,
  file,
  fileBase64,
  onRemoveFile,
  onGenerateJson,
}: TPropsPdfViewerBox) => {
  const router = useRouter();
  const routerQuery: TUrlQuery = router.query;
  const [pageCount, setPageCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [requestSignJson, setRequestSignJson] = useState<TRequestSignJson>(
    requestSignJsonInitial
  );
  const [signers, setSigners] = useState<TSigners>([]);
  const [signer, setSigner] = useState<TSigner>(signerInitial);
  const [draggableData, setDraggableData] =
    useState<TDraggableData>(draggableDataInitial);
  const [onSignerAddValidateInfo, setOnSignerAddValidateInfo] =
    useState<string>("");
  const [zoomCount, setZoomCount] = useState<number>(1);

  const { pages } = useDocument({
    url: fileBase64,
  });

  const prevShouldDisabled = currentPage === 1;
  const nextShouldDisabled = currentPage === pageCount;

  const onPrev = () => {
    if (prevShouldDisabled) return;
    setCurrentPage(currentPage - 1);
  };
  const onNext = () => {
    if (nextShouldDisabled) return;
    setCurrentPage(currentPage + 1);
  };
  const onChangeSignerAdd = (e: React.FormEvent<HTMLInputElement>) => {
    const currentType = e.currentTarget.type;
    const currentName = e.currentTarget.name;
    const currentValue = e.currentTarget.value;

    if (
      currentType === "text" &&
      currentName === "signer_signature_user_identifier"
    ) {
      // add signer user identifier
      setSigner({ ...signer, user_identifier: currentValue });
    } else if (
      currentType === "radio" &&
      currentName === "signer_signature_page" &&
      currentValue === "signer_signature_page_all"
    ) {
      // add signer page all
      setSigner({ ...signer, pageType: currentValue });
    } else if (
      currentType === "radio" &&
      currentName === "signer_signature_page" &&
      currentValue === "signer_signature_page_selective"
    ) {
      // add signer page selective
      setSigner({ ...signer, pageType: currentValue });
    } else if (
      currentType === "text" &&
      currentName === "signer_signature_page_selective_text"
    ) {
      // add signer page selective
      setSigner({ ...signer, page: currentValue });
    } else {
      return;
    }
  };
  const onChangeSignerEdit = (
    e: React.FormEvent<HTMLInputElement>,
    user_identifier: TSigner["user_identifier"]
  ) => {
    const currentType = e.currentTarget.type.split("__")[0];
    const currentName = e.currentTarget.name.split("__")[0];
    const currentValue = e.currentTarget.value.split("__")[0];

    if (
      currentType === "radio" &&
      currentName === "signer_signature_page" &&
      currentValue === "signer_signature_page_all"
    ) {
      // update page on current signer list
      const newSigners = signers.map((el) => {
        // modify signer property
        if (el.user_identifier === user_identifier) {
          return { ...el, pageType: currentValue as TSigner["pageType"] };
        }

        return el;
      });

      setSigners(newSigners);
    } else if (
      currentType === "radio" &&
      currentName === "signer_signature_page" &&
      currentValue === "signer_signature_page_selective"
    ) {
      // update page on current signer list
      const newSigners = signers.map((el) => {
        // modify signer property
        if (el.user_identifier === user_identifier) {
          return { ...el, pageType: currentValue as TSigner["pageType"] };
        }

        return el;
      });

      setSigners(newSigners);
    } else if (
      currentType === "text" &&
      currentName === "signer_signature_page_selective_text"
    ) {
      // update page on current signer list
      const newSigners = signers.map((el) => {
        // modify signer property
        if (el.user_identifier === user_identifier) {
          return { ...el, page: currentValue };
        }

        return el;
      });

      setSigners(newSigners);
    } else {
      return;
    }
  };
  const onSignerAdd = (_: React.SyntheticEvent) => {
    const signerPageFormatAllPages = "1-" + pageCount.toString();
    const generatedSignerPage = generateFormatedSignerPage(signer.page);
    const userIdentifierAlreadyExistOnSigners =
      signers.filter((el) => el.user_identifier === signer.user_identifier)
        .length > 0;

    if (
      !signer.user_identifier ||
      !signer.pageType ||
      (signer.pageType === "signer_signature_page_selective" &&
        !generatedSignerPage) ||
      !validTilakaNameFormatRegex.test(signer.user_identifier)
    ) {
      setOnSignerAddValidateInfo("Form tidak lengkap atau format salah");
      return;
    } else if (userIdentifierAlreadyExistOnSigners) {
      setOnSignerAddValidateInfo(
        "Tilaka Name sudah ditambahkan, silahkan edit ada hapus terlebih dahulu"
      );
      return;
    }

    let signerPage = signer.page;

    if (signer.pageType === "signer_signature_page_all") {
      signerPage = signerPageFormatAllPages;
    }

    setSigners([
      ...signers,
      {
        user_identifier: signer.user_identifier,
        page: signerPage,
        pageType: signer.pageType,
      },
    ]);
    setOnSignerAddValidateInfo("");
    setSigner({
      user_identifier: "",
      page: "",
      pageType: "signer_signature_page_all",
    });
  };
  const onSignerRemove = (user_identifier: TSigner["user_identifier"]) => {
    // filter signers
    setSigners(signers.filter((el) => el.user_identifier !== user_identifier));
  };
  const onDraggable = (data: TDraggableData) => {
    setDraggableData(data);
  };
  const onDraggableWrapperToCanvasImage = (
    base64: string,
    user_identifier: TSigner["user_identifier"]
  ) => {
    const newSignatureIndex = requestSignJson.signatures.findIndex(
      (x) => x.user_identifier === user_identifier
    );

    const newSignatureArr = requestSignJson.signatures.map((x) => x);

    newSignatureArr[newSignatureIndex] = {
      ...newSignatureArr[newSignatureIndex],
      signature_image: base64,
    };

    const requestSignJsonMock = {
      ...requestSignJson,
      signatures: newSignatureArr,
    };

    setRequestSignJson(requestSignJsonMock);
    onGenerateJson(requestSignJsonMock);
  };
  const generateArrSignature = (signers: TSigners): TSignature[] => {
    return signers.map((el, elIdx) => ({
      ...requestSignJson.signatures[elIdx],
      user_identifier: el.user_identifier,
    }));
  };
  const generateArrSignatureProperty = (
    signers: TSigners
  ): TSignatureProperty[] => {
    let arrSignatureProperty: TSignatureProperty[] =
      requestSignJson.list_pdf?.[0]?.signatures.map((x) => x);

    signers.forEach((el, elIdx) => {
      const signerPagesString = generateFormatedSignerPage(el.page);
      const signerPagesStringToArr = signerPagesString.split(",");

      signerPagesStringToArr.forEach((page, pageIdx) => {
        // skip when it already exits in array
        if (
          requestSignJson.list_pdf?.[0]?.signatures.findIndex(
            (x) =>
              x.page_number === parseInt(page) &&
              x.user_identifier === el.user_identifier
          ) !== -1
        ) {
          return;
        }

        const signatureProperty = {
          coordinate_x: 0,
          coordinate_y: 0,
          height: SIGNATURE_PROPERTY_HEIGHT_DEFAULT,
          width: SIGNATURE_PROPERTY_WIDTH_DEFAULT,
          user_identifier: el.user_identifier,
          page_number: parseInt(page),
        };
        arrSignatureProperty.push(signatureProperty);
      });
    });

    return arrSignatureProperty;
  };

  /**
   * Document page
   */
  useEffect(() => {
    setPageCount(pages.length);
  }, [pages]);

  /**
   * Generate 1
   */
  useEffect(() => {
    // initaly set list_pdf on mount
    if (!requestSignJson.list_pdf.length) {
      // Document file only fill when generate_document_file parameter equals 1
      let documentFile = {
        file: "",
        file_name: "",
      };

      if (routerQuery.generate_document_file === "1") {
        documentFile = {
          file: fileBase64.split(",")[1],
          file_name: file?.name || "",
        };
      }

      const requestSignJsonMock = {
        ...requestSignJson,
        request_id: uuidv4(),
        list_pdf: [
          {
            ...documentFile,
            signatures: [],
          },
        ],
      };

      setRequestSignJson(requestSignJsonMock);
      onGenerateJson(requestSignJsonMock);

      return;
    }

    // after add signers at firstly
    const requestSignJsonMock = {
      ...requestSignJson,
      signatures: generateArrSignature(signers),
      list_pdf: [
        {
          file: requestSignJson.list_pdf[0].file,
          file_name: requestSignJson.list_pdf[0].file_name,
          signatures: generateArrSignatureProperty(signers),
        },
      ],
    };

    setRequestSignJson(requestSignJsonMock);
    onGenerateJson(requestSignJsonMock);
  }, [signers]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Generate 2
   */
  useEffect(() => {
    if (!requestSignJson.list_pdf.length) return;

    const newSignaturePropertyArr: TSignatureProperty[] =
      requestSignJson?.list_pdf?.[0]?.signatures.map((e) => e) || [];
    const currentDraggableIndex = newSignaturePropertyArr.findIndex(
      (x) =>
        x.page_number === draggableData.page_number &&
        x.user_identifier === draggableData.user_identifier
    );

    if (currentDraggableIndex !== -1) {
      newSignaturePropertyArr[currentDraggableIndex] = {
        coordinate_x: draggableData.x,
        coordinate_y: draggableData.y,
        height: draggableData.height,
        width: draggableData.width,
        user_identifier: draggableData.user_identifier,
        page_number: draggableData.page_number,
      };
    }

    const requestSignJsonMock: TRequestSignJson = {
      ...requestSignJson,
      list_pdf: [
        {
          file: requestSignJson.list_pdf[0].file,
          file_name: requestSignJson.list_pdf[0].file_name,
          signatures: newSignaturePropertyArr,
        },
      ],
    };

    setRequestSignJson(requestSignJsonMock);
    onGenerateJson(requestSignJsonMock);
  }, [draggableData]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className={[
        "bg-neutral10 px-6 py-4 border border-neutral50 rounded-lg",
        show ? "block" : "hidden",
      ].join(" ")}
    >
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="simulator-btn-primary truncate max-w-xs">
                {file?.name}
              </div>
              <button
                onClick={onRemoveFile}
                className="ml-3 bg-neutral200 p-1 h-8 w-8 flex justify-center items-center rounded-full"
              >
                <Image
                  src={`${assetPrefix}/images/trash.svg`}
                  alt="trash"
                  width="16px"
                  height="16px"
                />
              </button>
            </div>
            <div className="bg-white text-neutral60 flex justify-around items-center font-poppins">
              <button
                disabled={prevShouldDisabled}
                onClick={onPrev}
                className="simulator-btn-primary-pagination-prev"
              >
                {prevShouldDisabled ? <ChevronLeftGray24 /> : <ChevronLeft24 />}
              </button>
              <div className="mx-8">
                <span className="text-neutral800">{currentPage}</span>/
                {pageCount}
              </div>
              <button
                disabled={nextShouldDisabled}
                onClick={onNext}
                className="simulator-btn-primary-pagination-next"
              >
                {nextShouldDisabled ? (
                  <ChevronRightGray24 />
                ) : (
                  <ChevronRight24 />
                )}
              </button>
            </div>
          </div>
          <div className="simulator-canvas-wrapper">
            {pages.map((canvasURL, idx) => {
              return (
                <div
                  key={idx}
                  id={`canvas-wrapper-${idx}`}
                  className={[currentPage !== idx + 1 ? "hidden" : ""].join(
                    " "
                  )}
                >
                  {/* we assume this only have 1 document, so we use `list_pdf[0]` */}
                  {requestSignJson?.list_pdf?.[0]?.signatures.map(
                    (sgner, sgnerIdx) =>
                      sgner.page_number === idx + 1 ? (
                        <DraggrableWrapper
                          key={sgnerIdx}
                          signingOrder={
                            requestSignJson.signatures.findIndex(
                              (x) => x.user_identifier === sgner.user_identifier
                            ) + 1
                          }
                          userIdentifier={sgner.user_identifier}
                          pageNumber={sgner.page_number}
                          onDraggableStop={onDraggable}
                          onDraggableWrapperToCanvasImage={
                            onDraggableWrapperToCanvasImage
                          }
                          pageIndex={idx}
                        />
                      ) : null
                  )}

                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    key={idx}
                    id={`page-${idx}`}
                    style={{
                      transform: `matrix(${zoomCount}, 0, 0, ${zoomCount}, 0, 0)`,
                      transformOrigin: "top left",
                      transition: "all .3s",
                    }}
                    className=""
                    src={canvasURL}
                    alt={`page-${idx}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div className="col-span-4 font-poppins">
          <p className="text-base text-neutral800 font-normal">Penandatangan</p>
          <div className="mt-10">
            {signers.map((el, ix) => (
              <div key={ix} className="flex items-start gap-8">
                <div className="flex flex-col items-center gap-6 pt-2">
                  <Image
                    src={`${assetPrefix}/images/simulator-dot.svg`}
                    width="8px"
                    height="8px"
                    alt="simulator-dot"
                    layout="fixed"
                  />
                  <Image
                    src={`${assetPrefix}/images/simulator-v-line.svg`}
                    width="2px"
                    height="69px"
                    alt="simulator-v-line"
                    layout="fixed"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <p className="text-sm text-neutral800 font-normal">
                      {el.user_identifier}
                    </p>
                    <button
                      onClick={() => {
                        onSignerRemove(el.user_identifier);
                      }}
                      className="flex justify-center items-center ml-2"
                    >
                      <Image
                        src={`${assetPrefix}/images/simulator-remove-signer.svg`}
                        width="16px"
                        height="16px"
                        alt="simulator-remove-signer"
                      />
                    </button>
                  </div>
                  <div className="mt-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={
                          "signer_signature_page" + "__" + el.user_identifier
                        }
                        value="signer_signature_page_all"
                        onChange={(e) => {
                          onChangeSignerEdit(e, el.user_identifier);
                        }}
                        checked={el.pageType === "signer_signature_page_all"}
                        className="form-radio text-primary"
                      />
                      <p className="text-sm text-neutral800 font-normal ml-3">
                        Semua
                      </p>
                    </label>
                    <label className="flex items-center mt-5">
                      <input
                        type="radio"
                        name={
                          "signer_signature_page" + "__" + el.user_identifier
                        }
                        value="signer_signature_page_selective"
                        onChange={(e) => {
                          onChangeSignerEdit(e, el.user_identifier);
                        }}
                        checked={
                          el.pageType === "signer_signature_page_selective"
                        }
                        className="form-radio text-primary"
                      />
                      <p className="text-sm text-neutral800 font-normal ml-3">
                        Halaman
                      </p>
                      <input
                        disabled={
                          el.pageType !== "signer_signature_page_selective"
                        }
                        type="text"
                        name={
                          "signer_signature_page_selective_text" +
                          "__" +
                          el.user_identifier
                        }
                        value={el.page}
                        onChange={(e) => {
                          onChangeSignerEdit(e, el.user_identifier);
                        }}
                        className="w-full bg-white border border-neutral50 rounded text-neutral800 placeholder:text-neutral60 p-2.5 text-sm focus:outline-none ml-2.5 disabled:border-neutral30 disabled:text-neutral40 disabled:cursor-not-allowed"
                        placeholder="Contoh: 1,2,5-9"
                      />
                    </label>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex items-start gap-8 mt-4">
              <div className="flex flex-col items-center gap-6 pt-5">
                <Image
                  src={`${assetPrefix}/images/simulator-dot.svg`}
                  width="8px"
                  height="8px"
                  alt="simulator-dot"
                  layout="fixed"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  name="signer_signature_user_identifier"
                  value={signer.user_identifier}
                  onChange={onChangeSignerAdd}
                  className="bg-transparent w-full placeholder:text-neutral60 text-neutral800 border-b border-neutral50 py-2.5 focus:outline-none focus:border-neutral800 text-sm"
                  placeholder="Masukkan Tilaka Name"
                />
                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="signer_signature_page"
                      value="signer_signature_page_all"
                      onChange={onChangeSignerAdd}
                      checked={signer.pageType === "signer_signature_page_all"}
                      className="form-radio text-primary"
                    />
                    <p className="text-sm text-neutral800 font-normal ml-3">
                      Semua
                    </p>
                  </label>
                  <label className="flex items-center mt-5">
                    <input
                      type="radio"
                      name="signer_signature_page"
                      value="signer_signature_page_selective"
                      onChange={onChangeSignerAdd}
                      checked={
                        signer.pageType === "signer_signature_page_selective"
                      }
                      className="form-radio text-primary"
                    />
                    <p className="text-sm text-neutral800 font-normal ml-3">
                      Halaman
                    </p>
                    <input
                      disabled={
                        signer.pageType !== "signer_signature_page_selective"
                      }
                      type="text"
                      name="signer_signature_page_selective_text"
                      value={signer.page}
                      onChange={onChangeSignerAdd}
                      className="w-full bg-white border border-neutral50 rounded text-neutral800 placeholder:text-neutral60 p-2.5 text-sm focus:outline-none ml-2.5 disabled:border-neutral30 disabled:text-neutral40 disabled:cursor-not-allowed"
                      placeholder="Contoh: 1,2,5-9"
                    />
                  </label>
                </div>
                <p className="mt-2.5 text-xs text-red300 font-normal">
                  {onSignerAddValidateInfo}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={onSignerAdd} className="simulator-btn-primary">
                Tambah Penandatangan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ViewJsonBox = ({ show, json }: TPropsViewJsonBox) => {
  return (
    <div
      className={[
        "bg-neutral10 mt-3 px-9 py-4 border border-neutral50 rounded-lg text-sm",
        show ? "block" : "hidden",
      ].join(" ")}
    >
      <SyntaxHighlighter
        language="json"
        style={githubGist}
        customStyle={{ backgroundColor: "transparent" }}
      >
        {JSON.stringify(json, null, 4)}
      </SyntaxHighlighter>
    </div>
  );
};

const DraggrableWrapper = ({
  signingOrder,
  userIdentifier,
  pageNumber,
  onDraggableStop,
  onDraggableWrapperToCanvasImage,
  pageIndex,
}: TDraggableWrapper) => {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const routerQuery: TUrlQuery = router.query;

  const currentPageCanvasWrapper = document.getElementById(
    "canvas-wrapper-" + pageIndex
  );
  const currentPageCanvasWrapperClientWidth =
    currentPageCanvasWrapper?.clientWidth ||
    SIGNATURE_PROPERTY_WIDTH_DEFAULT * 2;
  const currentPageCanvasWrapperClientHeight =
    currentPageCanvasWrapper?.clientHeight ||
    SIGNATURE_PROPERTY_HEIGHT_DEFAULT * 2;

  const [data, setData] = useState<TDraggableData>(draggableDataInitial);
  const [resizeableMaxConstraints, setResizeableMaxConstraints] = useState<
    [number, number]
  >([
    currentPageCanvasWrapperClientWidth,
    currentPageCanvasWrapperClientHeight,
  ]);

  const handleStop: DraggableEventHandler = (e, ui) => {
    // Calculate max resize on draggable signature
    // y maxConstraints: currentPageCanvasWrapper offsetHeight - draggable x
    // x maxConstraints: currentPageCanvasWrapper offsetWidth - draggable y
    const yMax = ui.y + data.height === currentPageCanvasWrapper?.clientHeight;
    const xMax = ui.x + data.width === currentPageCanvasWrapper?.clientWidth;

    if (xMax || yMax) {
      // stop resize when draggable x or draggable y is max
      setResizeableMaxConstraints([data.width, data.height]);
    } else {
      // initially
      setResizeableMaxConstraints([
        currentPageCanvasWrapperClientWidth - ui.x,
        currentPageCanvasWrapperClientHeight - ui.y,
      ]);
    }

    setData({
      ...data,
      x: ui.x,
      y: ui.y,
      user_identifier: userIdentifier,
      page_number: pageNumber,
    });
  };
  const draggableWrapperToCanvasImage = async () => {
    if (routerQuery.generate_signature_image === "1") {
      const canvas = await html2canvas(ref.current as HTMLDivElement, {});
      const image = canvas.toDataURL("image/png");
      if (image.split(",")[1]) {
        onDraggableWrapperToCanvasImage(image.split(",")[1], userIdentifier);
      }
    } else {
      onDraggableWrapperToCanvasImage("", userIdentifier);
    }
  };
  const onResize: (
    e: React.SyntheticEvent<Element, Event>,
    data: ResizeCallbackData
  ) => void = (event, { node, size, handle }) => {
    // Calculate max resize on draggable signature
    // y maxConstraints: currentPageCanvasWrapper offsetHeight - draggable x
    // x maxConstraints: currentPageCanvasWrapper offsetWidth - draggable y
    const yMax =
      data.y + size.height === currentPageCanvasWrapper?.clientHeight;
    const xMax = data.x + size.width === currentPageCanvasWrapper?.clientWidth;

    if (xMax || yMax) {
      // stop resize when draggable x or draggable y is max
      setResizeableMaxConstraints([size.width, size.height]);
    } else {
      // initially
      setResizeableMaxConstraints([
        currentPageCanvasWrapperClientWidth - data.x,
        currentPageCanvasWrapperClientHeight - data.y,
      ]);
    }

    setData({ ...data, height: size.height, width: size.width });
  };

  useEffect(() => {
    onDraggableStop(data);
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    draggableWrapperToCanvasImage();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Draggable
      onStop={handleStop}
      handle=".handle"
      defaultPosition={{ x: 0, y: 0 }}
      position={{ x: data.x, y: data.y }}
      defaultClassName="absolute z-20 hover:cursor-pointer active:cursor-grab"
      bounds=".simulator-canvas-wrapper"
    >
      <div>
        <Resizable
          height={data.height}
          width={data.width}
          onResize={onResize}
          minConstraints={[
            SIGNATURE_PROPERTY_WIDTH_DEFAULT,
            SIGNATURE_PROPERTY_HEIGHT_DEFAULT,
          ]}
          maxConstraints={resizeableMaxConstraints}
          lockAspectRatio
        >
          <div
            ref={ref}
            className="border border-dashed border-neutral200 rounded"
            style={{
              height: data.height + "px",
              width: data.width + "px",
            }}
          >
            <div className="handle h-full w-full p-2">
              <div style={{ width: data.width - 8 + "px" }}>
                <p className="text-xs text-neutral200 font-normal font-poppins truncate">
                  Signer {signingOrder}
                </p>
                <p className="text-sm text-neutral800 font-normal font-poppins truncate">
                  {userIdentifier}
                </p>
              </div>
            </div>
          </div>
        </Resizable>
      </div>
    </Draggable>
  );
};

export default SignaturLocationSimulator;
