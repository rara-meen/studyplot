import React from "react";
import { useNavigate } from "react-router-dom";
import { FiBookOpen, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import PageHeader from "../../components/shared/PageHeader";
import Card from "../../components/shared/Card";
import EmptyState from "../../components/shared/EmptyState";
import DocumentCardSkeleton from "../../components/shared/DocumentCardSkeleton";
import { useDocuments } from "../../hooks/useDocuments";
import { formatDate } from "../../utils/formatDate";

const Summary = () => {
  const navigate = useNavigate();
  const { documents, isLoading, error } = useDocuments();

  return (
    <div>
      <PageHeader
        title="Summary"
        description="Pick a document to generate or view its AI summary."
      />

      {isLoading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <DocumentCardSkeleton key={index} />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <EmptyState icon={FiBookOpen} title="Couldn't load your documents" description={error} />
      )}

      {!isLoading && !error && documents.length === 0 && (
        <EmptyState
          icon={FiBookOpen}
          title="No documents yet"
          description="Upload a PDF first, then come back here to generate an AI summary."
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
              onClick={() => navigate(`/summary/${document.id}`)}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-brand-primary text-white">
                  <FiBookOpen size={20} />
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
                {document.hasSummary ? (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    <FiCheckCircle size={14} />
                    Summary ready
                  </span>
                ) : (
                  <span className="text-xs text-ink-faint dark:text-ink-dark-faint">Not summarized yet</span>
                )}
                <FiArrowRight className="text-ink-faint dark:text-ink-dark-faint" size={16} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Summary;
