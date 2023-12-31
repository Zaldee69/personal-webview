import React, { useEffect, useRef, useState } from "react";
import ChevronRight from "@/public/icons/ChevronRight";
import Image from "next/legacy/image";
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
import { generateArrSignature, generateArrSignatureProperty, onChangeaddSigner, editSignatureToCanvasImage, updateDraggableCoordinate } from "@/hooks/pdfViewer"
import { fileToBase64 } from "@/utils/fileToBase64";
import Draggable, { DraggableEventHandler } from "react-draggable";
import { Resizable, ResizeCallbackData } from "react-resizable";
import { validTilakaNameFormatRegex } from "@/utils/validTilakaNameFormatRegex";
import html2canvas from "html2canvas";
import { useRouter } from "next/router";
import { v4 as uuidv4 } from "uuid";
import i18n from "i18";

type TPropsSignaturLocationSimulator = {};

type TUrlQuery = {
  generate_document_file?: "1";
  generate_signature_image?: "1";
  lock_aspect_ratio?: "1";
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
  pageType: string;
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
    user_identifier: TSigner["user_identifier"],
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

  const { t }: any = i18n;

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
    toast(t("copied"), {
      icon: (
        <Image
          src={`${assetPrefix}/images/check-circle-white-ic.svg`}
          width="16"
          height="17"
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
        <div className="simulator-header-text">{t("simulatorPDFTitle")}</div>
      </div>
      <div className="pt-8 sm:pt-12 md:pt-20 pb-2 sm:pb-6 md:pb-9 px-11 sm:px-20 md:px-32  md:max-w-screen-2xl min-w-max mx-auto">
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
            {viewJson
              ? t("simulatorViewJsonButtonTextClose")
              : t("simulatorViewJsonButtonTextOpen")}
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
              width="16"
              height="16"
              alt="copy-ic"
            />
            <p className="ml-2.5">{t("copy")}</p>
          </button>
        </div>
        <ViewJsonBox show={viewJson} json={json} />
        <div className="mt-8 flex justify-center">
          <Image
            src={`${assetPrefix}/images/poweredByTilaka.svg`}
            alt="powered-by-tilaka"
            width="116"
            height="66"
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
  const [isErrorDocumentType, setIsErrorDocumentType] =
    useState<boolean>(false);

  const { t }: any = i18n;

  const onChange = (e: React.FormEvent<HTMLInputElement>): void => {
    const targetFile: TFile = e.currentTarget.files?.[0];
    if (targetFile) {
      const fileType = targetFile.type;
      if (fileType === "application/pdf") {
        setIsErrorDocumentType(false);
        const fileSize = targetFile.size / 1024 / 1024; // in MiB
        if (fileSize <= 32) {
          fileOnChange(targetFile);
          setIsErrorDocumentSize(false);
        } else {
          setIsErrorDocumentSize(true);
        }
      } else {
        setIsErrorDocumentType(true);
        setIsErrorDocumentSize(false);
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
          <p className="simulator-btn-primary cursor-pointer">
            {t("simulatorUploadDocument")}
          </p>
        </label>
        <p className="text-sm font-normal text-black mt-3">
          {t("simulatorUploadDocumentDescription")}
        </p>
        {isErrorDocumentSize && (
          <p className="text-xs font-normal text-red300 mt-3">
            {t("simulatorUploadDocumentErrorSize")}
          </p>
        )}
        {isErrorDocumentType && (
          <p className="text-xs font-normal text-red300 mt-3">
            {t("simulatorUploadDocumentErrorType")}
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
  const [onSignerEditValidateInfo, setOnSignerEditValidateInfo] = useState<{
    index?: number;
    text?: string;
  }>();
  const [zoomCount, setZoomCount] = useState<number>(1);

  const { pages } = useDocument({
    url: fileBase64,
  });

  const { t }: any = i18n;

  const prevShouldDisabled = currentPage === 1;
  const nextShouldDisabled = currentPage === pageCount;
  const signerPageFormatAllPages = "1-" + pageCount.toString();

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

    const result = onChangeaddSigner(signer, currentType, currentName, currentValue);

    if(!result){
      return
    }
    setSigner(result)
  };
  const onChangeSignerEdit = (
    e: React.FormEvent<HTMLInputElement>,
    userIdentifier: TSigner["user_identifier"],
    currentInputIndex: number
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
        if (el.user_identifier === userIdentifier) {
          return {
            ...el,
            pageType: currentValue as TSigner["pageType"],
            page: signerPageFormatAllPages,
          };
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
        if (el.user_identifier === userIdentifier) {
          return { ...el, pageType: currentValue as TSigner["pageType"] };
        }

        return el;
      });

      setSigners(newSigners);
    } else if (
      currentType === "text" &&
      currentName === "signer_signature_page_selective_text"
    ) {
      const generatedSignerPage = generateFormatedSignerPage(currentValue);
      const pageExceedNumber = generatedSignerPage
        .split(",")
        .map((el, idx) => (parseInt(el) > pageCount ? true : false));

      if (pageExceedNumber.includes(true)) {
        setOnSignerEditValidateInfo({
          index: currentInputIndex,
          text: t("simulatorSignerErrorTotalPage"),
        });

        return;
      } else {
        setOnSignerEditValidateInfo(undefined);
      }

      // update page on current signer list
      let newSigners = signers.map((el, idx) => {
        // modify signer property
        if (el.user_identifier === userIdentifier) {
          return { ...el, page: currentValue.replace(/(?!-)[^0-9.]/g, "") };
        } else {
          return el;
        }
      });

      setSigners(newSigners);
    } else {
      return;
    }
  };
  const onBlurSignerEdit = () => {
    setOnSignerEditValidateInfo(undefined);
  };
  const onSignerAdd = (_: React.SyntheticEvent) => {
    const generatedSignerPage = generateFormatedSignerPage(signer.page);
    const userIdentifierAlreadyExistOnSigners =
      signers.filter((el) => el.user_identifier === signer.user_identifier)
        .length > 0;
    const pageExceedNumber = generatedSignerPage
      .split(",")
      .map((el, idx) => (parseInt(el) > pageCount ? true : false));

    if (
      !signer.user_identifier ||
      !signer.pageType ||
      (signer.pageType === "signer_signature_page_selective" &&
        !generatedSignerPage) ||
      !validTilakaNameFormatRegex.test(signer.user_identifier)
    ) {
      setOnSignerAddValidateInfo(
        t("simulatorAddSignerErrorReqiredOrWrongFormat")
      );
      return;
    } else if (userIdentifierAlreadyExistOnSigners) {
      setOnSignerAddValidateInfo(t("simulatorAddSignerErrorAlradyExist"));
      return;
    } else if (pageExceedNumber.includes(true)) {
      setOnSignerAddValidateInfo(t("simulatorSignerErrorTotalPage"));
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
    const result = editSignatureToCanvasImage(base64,user_identifier,requestSignJson)
    
    setRequestSignJson(result);
    onGenerateJson(result);
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

    // after add signers at firstly or on edit
    const requestSignJsonMock = {
      ...requestSignJson,
      signatures: generateArrSignature(signers, requestSignJson),
      list_pdf: [
        {
          file: requestSignJson.list_pdf[0].file,
          file_name: requestSignJson.list_pdf[0].file_name,
          signatures: generateArrSignatureProperty(signers,requestSignJson),
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

    const signJson = updateDraggableCoordinate(requestSignJson,draggableData)

    setRequestSignJson(signJson);
    onGenerateJson(signJson);
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
                  width="16"
                  height="16"
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
          <p className="text-base text-neutral800 font-normal">
            {t("simulatorSignerText")}
          </p>
          <div className="mt-10">
            {signers.map((el, ix) => (
              <div key={ix} className="flex items-start gap-8">
                <div className="flex flex-col items-center gap-6 pt-2">
                  <Image
                    src={`${assetPrefix}/images/simulator-dot.svg`}
                    width="8"
                    height="8"
                    alt="simulator-dot"
                    layout="fixed"
                  />
                  <Image
                    src={`${assetPrefix}/images/simulator-v-line.svg`}
                    width="2"
                    height="69"
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
                        width="16"
                        height="16"
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
                          onChangeSignerEdit(e, el.user_identifier, ix);
                        }}
                        checked={el.pageType === "signer_signature_page_all"}
                        className="form-radio text-primary"
                      />
                      <p className="text-sm text-neutral800 font-normal ml-3">
                        {t("all")}
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
                          onChangeSignerEdit(e, el.user_identifier, ix);
                        }}
                        checked={
                          el.pageType === "signer_signature_page_selective"
                        }
                        className="form-radio text-primary"
                      />
                      <p className="text-sm text-neutral800 font-normal ml-3">
                        {t("page")}
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
                          onChangeSignerEdit(e, el.user_identifier, ix);
                        }}
                        onBlur={onBlurSignerEdit}
                        className="w-full bg-white border border-neutral50 rounded text-neutral800 placeholder:text-neutral60 p-2.5 text-sm focus:outline-none ml-2.5 disabled:border-neutral30 disabled:text-neutral40 disabled:cursor-not-allowed"
                        placeholder={t("simulatorSignerPageInputPlaceholder")}
                      />
                    </label>
                  </div>
                  {ix === onSignerEditValidateInfo?.index && (
                    <p className="mt-2.5 text-xs text-red300 font-normal">
                      {onSignerEditValidateInfo?.text}
                    </p>
                  )}
                </div>
              </div>
            ))}
            <div className="flex items-start gap-8 mt-4">
              <div className="flex flex-col items-center gap-6 pt-5">
                <Image
                  src={`${assetPrefix}/images/simulator-dot.svg`}
                  width="8"
                  height="8"
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
                  placeholder={t("linkAccountPlaceholder")}
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
                      {t("all")}
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
                      {t("page")}
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
                {t("simulatorAddSignerText")}
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

  const { t }: any = i18n;

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

    setData({
      ...data,
      height: size.height,
      width: size.width,
      user_identifier: userIdentifier,
      page_number: pageNumber,
    });
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
          lockAspectRatio={routerQuery.lock_aspect_ratio === "1"}
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
                  {t("simulatorSignerText")} {signingOrder}
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
