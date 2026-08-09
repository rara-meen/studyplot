import { useCallback, useState } from "react";
import { noteService } from "../services/noteService";
import { getErrorMessage } from "../utils/getErrorMessage";

export const useNotes = () => {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await noteService.list();
      setNotes(data.notes || []);
      return { success: true, notes: data.notes || [] };
    } catch (err) {
      const message = getErrorMessage(err, "Couldn't load your notes.");
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createNote = useCallback(async (payload) => {
    try {
      const data = await noteService.create(payload);
      setNotes((prev) => [data.note, ...prev]);
      return { success: true, note: data.note };
    } catch (err) {
      return { success: false, error: getErrorMessage(err, "Couldn't create that note.") };
    }
  }, []);

  const updateNote = useCallback(async (id, payload) => {
    try {
      const data = await noteService.update(id, payload);
      setNotes((prev) => prev.map((n) => (n.id === id ? data.note : n)));
      return { success: true, note: data.note };
    } catch (err) {
      return { success: false, error: getErrorMessage(err, "Couldn't save that note.") };
    }
  }, []);

  const deleteNote = useCallback(async (id) => {
    try {
      await noteService.remove(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: getErrorMessage(err, "Couldn't delete that note.") };
    }
  }, []);

  return {
    notes,
    isLoading,
    error,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
  };
};
