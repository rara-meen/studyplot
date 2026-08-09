import React, { useEffect, useMemo, useState } from "react";
import {
  FiPlus,
  FiTrash2,
  FiSave,
  FiFileText,
  FiArrowLeft,
  FiZap,
  FiList,
  FiWind,
} from "react-icons/fi";
import PageHeader from "../../components/shared/PageHeader";
import Card from "../../components/shared/Card";
import Button from "../../components/shared/Button";
import EmptyState from "../../components/shared/EmptyState";
import Skeleton from "../../components/shared/Skeleton";
import { useNotes } from "../../hooks/useNotes";
import { noteService } from "../../services/noteService";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { formatDate } from "../../utils/formatDate";

const AI_ACTIONS = [
  { id: "revision-points", label: "Revision Points", icon: FiList },
  { id: "explain", label: "Explain Simply", icon: FiZap },
  { id: "organize", label: "Organize", icon: FiWind },
];

const Notes = () => {
  const toast = useToast();
  const { notes, isLoading, error, fetchNotes, createNote, updateNote, deleteNote } = useNotes();

  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [assistingAction, setAssistingAction] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedNoteId) || null,
    [notes, selectedNoteId]
  );

  useEffect(() => {
    if (selectedNote) {
      setDraftTitle(selectedNote.title);
      setDraftContent(selectedNote.content);
      setConfirmDelete(false);
    }
  }, [selectedNote]);

  const isDirty =
    selectedNote &&
    (draftTitle !== selectedNote.title || draftContent !== selectedNote.content);

  const handleCreate = async () => {
    setIsCreating(true);
    const result = await createNote({ title: "Untitled note", content: "" });
    setIsCreating(false);
    if (result.success) {
      setSelectedNoteId(result.note.id);
    } else {
      toast.error(result.error);
    }
  };

  const handleSelect = (note) => {
    if (isDirty) {
      const confirmed = window.confirm("Discard unsaved changes to this note?");
      if (!confirmed) return;
    }
    setSelectedNoteId(note.id);
  };

  const handleSave = async () => {
    if (!selectedNote) return;
    setIsSaving(true);
    const result = await updateNote(selectedNote.id, {
      title: draftTitle,
      content: draftContent,
    });
    setIsSaving(false);
    if (result.success) {
      toast.success("Note saved.");
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async () => {
    if (!selectedNote) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setIsDeleting(true);
    const result = await deleteNote(selectedNote.id);
    setIsDeleting(false);
    setConfirmDelete(false);
    if (result.success) {
      toast.success("Note deleted.");
      setSelectedNoteId(null);
    } else {
      toast.error(result.error);
    }
  };

  const handleAssist = async (action) => {
    if (!draftContent.trim()) {
      toast.error("Add some note content first.");
      return;
    }
    setAssistingAction(action);
    try {
      const data = await noteService.assist(action, draftContent);
      setDraftContent(data.result);
      toast.success("Updated by AI — remember to save.");
    } catch (err) {
      toast.error(
        getErrorMessage(err, "Something went wrong while contacting Gemini. Please try again.")
      );
    } finally {
      setAssistingAction(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Notes"
        description="Write and organize your study notes."
        action={
          <Button size="sm" onClick={handleCreate} disabled={isCreating}>
            <FiPlus size={15} />
            {isCreating ? "Creating…" : "Create Note"}
          </Button>
        }
      />

      {isLoading && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Skeleton className="h-64 lg:col-span-1" />
          <Skeleton className="h-64 lg:col-span-2" />
        </div>
      )}

      {!isLoading && error && (
        <EmptyState icon={FiFileText} title="Couldn't load your notes" description={error} />
      )}

      {!isLoading && !error && notes.length === 0 && (
        <EmptyState
          icon={FiFileText}
          title="No notes yet"
          description="Create your first note to start organizing what you're learning."
          actionLabel="Create Note"
          onAction={handleCreate}
        />
      )}

      {!isLoading && !error && notes.length > 0 && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Notes list */}
          <div className={selectedNote ? "hidden lg:block" : "block"}>
            <div className="space-y-2">
              {notes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => handleSelect(note)}
                  className={`w-full rounded-xl2 border p-4 text-left transition-colors ${
                    note.id === selectedNoteId
                      ? "border-brand-primary/40 bg-brand-primary/[0.05]"
                      : "border-border bg-surface-card hover:border-border-hover dark:border-border-dark dark:bg-night-card dark:hover:border-border-dark-hover"
                  }`}
                >
                  <p className="truncate text-sm font-semibold text-ink dark:text-ink-dark">
                    {note.title || "Untitled note"}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-ink-muted dark:text-ink-dark-muted">
                    {note.content ? note.content.slice(0, 120) : "No content yet"}
                  </p>
                  <p className="mt-2 text-[11px] text-ink-faint dark:text-ink-dark-faint">
                    Updated {formatDate(note.updatedAt)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Editor */}
          <div className={selectedNote ? "block lg:col-span-2" : "hidden lg:block lg:col-span-2"}>
            {!selectedNote ? (
              <Card className="flex h-full min-h-[16rem] items-center justify-center">
                <p className="text-sm text-ink-muted dark:text-ink-dark-muted">
                  Select a note to start editing.
                </p>
              </Card>
            ) : (
              <Card>
                <button
                  onClick={() => setSelectedNoteId(null)}
                  className="mb-3 flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink dark:text-ink-dark-muted dark:hover:text-ink-dark lg:hidden"
                >
                  <FiArrowLeft size={15} />
                  Back to notes
                </button>

                <input
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder="Note title"
                  aria-label="Note title"
                  className="w-full border-none bg-transparent font-display text-lg font-semibold text-ink placeholder:text-ink-faint focus:outline-none dark:text-ink-dark dark:placeholder:text-ink-dark-faint"
                />

                <textarea
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  placeholder="Write your notes here…"
                  aria-label="Note content"
                  rows={12}
                  className="scrollbar-thin mt-3 w-full resize-y rounded-lg border border-border bg-surface-card p-3 text-sm leading-relaxed text-ink placeholder:text-ink-faint transition-colors focus:border-brand-primary/40 focus:outline-none focus:ring-4 focus:ring-brand-primary/10 dark:border-border-dark dark:bg-night-raised dark:text-ink-dark dark:placeholder:text-ink-dark-faint"
                />

                <div className="mt-4 flex flex-wrap gap-2">
                  {AI_ACTIONS.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => handleAssist(id)}
                      disabled={Boolean(assistingAction)}
                      className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:border-brand-primary/30 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50 dark:border-border-dark dark:text-ink-dark-muted dark:hover:text-ink-dark"
                    >
                      <Icon size={13} />
                      {assistingAction === id ? "Working…" : label}
                    </button>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4 dark:border-border-dark">
                  <Button
                    variant={confirmDelete ? "danger" : "secondary"}
                    size="sm"
                    onClick={handleDelete}
                    onBlur={() => setConfirmDelete(false)}
                    disabled={isDeleting}
                  >
                    <FiTrash2 size={14} />
                    {isDeleting ? "Deleting…" : confirmDelete ? "Confirm delete" : "Delete"}
                  </Button>

                  <Button size="sm" onClick={handleSave} disabled={!isDirty || isSaving}>
                    <FiSave size={14} />
                    {isSaving ? "Saving…" : "Save"}
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
