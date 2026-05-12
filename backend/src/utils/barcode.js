import bwipjs from "bwip-js";

export const generateBarcode = async (text) => {
  return await bwipjs.toBuffer({
    bcid: "code128",
    text,
    scale: 3,
    height: 10,
    includetext: false
  });
};
