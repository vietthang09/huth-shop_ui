import axiosInstance from "./axiosInstance";

type TFile = {
  format: string;
  created_at: string;
  resource_type: string;
  url: string;
};

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return axiosInstance.post("/cloud/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
