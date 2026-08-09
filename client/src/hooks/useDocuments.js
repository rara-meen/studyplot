import { useCallback, useEffect, useState } from "react";
import { documentService } from "../services/documentService";
import { withRetry } from "../utils/retry";
import { getErrorMessage } from "../utils/getErrorMessage";

export const useDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await withRetry(() => documentService.list());
      setDocuments(data.documents || []);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load your documents."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const deleteDocument = useCallback(async (id) => {
    await documentService.remove(id);
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  }, []);

  return {
    documents,
    isLoading,
    error,
    refetch: fetchDocuments,
    deleteDocument,
  };
};
