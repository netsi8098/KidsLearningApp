import { useLiveQuery } from 'dexie-react-hooks';
import { db, type LessonProgress } from '../db/database';
import { getLessonsByAge, getLessonById, type Lesson, type AgeGroup } from '../data/lessonsData';
import { useApp } from '../context/AppContext';
import { useProfiles } from './useProfile';

export function useLessons(playerId: number | undefined) {
  const { showStarBurst, showCelebration } = useApp();
  const { addStars } = useProfiles();

  // Live query: all lesson progress records for this player
  const allProgress = useLiveQuery(
    () =>
      playerId
        ? db.lessonProgress.where('playerId').equals(playerId).toArray()
        : [],
    [playerId],
    [] as LessonProgress[]
  );

  /** Get the progress record for a specific lesson */
  function getProgressForLesson(lessonId: string): LessonProgress | undefined {
    return allProgress.find((p) => p.lessonId === lessonId);
  }

  /** Check whether a lesson is unlocked for the current player */
  function isLessonUnlocked(lesson: Lesson): boolean {
    // No prerequisite means always unlocked
    if (!lesson.prerequisiteId) return true;
    // Prerequisite must be completed
    const prereqProgress = allProgress.find(
      (p) => p.lessonId === lesson.prerequisiteId
    );
    return !!prereqProgress?.completed;
  }

  /** Start a lesson -- create a new LessonProgress record (or return existing) */
  async function startLesson(lesson: Lesson): Promise<LessonProgress> {
    if (!playerId) throw new Error('No player selected');

    // Check if there is already an in-progress record
    const existing = await db.lessonProgress
      .where('[playerId+lessonId]')
      .equals([playerId, lesson.id])
      .first();

    if (existing) {
      // Bump attempts if restarting after completion
      if (existing.completed) {
        await db.lessonProgress.update(existing.id!, {
          completed: false,
          score: 0,
          stepsCompleted: 0,
          attempts: existing.attempts + 1,
          completedAt: undefined,
          startedAt: new Date(),
        });
        return {
          ...existing,
          completed: false,
          score: 0,
          stepsCompleted: 0,
          attempts: existing.attempts + 1,
          completedAt: undefined,
          startedAt: new Date(),
        };
      }
      return existing;
    }

    const record: LessonProgress = {
      playerId,
      lessonId: lesson.id,
      completed: false,
      score: 0,
      attempts: 1,
      stepsCompleted: 0,
      totalSteps: lesson.steps.length,
      startedAt: new Date(),
    };

    const id = await db.lessonProgress.add(record);
    return { ...record, id };
  }

  /** Update the step progress for an active lesson */
  async function updateStepProgress(
    lessonId: string,
    stepsCompleted: number
  ): Promise<void> {
    if (!playerId) return;

    const existing = await db.lessonProgress
      .where('[playerId+lessonId]')
      .equals([playerId, lessonId])
      .first();

    if (existing) {
      await db.lessonProgress.update(existing.id!, { stepsCompleted });
    }
  }

  /** Complete a lesson, recording the score, awarding stars */
  async function completeLesson(
    lessonId: string,
    score: number,
    totalQuizQuestions: number
  ): Promise<void> {
    if (!playerId) return;

    const existing = await db.lessonProgress
      .where('[playerId+lessonId]')
      .equals([playerId, lessonId])
      .first();

    if (!existing) return;

    const lesson = getLessonById(lessonId);
    const totalSteps = lesson?.steps.length ?? existing.totalSteps;

    await db.lessonProgress.update(existing.id!, {
      completed: true,
      score,
      stepsCompleted: totalSteps,
      completedAt: new Date(),
    });

    // Award stars: 1 base star for completing the lesson, +1 bonus for perfect quiz
    let starsEarned = 1;
    if (totalQuizQuestions > 0 && score === totalQuizQuestions) {
      starsEarned = 2; // perfect quiz bonus
    }

    await db.stars.add({
      playerId,
      category: 'lessons',
      starsEarned,
      reason: `Completed lesson: ${lesson?.title ?? lessonId}`,
      earnedAt: new Date(),
    });

    await addStars(playerId, starsEarned);
    showStarBurst();
    showCelebration();
  }

  /** Get the recommended next lesson for an age group */
  function getRecommendedLesson(ageGroup: AgeGroup): Lesson | undefined {
    const lessons = getLessonsByAge(ageGroup);

    // Find first incomplete & unlocked lesson
    for (const lesson of lessons) {
      const progress = getProgressForLesson(lesson.id);
      if (!progress || !progress.completed) {
        if (isLessonUnlocked(lesson)) {
          return lesson;
        }
      }
    }
    // All done -- return undefined
    return undefined;
  }

  return {
    allProgress,
    getProgressForLesson,
    isLessonUnlocked,
    startLesson,
    updateStepProgress,
    completeLesson,
    getRecommendedLesson,
  };
}
