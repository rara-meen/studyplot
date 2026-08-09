import { useCallback, useState } from "react";
import { flashcardService } from "../services/flashcardService";
import { getErrorMessage } from "../utils/getErrorMessage";

export const useFlashcards = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const loadCached = useCallback(async (documentId) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await flashcardService.getByDocument(documentId);
      setFlashcards(data.flashcards || []);
      return { success: true, flashcards: data.flashcards || [] };
    } catch (err) {
      const message = getErrorMessage(
        err,
        "Couldn't load flashcards for this document."
      );
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generate = useCallback(
    async (documentId, { regenerate = false } = {}) => {
      setIsGenerating(true);
      setError(null);
      try {
        const data = await flashcardService.generate(documentId, {
          regenerate,
        });
        setFlashcards(data.flashcards || []);
        return {
          success: true,
          flashcards: data.flashcards || [],
          cached: data.cached,
        };
      } catch (err) {
        const message = getErrorMessage(
          err,
          "Couldn't generate flashcards for this document."
        );
        setError(message);
        return { success: false, error: message };
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  return {
    flashcards,
    isLoading,
    isGenerating,
    error,
    loadCached,
    generate,
  };
};
