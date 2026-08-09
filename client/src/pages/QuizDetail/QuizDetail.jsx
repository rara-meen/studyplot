import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiHelpCircle,
  FiAlertCircle,
  FiZap,
  FiCheck,
  FiX,
  FiClock,
  FiTarget,
  FiRotateCcw,
  FiLayers,
  FiBookOpen,
} from "react-icons/fi";
import PageHeader from "../../components/shared/PageHeader";
import Card from "../../components/shared/Card";
import Button from "../../components/shared/Button";
import Skeleton from "../../components/shared/Skeleton";
import EmptyState from "../../components/shared/EmptyState";
import AiLoadingStages from "../../components/shared/AiLoadingStages";
import ProgressBar from "../../components/shared/ProgressBar";
import { documentService } from "../../services/documentService";
import { useQuiz } from "../../hooks/useQuiz";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { cn } from "../../utils/cn";

const GENERATING_STAGES = [
  "Analyzing document...",
  "Writing questions...",
  "Creating answer choices...",
  "Preparing quiz...",
];

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

const getMotivationalMessage = (percentage) => {
  if (percentage >= 90) return "Excellent work!";
  if (percentage >= 70) return "Great job! Review a few concepts.";
  if (percentage >= 50) return "You're getting there. Review the summary and flashcards.";
  return "Spend more time reviewing before trying again.";
};

const QuizDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [document, setDocument] = useState(null);
  const [isLoadingDoc, setIsLoadingDoc] = useState(true);
  const [docError, setDocError] = useState(null);

  const {
    quiz,
    isLoading: isCheckingCache,
    isGenerating,
    error: quizError,
    loadCached,
    generate,
    submitScore,
  } = useQuiz();

  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [isTaking, setIsTaking] = useState(false);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [results, setResults] = useState(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const resetAttemptState = () => {
    setAnswers({});
    setCurrentIndex(0);
    setResults(null);
    setIsTaking(false);
  };

  const handleSelectDifficulty = async (difficulty) => {
    setSelectedDifficulty(difficulty);
    resetAttemptState();
    await loadCached(id, difficulty);
  };

  const handleGenerate = async (regenerate = false) => {
    const result = await generate(id, selectedDifficulty, { regenerate });
    resetAttemptState();
    if (result.success) {
      toast.success(
        regenerate ? "Quiz regenerated." : "Quiz generated successfully."
      );
    } else {
      toast.error(result.error);
    }
  };

  const handleStartQuiz = () => {
    setAnswers({});
    setCurrentIndex(0);
    setResults(null);
    setStartTime(Date.now());
    setIsTaking(true);
  };

  const handleSelectOption = (option) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: option }));
  };

  const goNext = () => {
    setCurrentIndex((i) => Math.min(i + 1, quiz.questions.length - 1));
  };

  const goPrevious = () => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  };

  const handleSubmit = async () => {
    const totalQuestions = quiz.questions.length;
    let correctCount = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correctCount += 1;
    });
    const incorrectCount = totalQuestions - correctCount;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const timeTakenSeconds = Math.max(
      0,
      Math.round((Date.now() - startTime) / 1000)
    );

    setResults({ correctCount, incorrectCount, percentage, timeTakenSeconds, totalQuestions });
    setIsTaking(false);

    const scoreResult = await submitScore(id, {
      difficulty: selectedDifficulty,
      score: correctCount,
      totalQuestions,
      timeTakenSeconds,
    });
    if (!scoreResult.success) {
      toast.error(scoreResult.error);
    }
  };

  const handleRetake = () => {
    handleStartQuiz();
  };

  const handleGenerateNew = async () => {
    const result = await generate(id, selectedDifficulty, { regenerate: true });
    if (result.success) {
      toast.success("New quiz generated.");
      setAnswers({});
      setCurrentIndex(0);
      setResults(null);
      setStartTime(Date.now());
      setIsTaking(true);
    } else {
      toast.error(result.error);
    }
  };

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
        actionLabel="Back to Quiz"
        onAction={() => navigate("/quiz")}
      />
    );
  }

  const hasQuiz = Boolean(quiz && quiz.questions?.length > 0);
  const currentQuestion = hasQuiz ? quiz.questions[currentIndex] : null;
  const isLastQuestion = hasQuiz && currentIndex === quiz.questions.length - 1;

  return (
    <div>
      <button
        onClick={() => navigate("/quiz")}
        className="mb-4 flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink dark:text-ink-dark-muted dark:hover:text-ink-dark"
      >
        <FiArrowLeft size={15} />
        Back to Quiz
      </button>

      <PageHeader
        title={document.title || document.originalFilename}
        description={
          selectedDifficulty
            ? `${selectedDifficulty} difficulty`
            : "Choose a difficulty to get started."
        }
        action={
          selectedDifficulty && hasQuiz && !isTaking && !results && !isGenerating ? (
            <Button variant="secondary" size="sm" onClick={() => handleGenerate(true)}>
              <FiRefreshCw size={15} />
              Regenerate Quiz
            </Button>
          ) : null
        }
      />

      {!isTaking && !results && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {DIFFICULTIES.map((option) => (
            <button
              key={option}
              onClick={() => handleSelectDifficulty(option)}
              className={cn(
                "rounded-full border px-5 py-2 text-sm font-medium transition-colors",
                selectedDifficulty === option
                  ? "border-transparent bg-brand-primary text-white"
                  : "border-border text-ink-muted hover:text-ink dark:border-border-dark dark:text-ink-dark-muted dark:hover:text-ink-dark"
              )}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {!selectedDifficulty && !isTaking && !results && (
        <Card className="flex flex-col items-center py-14 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary/[0.08] text-brand-primary">
            <FiHelpCircle size={26} />
          </div>
          <h3 className="font-display text-lg font-semibold text-ink dark:text-ink-dark">
            Pick a difficulty
          </h3>
          <p className="mt-1 max-w-sm text-sm text-ink-muted dark:text-ink-dark-muted">
            Choose Easy, Medium, or Hard above to generate or load a quiz for
            this document.
          </p>
        </Card>
      )}

      {selectedDifficulty && isCheckingCache && !isTaking && !results && (
        <Card className="flex items-center justify-center py-14">
          <Skeleton className="h-6 w-40" />
        </Card>
      )}

      {isGenerating && (
        <Card>
          <AiLoadingStages stages={GENERATING_STAGES} />
        </Card>
      )}

      {selectedDifficulty &&
        !isCheckingCache &&
        !isGenerating &&
        !isTaking &&
        !results && (
          <Card className="flex flex-col items-center py-14 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary/[0.08] text-brand-primary">
              {hasQuiz ? <FiTarget size={26} /> : <FiZap size={26} />}
            </div>
            <h3 className="font-display text-lg font-semibold text-ink dark:text-ink-dark">
              {hasQuiz ? "Quiz ready" : "No quiz yet"}
            </h3>
            <p className="mt-1 max-w-sm text-sm text-ink-muted dark:text-ink-dark-muted">
              {hasQuiz
                ? `${quiz.questions.length} ${selectedDifficulty.toLowerCase()} questions are ready to go.`
                : `Generate a 10-question ${selectedDifficulty.toLowerCase()} quiz from this document.`}
            </p>
            <Button className="mt-6" onClick={hasQuiz ? handleStartQuiz : () => handleGenerate(false)}>
              {hasQuiz ? (
                "Start Quiz"
              ) : (
                <>
                  <FiZap />
                  Generate Quiz
                </>
              )}
            </Button>

            {quizError && (
              <div className="mt-5 flex max-w-sm items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-left text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300">
                <FiAlertCircle className="mt-0.5 flex-shrink-0" size={16} />
                <span>{quizError}</span>
              </div>
            )}
          </Card>
        )}

      {isTaking && hasQuiz && currentQuestion && (
        <div>
          <div className="mb-2 flex items-center justify-between text-sm text-ink-muted dark:text-ink-dark-muted">
            <span>
              Question {currentIndex + 1} of {quiz.questions.length}
            </span>
            <span>{Math.round(((currentIndex + 1) / quiz.questions.length) * 100)}%</span>
          </div>
          <ProgressBar progress={((currentIndex + 1) / quiz.questions.length) * 100} />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              <Card className="mt-6">
                <p className="mb-6 font-display text-lg font-semibold leading-snug text-ink dark:text-ink-dark">
                  {currentQuestion.question}
                </p>

                <div className="flex flex-col gap-3">
                  {currentQuestion.options.map((option) => {
                    const isSelected = answers[currentIndex] === option;
                    return (
                      <button
                        key={option}
                        onClick={() => handleSelectOption(option)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                          isSelected
                            ? "border-accent-blue bg-accent-blue/10 text-ink dark:text-ink-dark"
                            : "border-border text-ink-muted hover:border-border-hover hover:text-ink dark:border-border-dark dark:text-ink-dark-muted dark:hover:border-border-dark-hover dark:hover:text-ink-dark"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2",
                            isSelected ? "border-accent-blue" : "border-ink-faint dark:border-ink-dark-faint"
                          )}
                        >
                          {isSelected && (
                            <span className="h-2 w-2 rounded-full bg-accent-blue" />
                          )}
                        </span>
                        {option}
                      </button>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="secondary"
              size="sm"
              onClick={goPrevious}
              disabled={currentIndex === 0}
            >
              <FiChevronLeft />
              Previous
            </Button>

            {isLastQuestion ? (
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={Object.keys(answers).length < quiz.questions.length}
              >
                Submit Quiz
              </Button>
            ) : (
              <Button size="sm" onClick={goNext} disabled={!answers[currentIndex]}>
                Next
                <FiChevronRight />
              </Button>
            )}
          </div>
        </div>
      )}

      {results && hasQuiz && (
        <div>
          <Card className="flex flex-col items-center py-10 text-center">
            <p className="font-display text-5xl font-semibold text-brand-primary">
              {results.percentage}%
            </p>
            <p className="mt-2 text-sm text-ink-muted dark:text-ink-dark-muted">
              {results.correctCount} of {results.totalQuestions} correct
            </p>
            <p className="mt-4 max-w-sm font-display text-base font-semibold text-ink dark:text-ink-dark">
              {getMotivationalMessage(results.percentage)}
            </p>

            <div className="mt-6 grid w-full max-w-md grid-cols-3 gap-3">
              <div className="rounded-lg border border-border px-3 py-3 dark:border-border-dark">
                <FiCheck className="mx-auto mb-1 text-emerald-600 dark:text-emerald-400" size={16} />
                <p className="text-lg font-semibold text-ink dark:text-ink-dark">{results.correctCount}</p>
                <p className="text-xs text-ink-faint dark:text-ink-dark-faint">Correct</p>
              </div>
              <div className="rounded-lg border border-border px-3 py-3 dark:border-border-dark">
                <FiX className="mx-auto mb-1 text-rose-600 dark:text-rose-400" size={16} />
                <p className="text-lg font-semibold text-ink dark:text-ink-dark">{results.incorrectCount}</p>
                <p className="text-xs text-ink-faint dark:text-ink-dark-faint">Incorrect</p>
              </div>
              <div className="rounded-lg border border-border px-3 py-3 dark:border-border-dark">
                <FiClock className="mx-auto mb-1 text-accent-cyan" size={16} />
                <p className="text-lg font-semibold text-ink dark:text-ink-dark">{results.timeTakenSeconds}s</p>
                <p className="text-xs text-ink-faint dark:text-ink-dark-faint">Time taken</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="sm" onClick={handleRetake}>
                <FiRotateCcw size={15} />
                Retake Quiz
              </Button>
              <Button variant="secondary" size="sm" onClick={handleGenerateNew}>
                <FiRefreshCw size={15} />
                Generate New Quiz
              </Button>
              <Button variant="secondary" size="sm" onClick={() => navigate(`/flashcards/${id}`)}>
                <FiLayers size={15} />
                Generate Flashcards
              </Button>
              <Button variant="secondary" size="sm" onClick={() => navigate(`/summary/${id}`)}>
                <FiBookOpen size={15} />
                Return to Summary
              </Button>
            </div>
          </Card>

          <h3 className="mb-4 mt-8 font-display text-lg font-semibold text-ink dark:text-ink-dark">
            Review Answers
          </h3>

          <div className="flex flex-col gap-4">
            {quiz.questions.map((q, index) => {
              const selected = answers[index];
              const isCorrect = selected === q.correctAnswer;
              return (
                <Card key={index}>
                  <p className="mb-3 text-xs font-medium text-ink-faint dark:text-ink-dark-faint">
                    Question {index + 1}
                  </p>
                  <p className="mb-4 font-display text-base font-semibold text-ink dark:text-ink-dark">
                    {q.question}
                  </p>
                  <div className="flex flex-col gap-2">
                    {q.options.map((option) => {
                      const isThisCorrect = option === q.correctAnswer;
                      const isThisSelected = option === selected;
                      return (
                        <div
                          key={option}
                          className={cn(
                            "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                            isThisCorrect
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-400/10 dark:text-emerald-300"
                              : isThisSelected
                                ? "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:border-rose-400/40 dark:bg-rose-400/10 dark:text-rose-300"
                                : "border-border text-ink-muted dark:border-border-dark dark:text-ink-dark-muted"
                          )}
                        >
                          {isThisCorrect ? (
                            <FiCheck size={14} className="flex-shrink-0" />
                          ) : isThisSelected ? (
                            <FiX size={14} className="flex-shrink-0" />
                          ) : (
                            <span className="h-3.5 w-3.5 flex-shrink-0" />
                          )}
                          {option}
                        </div>
                      );
                    })}
                  </div>
                  {q.explanation && (
                    <p className="mt-3 text-sm leading-relaxed text-ink-muted dark:text-ink-dark-muted">
                      <span className="font-medium text-ink dark:text-ink-dark">Explanation: </span>
                      {q.explanation}
                    </p>
                  )}
                  {!isCorrect && !selected && (
                    <p className="mt-2 text-xs text-rose-600 dark:text-rose-300">Not answered</p>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizDetail;
