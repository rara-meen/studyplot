import { useCallback, useState } from "react";
import { chatService } from "../services/chatService";
import { getErrorMessage } from "../utils/getErrorMessage";

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  const loadHistory = useCallback(async (documentId) => {
    setIsLoadingHistory(true);
    setError(null);
    try {
      const data = await chatService.getHistory(documentId);
      setMessages(data.messages || []);
      return { success: true, messages: data.messages || [] };
    } catch (err) {
      const message = getErrorMessage(err, "Couldn't load this conversation.");
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  const sendMessage = useCallback(async (documentId, text) => {
    setError(null);

    // Optimistically show the user's message right away.
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: tempId, role: "user", content: text, createdAt: new Date().toISOString() },
    ]);
    setIsSending(true);

    try {
      const data = await chatService.send(documentId, text);
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempId),
        data.userMessage,
        data.assistantMessage,
      ]);
      return { success: true, reply: data.assistantMessage };
    } catch (err) {
      const message = getErrorMessage(
        err,
        "Something went wrong while contacting Gemini. Please try again."
      );
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsSending(false);
    }
  }, []);

  const clearConversation = useCallback(async (documentId) => {
    try {
      await chatService.clear(documentId);
      setMessages([]);
      return { success: true };
    } catch (err) {
      const message = getErrorMessage(err, "Couldn't clear this conversation.");
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  return {
    messages,
    isLoadingHistory,
    isSending,
    error,
    loadHistory,
    sendMessage,
    clearConversation,
  };
};
