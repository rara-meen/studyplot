import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiFileText,
  FiHash,
  FiType,
  FiTrash2,
  FiAlertCircle,
  FiZap,
  FiLayers,
  FiHelpCircle,
  FiMessageSquare,
} from "react-icons/fi";
import PageHeader from "../../components/shared/PageHeader";
import Card from "../../components/shared/Card";
import Button from "../../components/shared/Button";
import Skeleton from "../../components/shared/Skeleton";
import EmptyState from "../../components/shared/EmptyState";
import { documentService } from "../../services/documentService";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { formatDate } from "../../utils/formatDate";

const StatCard = ({ icon: Icon, label, value }) => (
  <Card className="flex items-center gap-3 p-4">
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-primary/[0.08] text-brand-primary">
      <Icon size={16} />
    </div>
    <div>
      <p className="text-xs text-ink-muted dark:text-ink-dark-muted">{label}</p>
      <p className="font-display text-lg font-semibold text-ink dark:text-ink-dark">{value}</p>
    </div>
  </Card>
);

const DocumentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchDocument = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await documentService.getById(id);
        if (isMounted) setDocument(data.document);
      } catch (err) {
        if (isMounted) {
          setError(getErrorMessage(err, "Couldn't load this document."));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDocument();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await documentService.remove(id);
      toast.success("Document deleted.");
      navigate("/documents");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't delete this document."));
      setIsDeleting(false);
    }
  };

  const wordCount = document?.extractedText
    ? document.extractedText.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const charCount = document?.extractedText?.length || 0;

  if (isLoading) {
    return (
      <div>
        <Skeleton className="mb-8 h-9 w-64" />
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !document) {
    return (
      <EmptyState
        icon={FiAlertCircle}
        title="Document not found"
        description={error || "This document may have been deleted."}
        actionLabel="Back to Documents"
        onAction={() => navigate("/documents")}
      />
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate("/documents")}
        className="mb-4 flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink dark:text-ink-dark-muted dark:hover:text-ink-dark"
      >
        <FiArrowLeft size={15} />
        Back to Documents
      </button>

      <PageHeader
        title={document.title || document.originalFilename}
        description={`Uploaded ${formatDate(document.uploadedAt)} · ${document.originalFilename}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => navigate(`/summary/${document.id}`)}>
              <FiZap size={15} />
              {document.hasSummary ? "View Summary" : "Generate Summary"}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/chat/${document.id}`)}
            >
              <FiMessageSquare size={15} />
              Chat
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/flashcards/${document.id}`)}
            >
              <FiLayers size={15} />
              Flashcards
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/quiz/${document.id}`)}
            >
              <FiHelpCircle size={15} />
              Quiz
            </Button>
            <Button variant="secondary" size="sm" onClick={handleDelete} disabled={isDeleting}>
              <FiTrash2 size={15} />
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </div>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={FiFileText} label="Pages" value={document.pageCount} />
        <StatCard icon={FiType} label="Words" value={wordCount.toLocaleString()} />
        <StatCard icon={FiHash} label="Characters" value={charCount.toLocaleString()} />
        <StatCard icon={FiFileText} label="File size" value={document.fileSizeLabel} />
      </div>

      <Card>
        <h2 className="mb-3 font-display text-lg font-semibold text-ink dark:text-ink-dark">
          Extracted text preview
        </h2>
        {document.extractedText ? (
          <div className="scrollbar-thin max-h-[28rem] overflow-y-auto rounded-lg border border-border bg-surface-subtle p-4 dark:border-border-dark dark:bg-white/[0.03]">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-muted dark:text-ink-dark-muted">
              {document.extractedText}
            </p>
          </div>
        ) : (
          <p className="text-sm text-ink-muted dark:text-ink-dark-muted">
            No text could be extracted from this document.
          </p>
        )}
      </Card>
    </div>
  );
};

export default DocumentDetails;
