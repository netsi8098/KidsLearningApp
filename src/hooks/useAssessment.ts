import { useState, useCallback } from 'react';
import { db } from '../db/database';
import {
  assessmentQuestions,
  type AssessmentQuestion,
  type AssessmentArea,
} from '../data/assessmentQuestions';

interface AreaResult {
  area: AssessmentArea;
  score: number;
  total: number;
  suggestedLevel: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * Assessment state machine.
 *
 * Walks the player through all 24 assessment questions, tracks answers,
 * computes scores per area, and saves results to the database.
 */
export function useAssessment(playerId: number | undefined) {
  const [isActive, setIsActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<
    { questionId: string; answer: string; correct: boolean }[]
  >([]);
  const [isComplete, setIsComplete] = useState(false);

  const totalQuestions = assessmentQuestions.length;
  const currentQuestion: AssessmentQuestion | undefined =
    assessmentQuestions[currentIndex];

  /** Reset state and start from question 0. */
  const startAssessment = useCallback(() => {
    setAnswers([]);
    setCurrentIndex(0);
    setIsActive(true);
    setIsComplete(false);
  }, []);

  /** Record an answer and advance to the next question. */
  const answerQuestion = useCallback(
    (answer: string) => {
      const q = assessmentQuestions[currentIndex];
      if (!q) return;

      const correct = answer === q.correctAnswer;

      setAnswers((prev) => [
        ...prev,
        { questionId: q.id, answer, correct },
      ]);

      const nextIndex = currentIndex + 1;
      if (nextIndex >= totalQuestions) {
        setIsComplete(true);
        setIsActive(false);
      } else {
        setCurrentIndex(nextIndex);
      }
    },
    [currentIndex, totalQuestions],
  );

  /** Calculate scores per area from recorded answers. */
  const getResults = useCallback((): AreaResult[] => {
    const areaMap = new Map<
      AssessmentArea,
      { score: number; total: number }
    >();

    // Initialize areas
    const areas: AssessmentArea[] = [
      'letters',
      'numbers',
      'colors',
      'shapes',
      'vocabulary',
      'listening',
    ];
    for (const area of areas) {
      areaMap.set(area, { score: 0, total: 0 });
    }

    // Tally answers
    for (const a of answers) {
      const q = assessmentQuestions.find((qq) => qq.id === a.questionId);
      if (!q) continue;

      const entry = areaMap.get(q.area);
      if (entry) {
        entry.total += 1;
        if (a.correct) entry.score += 1;
      }
    }

    // Build results with suggested level
    const results: AreaResult[] = [];
    for (const [area, { score, total }] of areaMap) {
      const pct = total > 0 ? (score / total) * 100 : 0;
      let suggestedLevel: AreaResult['suggestedLevel'];
      if (pct >= 75) suggestedLevel = 'advanced';
      else if (pct >= 50) suggestedLevel = 'intermediate';
      else suggestedLevel = 'beginner';

      results.push({ area, score, total, suggestedLevel });
    }

    return results;
  }, [answers]);

  /** Save results to database and update the player profile. */
  const saveResults = useCallback(async () => {
    if (!playerId) return;

    const results = getResults();
    const now = new Date();

    // Save per-area results
    await db.transaction('rw', db.assessmentResults, db.profiles, async () => {
      for (const r of results) {
        await db.assessmentResults.add({
          playerId,
          area: r.area,
          score: r.score,
          totalQuestions: r.total,
          suggestedLevel: r.suggestedLevel,
          completedAt: now,
        });
      }

      // Compute overall level from total score
      const totalScore = results.reduce((s, r) => s + r.score, 0);
      const totalPossible = results.reduce((s, r) => s + r.total, 0);
      const overallPct =
        totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;

      let overallLevel: 'beginner' | 'intermediate' | 'advanced';
      if (overallPct >= 75) overallLevel = 'advanced';
      else if (overallPct >= 50) overallLevel = 'intermediate';
      else overallLevel = 'beginner';

      // Update player profile
      await db.profiles.update(playerId, {
        lastAssessmentAt: now,
        learningLevel: overallLevel,
      });
    });
  }, [playerId, getResults]);

  return {
    isActive,
    currentQuestion,
    currentIndex,
    totalQuestions,
    answerQuestion,
    startAssessment,
    getResults,
    saveResults,
    isComplete,
  };
}
