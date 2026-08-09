import React from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { FiFileText, FiUpload } from "react-icons/fi";
import PageHeader from "../../components/shared/PageHeader";
import Button from "../../components/shared/Button";
import EmptyState from "../../components/shared/EmptyState";
import DocumentCard from "../../components/shared/DocumentCard";
import DocumentCardSkeleton from "../../components/shared/DocumentCardSkeleton";
import { useDocuments } from "../../hooks/useDocuments";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/getErrorMessage";

const Documents = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { documents, isLoading, error, deleteDocument } = useDocuments();

  const handleOpen = (id) => {
    navigate(`/documents/${id}`);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDocument(id);
      toast.success("Document deleted.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't delete that document."));
    }
  };

  return (
    <div>
      <PageHeader
        title="Documents"
        description="All the PDFs you've uploaded to StudyPlot."
        action={
          <Button size="sm" onClick={() => navigate("/upload")}>
            <FiUpload />
            Upload PDF
          </Button>
        }
      />

      {isLoading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <DocumentCardSkeleton key={index} />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <EmptyState
          icon={FiFileText}
          title="Couldn't load your documents"
          description={error}
        />
      )}

      {!isLoading && !error && documents.length === 0 && (
        <EmptyState
          icon={FiFileText}
          title="No documents yet"
          description="Upload a PDF to start generating summaries, flashcards, and quizzes."
          actionLabel="Upload PDF"
          onAction={() => navigate("/upload")}
        />
      )}

      {!isLoading && !error && documents.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {documents.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onOpen={handleOpen}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Documents;
