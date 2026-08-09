import { useCallback, useState } from "react";
import { summaryService } from "../services/summaryService";
import { getErrorMessage } from "../utils/getErrorMessage";

export const useSummary = () => {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCached, setIsCached] = useState(false);
  const [generatedAt, setGeneratedAt] = useState(null);

  const generate = useCallback(
    async (documentId, { regenerate = false } = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await summaryService.generate(documentId, { regenerate });
        setSummary(data.summary);
        setIsCached(data.cached);
        setGeneratedAt(data.generatedAt);
        return { success: true, summary: data.summary };
      } catch (err) {
        const message = getErrorMessage(
          err,
          "Couldn't generate a summary for this document."
        );
        setError(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    summary,
    isLoading,
    error,
    isCached,
    generatedAt,
    generate,
  };
};
