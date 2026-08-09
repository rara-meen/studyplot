import { useCallback, useState } from "react";
import { uploadService, validateFile } from "../services/uploadService";
import { getErrorMessage } from "../utils/getErrorMessage";

export const UPLOAD_STATUS = {
  IDLE: "idle",
  UPLOADING: "uploading",
  SUCCESS: "success",
  ERROR: "error",
};

export const useUpload = () => {
  const [status, setStatus] = useState(UPLOAD_STATUS.IDLE);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadedDocument, setUploadedDocument] = useState(null);

  const reset = useCallback(() => {
    setStatus(UPLOAD_STATUS.IDLE);
    setProgress(0);
    setError(null);
    setUploadedDocument(null);
  }, []);

  const upload = useCallback(async (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setStatus(UPLOAD_STATUS.ERROR);
      setError(validationError);
      return { success: false, error: validationError };
    }

    setStatus(UPLOAD_STATUS.UPLOADING);
    setProgress(0);
    setError(null);

    try {
      const data = await uploadService.upload(file, setProgress);
      setStatus(UPLOAD_STATUS.SUCCESS);
      setUploadedDocument(data.document);
      return { success: true, document: data.document };
    } catch (err) {
      const message = getErrorMessage(err, "Upload failed. Please try again.");
      setStatus(UPLOAD_STATUS.ERROR);
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  return {
    status,
    progress,
    error,
    uploadedDocument,
    upload,
    reset,
  };
};
