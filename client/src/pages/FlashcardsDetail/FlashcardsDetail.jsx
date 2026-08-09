import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiShuffle,
  FiRotateCcw,
  FiLayers,
  FiAlertCircle,
  FiZap,
} from "react-icons/fi";
import PageHeader from "../../components/shared/PageHeader";
import Card from "../../components/shared/Card";
import Button from "../../components/shared/Button";
import Skeleton from "../../components/shared/Skeleton";
import EmptyState from "../../components/shared/EmptyState";
import AiLoadingStages from "../../components/shared/AiLoadingStages";
import FlipCard from "../../components/shared/FlipCard";
import { documentService } from "../../services/documentService";
import { useFlashcards } from "../../hooks/useFlashcards";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { shuffleArray } from "../../utils/shuffleArray";
import { cn } from "../../utils/cn";

const GENERATING_STAGES = [
  "Analyzing concepts...",
  "Creating flashcards...",
  "Organizing study deck...",
];

const FILTERS = ["All", "Easy", "Medium", "Hard"];

const FlashcardsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [document, setDocument] = useState(null);
  const [isLoadingDoc, setIsLoadingDoc] = useState(true);
  const [docError, setDocError] = useState(null);

  const {
    flashcards,
    isLoading: isLoadingCards,
    isGenerating,
    error: cardsError,
    loadCached,
    generate,
  } = useFlashcards();

  const [filter, setFilter] = useState("All");
  const [deck, setDeck] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchDocument = async () => {
      setIsLoadingDoc(true);
      setDocError(null);
      try {
        const data = await documentService.getById(id);
        if (isMounted) setDocument(data.document);
      } catch (err) {
        if (isMounted) {
          setDocError(getErrorMessage(err, "Couldn't load this document."));
        }
      } finally {
        if (isMounted) setIsLoadingDoc(false);
      }
    };

    fetchDocument();
    loadCached(id);

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const filtered =
      filter === "All"
        ? flashcards
        : flashcards.filter((card) => card.difficulty === filter);
    setDeck(filtered);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [flashcards, filter]);

  const handleGenerate = async (regenerate = false) => {
    const result = await generate(id, { regenerate });
    if (result.success) {
      toast.success(
        regenerate ? "Flashcards regenerated." : "Flashcards generated successfully."
      );
    } else {
      toast.error(result.error);
    }
  };

  const handleShuffle = () => {
    setDeck((prev) => shuffleArray(prev));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleRestart = () => {
    const filtered =
      filter === "All"
        ? flashcards
        : flashcards.filter((card) => card.difficulty === filter);
    setDeck(filtered);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const goNext = () => {
    setIsFlipped(false);
    setCurrentIndex((i) => Math.min(i + 1, deck.length - 1));
  };

  const goPrevious = () => {
    setIsFlipped(false);
    setCurrentIndex((i) => Math.max(i - 1, 0));
  };

  const hasCards = flashcards.length > 0;

  if (isLoadingDoc) {
    return (
      <div>
        <Skeleton className="mb-8 h-9 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (docError || !document) {
    return (
      <EmptyState
        icon={FiAlertCircle}
        title="Document not found"
        description={docError || "This document may have been deleted."}
        actionLabel="Back to Flashcards"
        onAction={() => navigate("/flashcards")}
      />
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate("/flashcards")}
        className="mb-4 flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink dark:text-ink-dark-muted dark:hover:text-ink-dark"
      >
        <FiArrowLeft size={15} />
        Back to Flashcards
      </button>

      <PageHeader
        title={document.title || document.originalFilename}
        description={
          hasCards
            ? `${flashcards.length} flashcards generated`
            : "No flashcards generated yet"
        }
        action={
          hasCards && !isGenerating ? (
            <Button variant="secondary" size="sm" onClick={() => handleGenerate(true)}>
              <FiRefreshCw size={15} />
              Regenerate Flashcards
            </Button>
          ) : null
        }
      />

      {isLoadingCards && (
        <Card className="flex items-center justify-center py-14">
          <Skeleton className="h-6 w-40" />
        </Card>
      )}

      {!isLoadingCards && !hasCards && !isGenerating && (
        <Card className="flex flex-col items-center py-14 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary/[0.08] text-brand-primary">
            <FiLayers size={26} />
          </div>
          <h3 className="font-display text-lg font-semibold text-ink dark:text-ink-dark">
            No flashcards yet
          </h3>
          <p className="mt-1 max-w-sm text-sm text-ink-muted dark:text-ink-dark-muted">
            Generate 15 AI-powered flashcards covering the key concepts in
            this document.
          </p>
          <Button className="mt-6" onClick={() => handleGenerate(false)}>
            <FiZap />
            Generate Flashcards
          </Button>

          {cardsError && (
            <div className="mt-5 flex max-w-sm items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-left text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300">
              <FiAlertCircle className="mt-0.5 flex-shrink-0" size={16} />
              <span>{cardsError}</span>
            </div>
          )}
        </Card>
      )}

      {isGenerating && (
        <Card>
          <AiLoadingStages stages={GENERATING_STAGES} />
        </Card>
      )}

      {!isLoadingCards && hasCards && !isGenerating && (
        <div>
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {FILTERS.map((option) => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  filter === option
                    ? "border-transparent bg-brand-primary text-white"
                    : "border-border text-ink-muted hover:text-ink dark:border-border-dark dark:text-ink-dark-muted dark:hover:text-ink-dark"
                )}
              >
                {option}
              </button>
            ))}
          </div>

          {deck.length === 0 ? (
            <EmptyState
              icon={FiLayers}
              title={`No ${filter} cards`}
              description="Try a different difficulty filter."
              actionLabel="Show all cards"
              onAction={() => setFilter("All")}
            />
          ) : (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex + filter}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.25 }}
                >
                  <FlipCard
                    question={deck[currentIndex].question}
                    answer={deck[currentIndex].answer}
                    difficulty={deck[currentIndex].difficulty}
                    isFlipped={isFlipped}
                    onFlip={() => setIsFlipped((f) => !f)}
                  />
                </motion.div>
              </AnimatePresence>

              <p className="mt-6 text-center text-sm text-ink-muted dark:text-ink-dark-muted">
                Card {currentIndex + 1} of {deck.length}
              </p>

              <div className="mt-4 flex items-center justify-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={goPrevious}
                  disabled={currentIndex === 0}
                >
                  <FiChevronLeft />
                  Previous
                </Button>
                <Button size="sm" onClick={() => setIsFlipped((f) => !f)}>
                  Flip Card
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={goNext}
                  disabled={currentIndex === deck.length - 1}
                >
                  Next
                  <FiChevronRight />
                </Button>
              </div>

              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  onClick={handleShuffle}
                  className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink dark:text-ink-dark-muted dark:hover:text-ink-dark"
                >
                  <FiShuffle size={15} />
                  Shuffle Cards
                </button>
                <span className="text-ink-faint dark:text-ink-dark-faint">·</span>
                <button
                  onClick={handleRestart}
                  className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink dark:text-ink-dark-muted dark:hover:text-ink-dark"
                >
                  <FiRotateCcw size={15} />
                  Restart Deck
                </button>
              </div>
            </>
          )}

          {cardsError && (
            <div className="mt-6 flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300">
              <FiAlertCircle className="mt-0.5 flex-shrink-0" size={16} />
              <span>{cardsError}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FlashcardsDetail;
