import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiFileText, FiTrash2, FiExternalLink, FiFile, FiCheckCircle } from "react-icons/fi";
import Card from "./Card";
import Button from "./Button";
import { formatDate } from "../../utils/formatDate";

const DocumentCard = ({ document, onOpen, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setIsDeleting(true);
    await onDelete(document.id);
    setIsDeleting(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Card hoverable className="flex h-full flex-col">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white">
            <FiFile size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h3
              className="truncate font-display text-base font-bold text-ink dark:text-ink-dark"
              title={document.title}
            >
              {document.title || document.originalFilename}
            </h3>
            <p className="mt-0.5 truncate text-xs text-ink-faint dark:text-ink-dark-faint">
              {document.originalFilename}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-muted dark:text-ink-dark-muted">
          <span>{formatDate(document.uploadedAt)}</span>
          <span className="flex items-center gap-1">
            <FiFileText size={13} />
            {document.pageCount} {document.pageCount === 1 ? "page" : "pages"}
          </span>
          <span>{document.fileSizeLabel}</span>
          {document.hasSummary && (
            <span className="flex items-center gap-1 font-medium text-success">
              <FiCheckCircle size={13} />
              Summarized
            </span>
          )}
        </div>

        <div className="mt-5 flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="flex-1"
            onClick={() => onOpen(document.id)}
          >
            <FiExternalLink size={15} />
            Open
          </Button>
          <Button
            size="sm"
            variant={confirmDelete ? "danger" : "ghost"}
            className="flex-1"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <FiTrash2 size={15} />
            {confirmDelete ? "Confirm" : "Delete"}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default DocumentCard;
