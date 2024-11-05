import { Tag } from "arweave-graphql";
import { appConfig } from "../config";

export const sleep = (milliseconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

export const gateway = () => {
  if (typeof window !== undefined) {
    const preferredOrDefaultGateway =
      localStorage.getItem("gateway") || appConfig.defaultGateway;
    return preferredOrDefaultGateway;
  } else {
    return appConfig.defaultGateway;
  }
};

export const fileToUint8Array = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  return uint8Array;
};

export const createAndSignDataItem = async (file: File, tags: Tag[]) => {
  const dataToUpload = await fileToUint8Array(file);

  let signed;

  signed = await window.arweaveWallet.signDataItem({
    data: dataToUpload,
    tags,
  });

  // load the result into a DataItem instance
  //@ts-ignore
  const dataItem = new DataItem(signed);

  return dataItem;
};

export const throttle = (fn: Function, wait: number = 300) => {
  let inThrottle: boolean,
    lastFn: ReturnType<typeof setTimeout>,
    lastTime: number;
  return function (this: any) {
    const context = this,
      args = arguments;
    if (!inThrottle) {
      fn.apply(context, args);
      lastTime = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFn);
      lastFn = setTimeout(() => {
        if (Date.now() - lastTime >= wait) {
          fn.apply(context, args);
          lastTime = Date.now();
        }
      }, Math.max(wait - (Date.now() - lastTime), 0));
    }
  };
};

export const hasNonEmptyValue = (obj: any) => {
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && obj[key] !== "") {
      return true;
    }
  }
  return false;
};
