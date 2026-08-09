import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiBookOpen,
  FiList,
  FiTag,
  FiCheckCircle,
  FiTarget,
  FiRefreshCw,
  FiZap,
  FiAlertCircle,
  FiEdit3,
  FiLayers,
  FiHelpCircle,
  FiMessageSquare,
} from "react-icons/fi";
import PageHeader from "../../components/shared/PageHeader";
import Card from "../../components/shared/Card";
import Button from "../../components/shared/Button";
import Skeleton from "../../components/shared/Skeleton";
import EmptyState from "../../components/shared/EmptyState";
import AiLoadingStages from "../../components/shared/AiLoadingStages";
import SummarySectionCard from "../../components/shared/SummarySectionCard";
import { documentService } from "../../services/documentService";
import { noteService } from "../../services/noteService";
import { useSummary } from "../../hooks/useSummary";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { formatDate } from "../../utils/formatDate";

const hasSummaryContent = (summary) => Boolean(summary?.shortSummary);

const SummaryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [document, setDocument] = useState(null);
  const [isLoadingDoc, setIsLoadingDoc] = useState(true);
  const [docError, setDocError] = useState(null);
  const [displaySummary, setDisplaySummary] = useState(null);

  const { isLoading: isGenerating, error: genError, generate } = useSummary();
  const [isSavingNote, setIsSavingNote] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchDocument = async () => {
      setIsLoadingDoc(true);
      setDocError(null);
      try {
        const data = await documentService.getById(id);
        if (!isMounted) return;
        setDocument(data.document);
        if (hasSummaryContent(data.document.summary)) {
          setDisplaySummary(data.document.summary);
        }
      } catch (err) {
        if (isMounted) {
          setDocError(getErrorMessage(err, "Couldn't load this document."));
        }
      } finally {
        if (isMounted) setIsLoadingDoc(false);
      }
    };

    fetchDocument();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleGenerate = async (regenerate = false) => {
    const result = await generate(id, { regenerate });
    if (result.success) {
      setDisplaySummary(result.summary);
      toast.success(
        regenerate ? "Summary regenerated." : "Summary generated successfully."
      );
    } else {
      toast.error(result.error);
    }
  };

  const handleSaveToNotes = async () => {
    if (!displaySummary) return;
    setIsSavingNote(true);
    try {
      const content = [displaySummary.shortSummary, displaySummary.detailedSummary]
        .filter(Boolean)
        .join("\n\n");
      await noteService.create({
        title: document.title || document.originalFilename,
        content,
        documentId: document.id,
      });
      toast.success("Summary saved to Notes.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't save this summary to Notes."));
    } finally {
      setIsSavingNote(false);
    }
  };

  if (isLoadingDoc) {
    return (
      <div>
        <Skeleton className="mb-8 h-9 w-64" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (docError || !document) {
    return (
      <EmptyState
        icon={FiAlertCircle}
        title="Document not found"
        description={docError || "This document may have been deleted."}
        actionLabel="Back to Summary"
        onAction={() => navigate("/summary")}
      />
    );
  }

  const sections = displaySummary
    ? [
        {
          key: "shortSummary",
          title: "Short Summary",
          icon: FiZap,
          variant: "prose",
          content: displaySummary.shortSummary,
        },
        {
          key: "detailedSummary",
          title: "Detailed Summary",
          icon: FiBookOpen,
          variant: "prose",
          content: displaySummary.detailedSummary,
        },
        {
          key: "keyTakeaways",
          title: "Key Takeaways",
          icon: FiList,
          variant: "list",
          content: displaySummary.keyTakeaways,
        },
        {
          key: "definitions",
          title: "Important Definitions",
          icon: FiTag,
          variant: "list",
          content: displaySummary.definitions,
        },
        {
          key: "importantFacts",
          title: "Important Facts",
          icon: FiCheckCircle,
          variant: "list",
          content: displaySummary.importantFacts,
        },
        {
          key: "examTips",
          title: "Exam Tips",
          icon: FiTarget,
          variant: "list",
          content: displaySummary.examTips,
        },
      ]
    : [];

  return (
    <div>
      <button
        onClick={() => navigate("/summary")}
        className="mb-4 flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink dark:text-ink-dark-muted dark:hover:text-ink-dark"
      >
        <FiArrowLeft size={15} />
        Back to Summary
      </button>

      <PageHeader
        title={document.title || document.originalFilename}
        description={`${document.pageCount} ${
          document.pageCount === 1 ? "page" : "pages"
        } · ${document.fileSizeLabel}`}
        action={
          displaySummary && !isGenerating ? (
            <Button variant="secondary" size="sm" onClick={() => handleGenerate(true)}>
              <FiRefreshCw size={15} />
              Regenerate Summary
            </Button>
          ) : null
        }
      />

      {!displaySummary && !isGenerating && (
        <Card className="flex flex-col items-center py-14 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary/[0.08] text-brand-primary">
            <FiZap size={26} />
          </div>
          <h3 className="font-display text-lg font-semibold text-ink dark:text-ink-dark">
            No summary yet
          </h3>
          <p className="mt-1 max-w-sm text-sm text-ink-muted dark:text-ink-dark-muted">
            Generate an AI-powered summary covering the key ideas, definitions,
            and facts in this document.
          </p>
          <Button className="mt-6" onClick={() => handleGenerate(false)}>
            <FiZap />
            Generate Summary
          </Button>

          {genError && (
            <div className="mt-5 flex max-w-sm items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-left text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300">
              <FiAlertCircle className="mt-0.5 flex-shrink-0" size={16} />
              <span>{genError}</span>
            </div>
          )}
        </Card>
      )}

      {isGenerating && (
        <Card>
          <AiLoadingStages />
        </Card>
      )}

      {displaySummary && !isGenerating && (
        <>
          {document.summaryGeneratedAt && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 text-xs text-ink-faint dark:text-ink-dark-faint"
            >
              Last generated {formatDate(document.summaryGeneratedAt)}
            </motion.p>
          )}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {sections.map((section, index) => (
              <div
                key={section.key}
                className={
                  section.key === "shortSummary" || section.key === "detailedSummary"
                    ? "lg:col-span-2"
                    : ""
                }
              >
                <SummarySectionCard
                  icon={section.icon}
                  title={section.title}
                  content={section.content}
                  variant={section.variant}
                  index={index}
                />
              </div>
            ))}
          </div>

          {genError && (
            <div className="mt-5 flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300">
              <FiAlertCircle className="mt-0.5 flex-shrink-0" size={16} />
              <span>{genError}</span>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-6 dark:border-border-dark">
            <Button variant="secondary" size="sm" onClick={handleSaveToNotes} disabled={isSavingNote}>
              <FiEdit3 size={14} />
              {isSavingNote ? "Saving…" : "Save to Notes"}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate(`/flashcards/${document.id}`)}>
              <FiLayers size={14} />
              Generate Flashcards
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate(`/quiz/${document.id}`)}>
              <FiHelpCircle size={14} />
              Generate Quiz
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate(`/chat/${document.id}`)}>
              <FiMessageSquare size={14} />
              Ask AI
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default SummaryDetail;
