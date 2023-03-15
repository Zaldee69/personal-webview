import { generateFormatedSignerPage } from "@/utils/generateFormatedSignerPage";

type TSettingSignature = {
  signature_type: 0 | 1;
  signature_font_type?:
    | "Adine-Kirnberg"
    | "champignonaltswash"
    | "FormalScript"
    | "HerrVonMuellerhoff-Regular"
    | "MrsSaintDelafield-Regular"
    | "SCRIPTIN"
    | "";
  signature_image: any;
}

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

const SIGNATURE_PROPERTY_HEIGHT_DEFAULT: number = 50;
const SIGNATURE_PROPERTY_WIDTH_DEFAULT: number = 80;

// ini untuk onChange add signer
export const onChangeaddSigner = (signer: TSigner, currentType: string, currentName: string, currentValue: string) => {
  const settingSigner = [{
    type: "text",
    name: "signer_signature_user_identifier",
    result: {
      ...signer, user_identifier: currentValue
    }
  },
  {
    type: "radio",
    name: "signer_signature_page",
    value: ["signer_signature_page_all", "signer_signature_page_selective"],
    result: {
      ...signer, pageType: currentValue
    }
  },
  {
    type: "text",
    name: "signer_signature_page_selective_text",
    result: {
      ...signer, page: currentValue
    }
  }
]

  const filter = settingSigner.filter((item) => (item.type === currentType && item.name === currentName) || (item.type === 'radio' && item.value?.includes(currentValue)))
  if(filter.length){
    return filter[0].result
  }
  return null; 
}

export const editSignatureToCanvasImage = (
  base64: string,
  user_identifier: TSigner["user_identifier"],
  requestSignJson: TRequestSignJson
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

  return requestSignJsonMock
};

export const generateArrSignature = (
  signers: TSigners, 
  requestSignJson: TRequestSignJson
  ): TSignature[] => {
  return signers.map((el, elIdx) => ({
    ...requestSignJson.signatures[elIdx],
    user_identifier: el.user_identifier,
  }));
};

export const generateArrSignatureProperty = (
  signers: TSigners,
  requestSignJson: TRequestSignJson
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

  // filter
  const signerValid: {
    user_identifier: TSigner["user_identifier"];
    page_number: TSignatureProperty["page_number"];
  }[] = [];
  signers.forEach((el) => {
    const signerPagesString = generateFormatedSignerPage(el.page);
    const signerPagesStringToArr = signerPagesString.split(",");

    signerPagesStringToArr.forEach((page) => {
      if (signerPagesString.includes(page)) {
        signerValid.push({
          user_identifier: el.user_identifier,
          page_number: parseInt(page),
        });
      }
    });
  });

  arrSignatureProperty = arrSignatureProperty.filter((sp) => {
    if (
      signerValid.findIndex(
        (sv) =>
          sv.user_identifier === sp.user_identifier &&
          sv.page_number === sp.page_number
      ) !== -1
    ) {
      return sp;
    } else {
      return;
    }
  });

  return arrSignatureProperty;
};

export const updateDraggableCoordinate = (
  requestSignJson: TRequestSignJson,
  draggableData: TDraggableData
): TRequestSignJson => {
  
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

  return requestSignJsonMock
}

export const generateDefaultSignature = (
  signature_type: TSettingSignature["signature_type"], 
  signature_font_type: TSettingSignature["signature_font_type"],
  signature_image: any,
  imageURL: string
  ): TSettingSignature => {
    return {
      signature_type,
      signature_font_type: signature_type === 0 ? "": signature_font_type,
      signature_image: signature_type === 1 ? (imageURL as string) : signature_image
    }
}

