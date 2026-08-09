import api from "./api";

export const ALLOWED_MIME_TYPE = "application/pdf";
export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

export const validateFile = (file) => {
  if (!file) {
    return "Please choose a file to upload.";
  }
  if (file.type !== ALLOWED_MIME_TYPE) {
    return "Only PDF files are supported.";
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "That file is too large. Please upload a PDF up to 20MB.";
  }
  return null;
};

export const uploadService = {
  upload: async (file, onProgress) => {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 0, // Large PDFs over slow connections legitimately take a while — the progress bar already gives feedback.
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          const percent = Math.round((event.loaded * 100) / event.total);
          onProgress(percent);
        }
      },
    });

    return data;
  },
};
