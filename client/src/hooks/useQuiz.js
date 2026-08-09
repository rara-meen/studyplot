import { useCallback, useState } from "react";
import { quizService } from "../services/quizService";
import { getErrorMessage } from "../utils/getErrorMessage";

export const useQuiz = () => {
  const [quiz, setQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const loadCached = useCallback(async (documentId, difficulty) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await quizService.getByDocument(documentId, difficulty);
      const found = data.found ? data.quiz : null;
      setQuiz(found);
      return { success: true, quiz: found };
    } catch (err) {
      const message = getErrorMessage(
        err,
        "Couldn't load the quiz for this document."
      );
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generate = useCallback(
    async (documentId, difficulty, { regenerate = false } = {}) => {
      setIsGenerating(true);
      setError(null);
      try {
        const data = await quizService.generate(documentId, difficulty, {
          regenerate,
        });
        setQuiz(data.quiz);
        return { success: true, quiz: data.quiz, cached: data.cached };
      } catch (err) {
        const message = getErrorMessage(
          err,
          "Couldn't generate a quiz for this document."
        );
        setError(message);
        return { success: false, error: message };
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  const submitScore = useCallback(async (documentId, payload) => {
    try {
      const data = await quizService.submitScore(documentId, payload);
      return { success: true, scoreHistory: data.scoreHistory };
    } catch (err) {
      return {
        success: false,
        error: getErrorMessage(err, "Couldn't save your score."),
      };
    }
  }, []);

  return {
    quiz,
    isLoading,
    isGenerating,
    error,
    loadCached,
    generate,
    submitScore,
    setQuiz,
  };
};
