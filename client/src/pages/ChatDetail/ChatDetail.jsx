import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  FiArrowLeft,
  FiSend,
  FiCopy,
  FiRefreshCw,
  FiTrash2,
  FiAlertCircle,
  FiMessageSquare,
  FiCheck,
} from "react-icons/fi";
import Button from "../../components/shared/Button";
import Skeleton from "../../components/shared/Skeleton";
import EmptyState from "../../components/shared/EmptyState";
import { documentService } from "../../services/documentService";
import { useChat } from "../../hooks/useChat";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { formatTime } from "../../utils/formatTime";
import { cn } from "../../utils/cn";

const SUGGESTED_PROMPTS = [
  "Summarize this document",
  "Explain this topic simply",
  "Generate revision notes",
  "Quiz me",
  "What are the key concepts?",
];

const TypingIndicator = () => (
  <div className="flex items-center gap-1.5 px-1 py-1">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint dark:bg-ink-dark-faint"
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </div>
);

const CopyButton = ({ content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable — silently ignore, non-critical.
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-ink-faint transition-colors hover:bg-brand-primary/[0.06] hover:text-ink dark:text-ink-dark-faint dark:hover:bg-white/[0.06] dark:hover:text-ink-dark"
      aria-label="Copy response"
    >
      {copied ? <FiCheck size={12} /> : <FiCopy size={12} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
};

const ChatDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [document, setDocument] = useState(null);
  const [isLoadingDoc, setIsLoadingDoc] = useState(true);
  const [docError, setDocError] = useState(null);
  const [input, setInput] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  const {
    messages,
    isLoadingHistory,
    isSending,
    error,
    loadHistory,
    sendMessage,
    clearConversation,
  } = useChat();

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDocument = async () => {
      setIsLoadingDoc(true);
      setDocError(null);
      try {
        const data = await documentService.getById(id);
        if (isMounted) setDocument(data.document);
      } catch (err) {
        if (isMounted) {
          setDocError(getErrorMessage(err, "Couldn't load this document."));
        }
      } finally {
        if (isMounted) setIsLoadingDoc(false);
      }
    };

    fetchDocument();
    loadHistory(id);

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isSending]);

  useEffect(() => {
    if (!isSending && !isLoadingHistory) {
      inputRef.current?.focus();
    }
  }, [isSending, isLoadingHistory]);

  const handleSend = async (textOverride) => {
    const text = (textOverride ?? input).trim();
    if (!text || isSending) return;

    setInput("");
    const result = await sendMessage(id, text);
    if (!result.success) {
      toast.error(result.error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePromptClick = (prompt) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const handleRegenerate = () => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMessage) handleSend(lastUserMessage.content);
  };

  const handleClear = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    const result = await clearConversation(id);
    if (result.success) {
      toast.success("Conversation cleared.");
    } else {
      toast.error(result.error);
    }
    setConfirmClear(false);
  };

  const lastAssistantId = [...messages].reverse().find((m) => m.role === "assistant")?.id;
  const hasMessages = messages.length > 0;

  if (isLoadingDoc) {
    return (
      <div className="flex h-[calc(100vh-15.5rem)] flex-col lg:h-[calc(100vh-8rem)]">
        <Skeleton className="mb-4 h-9 w-64" />
        <Skeleton className="flex-1" />
      </div>
    );
  }

  if (docError || !document) {
    return (
      <EmptyState
        icon={FiAlertCircle}
        title="Document not found"
        description={docError || "This document may have been deleted."}
        actionLabel="Back to Chat"
        onAction={() => navigate("/chat")}
      />
    );
  }

  return (
    <div className="flex h-[calc(100vh-15.5rem)] flex-col lg:h-[calc(100vh-8rem)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <button
            onClick={() => navigate("/chat")}
            className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink dark:text-ink-dark-muted dark:hover:text-ink-dark"
          >
            <FiArrowLeft size={15} />
            Back to Chat
          </button>
          <h1 className="mt-1.5 truncate font-display text-xl font-bold text-ink dark:text-ink-dark">
            {document.title || document.originalFilename}
          </h1>
        </div>

        {hasMessages && (
          <Button
            variant={confirmClear ? "danger" : "secondary"}
            size="sm"
            className="flex-shrink-0"
            onClick={handleClear}
            onBlur={() => setConfirmClear(false)}
          >
            <FiTrash2 size={14} />
            {confirmClear ? "Confirm clear" : "Clear"}
          </Button>
        )}
      </div>

      {/* Message list */}
      <div
        ref={scrollRef}
        className="scrollbar-thin surface-card min-h-0 flex-1 overflow-y-auto p-4 sm:p-6"
      >
        {isLoadingHistory && (
          <div className="space-y-4">
            <Skeleton className="ml-auto h-10 w-1/2" />
            <Skeleton className="h-16 w-2/3" />
          </div>
        )}

        {!isLoadingHistory && !hasMessages && (
          <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary/[0.08] text-brand-primary">
              <FiMessageSquare size={26} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-ink dark:text-ink-dark">
                Ask Gemini about this document
              </h3>
              <p className="mt-1 max-w-sm text-sm text-ink-muted dark:text-ink-dark-muted">
                Questions are answered using the content of this PDF.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handlePromptClick(prompt)}
                  className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:border-brand-primary/30 hover:text-ink dark:border-border-dark dark:bg-night dark:text-ink-dark-muted dark:hover:text-ink-dark"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {!isLoadingHistory && hasMessages && (
          <div className="space-y-5">
            <AnimatePresence initial={false}>
              {messages.map((message) => {
                const isUser = message.role === "user";
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={cn("flex", isUser ? "justify-end" : "justify-start")}
                  >
                    <div className={cn("max-w-[88%] sm:max-w-[75%]", isUser && "flex flex-col items-end")}>
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                          isUser
                            ? "rounded-br-md bg-brand-primary text-white"
                            : "rounded-bl-md border border-border bg-surface text-ink dark:border-border-dark dark:bg-night dark:text-ink-dark"
                        )}
                      >
                        {isUser ? (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        ) : (
                          <div className="prose-chat">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        )}
                      </div>

                      <div className="mt-1 flex items-center gap-2 px-1">
                        <span className="text-[11px] text-ink-faint dark:text-ink-dark-faint">
                          {formatTime(message.createdAt)}
                        </span>
                        {!isUser && (
                          <>
                            <CopyButton content={message.content} />
                            {message.id === lastAssistantId && !isSending && (
                              <button
                                onClick={handleRegenerate}
                                className="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-ink-faint transition-colors hover:bg-brand-primary/[0.06] hover:text-ink dark:text-ink-dark-faint dark:hover:bg-white/[0.06] dark:hover:text-ink-dark"
                                aria-label="Regenerate response"
                              >
                                <FiRefreshCw size={12} />
                                Regenerate
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {isSending && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="rounded-2xl rounded-bl-md border border-border bg-surface px-4 py-2.5 dark:border-border-dark dark:bg-night">
                  <TypingIndicator />
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300">
          <FiAlertCircle className="mt-0.5 flex-shrink-0" size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Composer */}
      <div className="mt-3 flex items-end gap-2">
        <textarea
          ref={inputRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about this document…"
          aria-label="Message"
          disabled={isSending}
          className="scrollbar-thin max-h-32 min-h-[2.75rem] flex-1 resize-none rounded-2xl border border-border bg-surface-card px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-brand-primary/40 focus:outline-none focus:ring-4 focus:ring-brand-primary/10 disabled:opacity-60 dark:border-border-dark dark:bg-night-raised dark:text-ink-dark dark:placeholder:text-ink-dark-faint"
        />
        <Button
          size="md"
          className="!rounded-full !px-4"
          onClick={() => handleSend()}
          disabled={!input.trim() || isSending}
          aria-label="Send message"
        >
          <FiSend size={16} />
        </Button>
      </div>
    </div>
  );
};

export default ChatDetail;
