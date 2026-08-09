import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiFileText,
  FiUpload,
  FiHelpCircle,
  FiMessageSquare,
  FiEdit3,
  FiArrowRight,
  FiLayers,
} from "react-icons/fi";
import PageHeader from "../../components/shared/PageHeader";
import Card from "../../components/shared/Card";
import EmptyState from "../../components/shared/EmptyState";
import Button from "../../components/shared/Button";
import DocumentCard from "../../components/shared/DocumentCard";
import DocumentCardSkeleton from "../../components/shared/DocumentCardSkeleton";
import Skeleton from "../../components/shared/Skeleton";
import { useDocuments } from "../../hooks/useDocuments";
import { useNotes } from "../../hooks/useNotes";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { analyticsService } from "../../services/analyticsService";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { formatDate } from "../../utils/formatDate";

const quickActions = [
  { label: "Upload PDF", icon: FiUpload, to: "/upload", tint: "text-brand-primary bg-brand-primary/10" },
  { label: "Open AI Chat", icon: FiMessageSquare, to: "/chat", tint: "text-brand-secondary bg-brand-secondary/10" },
  { label: "Create Note", icon: FiEdit3, to: "/notes", tint: "text-success bg-success/10" },
  { label: "Generate Quiz", icon: FiHelpCircle, to: "/quiz", tint: "text-brand-accent bg-brand-accent/10" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const { documents, isLoading: isLoadingDocs, deleteDocument } = useDocuments();
  const { notes, isLoading: isLoadingNotes, fetchNotes } = useNotes();

  const [recent, setRecent] = useState({ recentFlashcards: [], recentQuizzes: [] });
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);

  useEffect(() => {
    fetchNotes();
    analyticsService
      .getRecent()
      .then((data) => setRecent(data))
      .catch(() => setRecent({ recentFlashcards: [], recentQuizzes: [] }))
      .finally(() => setIsLoadingRecent(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recentDocuments = documents.slice(0, 3);
  const recentNotes = notes.slice(0, 3);
  const { recentFlashcards, recentQuizzes } = recent;

  const handleOpen = (id) => navigate(`/documents/${id}`);

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
        title={`Welcome back,\u00A0@${user?.username} \uD83D\uDC4B`}
        description="Continue your learning journey."
        action={
          <Button size="sm" onClick={() => navigate("/upload")}>
            <FiUpload size={15} />
            Upload PDF
          </Button>
        }
      />

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="mb-4 font-display text-lg font-bold text-ink dark:text-ink-dark">
          Quick actions
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map(({ label, icon: Icon, to, tint }) => (
            <button
              key={label}
              onClick={() => navigate(to)}
              className="group flex items-center justify-between rounded-xl2 border border-border bg-surface-card p-4 text-left shadow-card transition-all duration-250 hover:-translate-y-0.5 hover:shadow-card-hover dark:border-border-dark dark:bg-night-card"
            >
              <span className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tint}`}>
                  <Icon size={18} />
                </span>
                <span className="text-sm font-semibold text-ink dark:text-ink-dark">
                  {label}
                </span>
              </span>
              <FiArrowRight
                size={16}
                className="text-ink-faint transition-transform duration-200 group-hover:translate-x-1 group-hover:text-brand-primary dark:text-ink-dark-faint"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Recent PDFs */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink dark:text-ink-dark">
            Recent PDFs
          </h2>
          {recentDocuments.length > 0 && (
            <button
              onClick={() => navigate("/documents")}
              className="flex items-center gap-1 text-sm font-medium text-brand-primary hover:underline"
            >
              View all
              <FiArrowRight size={14} />
            </button>
          )}
        </div>

        {isLoadingDocs && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <DocumentCardSkeleton key={index} />
            ))}
          </div>
        )}

        {!isLoadingDocs && recentDocuments.length === 0 && (
          <Card>
            <EmptyState
              icon={FiFileText}
              title="No PDFs yet"
              description="Upload a PDF to start generating summaries, flashcards, and quizzes."
              actionLabel="Upload PDF"
              onAction={() => navigate("/upload")}
            />
          </Card>
        )}

        {!isLoadingDocs && recentDocuments.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recentDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onOpen={handleOpen}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Notes */}
        <div>
          <h2 className="mb-4 font-display text-lg font-bold text-ink dark:text-ink-dark">
            Recent Notes
          </h2>
          {isLoadingNotes && <Skeleton className="h-32" />}
          {!isLoadingNotes && recentNotes.length === 0 && (
            <Card>
              <p className="text-sm text-ink-muted dark:text-ink-dark-muted">No notes yet.</p>
            </Card>
          )}
          {!isLoadingNotes && recentNotes.length > 0 && (
            <div className="space-y-2.5">
              {recentNotes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => navigate("/notes")}
                  className="block w-full rounded-xl2 border border-border bg-surface-card p-3.5 text-left transition-colors hover:border-border-hover dark:border-border-dark dark:bg-night-card dark:hover:border-border-dark-hover"
                >
                  <p className="truncate text-sm font-semibold text-ink dark:text-ink-dark">
                    {note.title || "Untitled note"}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-faint dark:text-ink-dark-faint">
                    {formatDate(note.updatedAt)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recent Flashcards */}
        <div>
          <h2 className="mb-4 font-display text-lg font-bold text-ink dark:text-ink-dark">
            Recent Flashcards
          </h2>
          {isLoadingRecent && <Skeleton className="h-32" />}
          {!isLoadingRecent && recentFlashcards.length === 0 && (
            <Card>
              <p className="text-sm text-ink-muted dark:text-ink-dark-muted">
                No flashcards yet.
              </p>
            </Card>
          )}
          {!isLoadingRecent && recentFlashcards.length > 0 && (
            <div className="space-y-2.5">
              {recentFlashcards.map((set) => (
                <button
                  key={set.documentId}
                  onClick={() => navigate(`/flashcards/${set.documentId}`)}
                  className="flex w-full items-center gap-3 rounded-xl2 border border-border bg-surface-card p-3.5 text-left transition-colors hover:border-border-hover dark:border-border-dark dark:bg-night-card dark:hover:border-border-dark-hover"
                >
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                    <FiLayers size={14} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink dark:text-ink-dark">
                      {set.documentTitle}
                    </span>
                    <span className="block text-xs text-ink-faint dark:text-ink-dark-faint">
                      {set.count} cards
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recent Quizzes */}
        <div>
          <h2 className="mb-4 font-display text-lg font-bold text-ink dark:text-ink-dark">
            Recent Quizzes
          </h2>
          {isLoadingRecent && <Skeleton className="h-32" />}
          {!isLoadingRecent && recentQuizzes.length === 0 && (
            <Card>
              <p className="text-sm text-ink-muted dark:text-ink-dark-muted">No quizzes yet.</p>
            </Card>
          )}
          {!isLoadingRecent && recentQuizzes.length > 0 && (
            <div className="space-y-2.5">
              {recentQuizzes.map((quiz) => (
                <button
                  key={quiz.id}
                  onClick={() => navigate(`/quiz/${quiz.documentId}`)}
                  className="flex w-full items-center gap-3 rounded-xl2 border border-border bg-surface-card p-3.5 text-left transition-colors hover:border-border-hover dark:border-border-dark dark:bg-night-card dark:hover:border-border-dark-hover"
                >
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand-accent/10 text-brand-accent">
                    <FiHelpCircle size={14} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink dark:text-ink-dark">
                      {quiz.documentTitle}
                    </span>
                    <span className="block text-xs text-ink-faint dark:text-ink-dark-faint">
                      {quiz.difficulty} &middot; {quiz.questionCount} questions
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
