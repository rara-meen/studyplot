import React from "react";
import { useNavigate } from "react-router-dom";
import { FiMessageSquare, FiArrowRight, FiUpload } from "react-icons/fi";
import PageHeader from "../../components/shared/PageHeader";
import Card from "../../components/shared/Card";
import EmptyState from "../../components/shared/EmptyState";
import DocumentCardSkeleton from "../../components/shared/DocumentCardSkeleton";
import { useDocuments } from "../../hooks/useDocuments";
import { formatDate } from "../../utils/formatDate";

const Chat = () => {
  const navigate = useNavigate();
  const { documents, isLoading, error } = useDocuments();

  return (
    <div>
      <PageHeader
        title="AI Chat"
        description="Pick a document to ask Gemini questions grounded in your notes."
      />

      {isLoading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <DocumentCardSkeleton key={index} />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <EmptyState
          icon={FiMessageSquare}
          title="Couldn't load your documents"
          description={error}
        />
      )}

      {!isLoading && !error && documents.length === 0 && (
        <EmptyState
          icon={FiMessageSquare}
          title="No document uploaded yet"
          description="Upload your notes to begin asking AI questions."
          actionLabel="Upload PDF"
          onAction={() => navigate("/upload")}
        />
      )}

      {!isLoading && !error && documents.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((document) => (
            <Card
              key={document.id}
              as="button"
              hoverable
              className="flex w-full cursor-pointer flex-col text-left"
              onClick={() => navigate(`/chat/${document.id}`)}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-brand-primary text-white">
                  <FiMessageSquare size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3
                    className="truncate font-display text-base font-semibold text-ink dark:text-ink-dark"
                    title={document.title}
                  >
                    {document.title || document.originalFilename}
                  </h3>
                  <p className="mt-0.5 text-xs text-ink-faint dark:text-ink-dark-faint">
                    {formatDate(document.uploadedAt)}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <span className="text-xs text-ink-faint dark:text-ink-dark-faint">
                  Ask AI about this document
                </span>
                <FiArrowRight className="text-ink-faint dark:text-ink-dark-faint" size={16} />
              </div>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && !error && documents.length > 0 && (
        <button
          onClick={() => navigate("/upload")}
          className="mt-6 flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:underline"
        >
          <FiUpload size={14} />
          Upload another document
        </button>
      )}
    </div>
  );
};

export default Chat;
