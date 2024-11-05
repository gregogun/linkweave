interface TurboUploadResponse {
  id: string;
  owner: string;
  timestamp: number;
}

export const uploadFileTurbo = async (data: Buffer): Promise<string> => {
  const res = await fetch("https://upload.ardrive.io/v1/tx", {
    method: "POST",
    headers: {
      "content-type": "application/octet-stream",
      accept: "application/json",
    },
    body: data,
  });

  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }

  const uploadInfo: TurboUploadResponse = await res.json();
  console.log({ uploadInfo });

  return uploadInfo.id;
};
