import React, { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiUploadCloud,
  FiCheckCircle,
  FiAlertCircle,
  FiFile,
  FiArrowRight,
  FiX,
} from "react-icons/fi";
import PageHeader from "../../components/shared/PageHeader";
import Card from "../../components/shared/Card";
import Button from "../../components/shared/Button";
import ProgressBar from "../../components/shared/ProgressBar";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import { useUpload, UPLOAD_STATUS } from "../../hooks/useUpload";
import { useToast } from "../../context/ToastContext";

const Upload = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const { status, progress, error, uploadedDocument, upload, reset } =
    useUpload();

  const handleFileSelect = useCallback(
    (file) => {
      if (!file) return;
      setSelectedFile(file);
      reset();
    },
    [reset]
  );

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files?.[0];
      handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const startUpload = async () => {
    if (!selectedFile) return;
    const result = await upload(selectedFile);
    if (result.success) {
      toast.success("Document uploaded and parsed successfully.");
    } else {
      toast.error(result.error);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    reset();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isUploading = status === UPLOAD_STATUS.UPLOADING;
  const isSuccess = status === UPLOAD_STATUS.SUCCESS;
  const isError = status === UPLOAD_STATUS.ERROR;

  return (
    <div>
      <PageHeader
        title="Upload"
        description="Add a PDF to your workspace to view and organize it."
      />

      <Card className="mx-auto max-w-2xl">
        <AnimatePresence mode="wait">
          {isSuccess && uploadedDocument ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center py-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400"
              >
                <FiCheckCircle size={32} />
              </motion.div>
              <h3 className="font-display text-lg font-semibold text-ink dark:text-ink-dark">
                Upload complete
              </h3>
              <p className="mt-1 max-w-sm text-sm text-ink-muted dark:text-ink-dark-muted">
                {uploadedDocument.title} was parsed successfully —{" "}
                {uploadedDocument.pageCount}{" "}
                {uploadedDocument.pageCount === 1 ? "page" : "pages"},{" "}
                {uploadedDocument.fileSizeLabel}.
              </p>

              <Button className="mt-6" onClick={() => navigate(`/summary/${uploadedDocument.id}`)}>
                View Summary
                <FiArrowRight />
              </Button>

              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => navigate("/notes")}>
                  Create Notes
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/flashcards/${uploadedDocument.id}`)}
                >
                  Generate Flashcards
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/quiz/${uploadedDocument.id}`)}
                >
                  Generate Quiz
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/chat/${uploadedDocument.id}`)}
                >
                  Chat with Document
                </Button>
              </div>

              <button
                onClick={handleReset}
                className="mt-4 text-xs font-medium text-ink-faint hover:text-ink dark:text-ink-dark-faint dark:hover:text-ink-dark"
              >
                Upload another
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="uploader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center rounded-xl2 border-2 border-dashed px-6 py-14 text-center transition-colors ${
                  isDragging
                    ? "border-accent-blue bg-accent-blue/5"
                    : "border-border dark:border-border-dark"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  aria-label="Choose a PDF file"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files?.[0])}
                />

                {isUploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <LoadingSpinner size="lg" />
                    <p className="text-sm font-medium text-ink dark:text-ink-dark">
                      Uploading and parsing your PDF…
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary/[0.08] text-brand-primary">
                      <FiUploadCloud size={26} />
                    </div>
                    <p className="font-display text-base font-semibold text-ink dark:text-ink-dark">
                      Drag & drop your PDF here
                    </p>
                    <p className="mt-1 text-sm text-ink-muted dark:text-ink-dark-muted">
                      or click below to browse — up to 20MB
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-5"
                      onClick={handleBrowse}
                    >
                      Choose file
                    </Button>
                  </>
                )}
              </div>

              {selectedFile && !isUploading && (
                <div className="mt-4 flex items-center gap-3 rounded-lg border border-border px-4 py-3 dark:border-border-dark">
                  <FiFile className="flex-shrink-0 text-accent-blue" />
                  <span className="min-w-0 flex-1 truncate text-sm text-ink dark:text-ink-dark">
                    {selectedFile.name}
                  </span>
                  <button
                    onClick={handleReset}
                    className="flex-shrink-0 text-ink-faint hover:text-ink dark:text-ink-dark-faint dark:hover:text-ink-dark"
                    aria-label="Remove selected file"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              )}

              {isUploading && (
                <div className="mt-4">
                  <ProgressBar progress={progress} />
                  <p className="mt-1.5 text-right text-xs text-ink-muted dark:text-ink-dark-muted">
                    {progress}%
                  </p>
                </div>
              )}

              {isError && error && (
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300">
                  <FiAlertCircle className="mt-0.5 flex-shrink-0" size={16} />
                  <span>{error}</span>
                </div>
              )}

              {selectedFile && !isUploading && (
                <Button className="mt-5 w-full" onClick={startUpload}>
                  <FiUploadCloud />
                  Upload PDF
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};

export default Upload;
