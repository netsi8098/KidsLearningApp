import type { QuizQuestion } from '../models/types';
import { alphabetData } from './alphabetData';
import { numbersData } from './numbersData';
import { colorsData } from './colorsData';
import { shapesData } from './shapesData';
import { animalsData } from './animalsData';
import { bodyPartsData } from './bodyPartsData';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[], count: number): T[] {
  return shuffle(arr).slice(0, count);
}

function makeOptions(correct: string, allOptions: string[], count = 4): string[] {
  const others = allOptions.filter((o) => o !== correct);
  const wrong = pickRandom(others, count - 1);
  return shuffle([correct, ...wrong]);
}

function generateAbcQuestions(): QuizQuestion[] {
  const items = pickRandom(alphabetData, 3);
  return items.map((item) => ({
    question: `What letter does "${item.word}" start with?`,
    correctAnswer: item.letter,
    options: makeOptions(item.letter, alphabetData.map((a) => a.letter)),
    category: 'abc' as const,
    emoji: item.emoji,
  }));
}

function generateNumberQuestions(): QuizQuestion[] {
  const items = pickRandom(numbersData.slice(0, 10), 2);
  return items.map((item) => ({
    question: `How many ${item.emoji} are here? ${item.emoji.repeat(item.number)}`,
    correctAnswer: String(item.number),
    options: makeOptions(String(item.number), numbersData.slice(0, 10).map((n) => String(n.number))),
    category: 'numbers' as const,
    emoji: item.emoji,
  }));
}

function generateColorQuestions(): QuizQuestion[] {
  const items = pickRandom(colorsData, 2);
  return items.map((item) => ({
    question: `What color is this? ${item.emojis[0]}`,
    correctAnswer: item.name,
    options: makeOptions(item.name, colorsData.map((c) => c.name)),
    category: 'colors' as const,
    emoji: item.emojis[0],
  }));
}

function generateShapeQuestions(): QuizQuestion[] {
  const items = pickRandom(shapesData, 2);
  return items.map((item) => ({
    question: `What shape is this? ${item.emoji}`,
    correctAnswer: item.name,
    options: makeOptions(item.name, shapesData.map((s) => s.name)),
    category: 'shapes' as const,
    emoji: item.emoji,
  }));
}

function generateAnimalQuestions(): QuizQuestion[] {
  const items = pickRandom(animalsData, 2);
  return items.map((item) => ({
    question: `Which animal says "${item.sound}"?`,
    correctAnswer: item.name,
    options: makeOptions(item.name, animalsData.map((a) => a.name)),
    category: 'animals' as const,
    emoji: item.emoji,
  }));
}

function generateBodyPartsQuestions(): QuizQuestion[] {
  const items = pickRandom(bodyPartsData, 2);
  return items.map((item) => ({
    question: `Which body part ${item.funFact.toLowerCase().replace('your ', '').replace('!', '')}?`,
    correctAnswer: item.name,
    options: makeOptions(item.name, bodyPartsData.map((b) => b.name)),
    category: 'bodyparts' as const,
    emoji: item.emoji,
  }));
}

export function generateQuiz(count = 10): QuizQuestion[] {
  const all = [
    ...generateAbcQuestions(),
    ...generateNumberQuestions(),
    ...generateColorQuestions(),
    ...generateShapeQuestions(),
    ...generateAnimalQuestions(),
    ...generateBodyPartsQuestions(),
  ];
  return shuffle(all).slice(0, count);
}

export function generateCategoryQuiz(category: string, count = 10): QuizQuestion[] {
  let questions: QuizQuestion[] = [];
  switch (category) {
    case 'abc':
      // Generate more ABC questions (use larger pickRandom count)
      questions = pickRandom(alphabetData, Math.min(count, alphabetData.length)).map((item) => ({
        question: `What letter does "${item.word}" start with?`,
        correctAnswer: item.letter,
        options: makeOptions(item.letter, alphabetData.map((a) => a.letter)),
        category: 'abc' as const,
        emoji: item.emoji,
      }));
      break;
    case 'numbers':
      questions = pickRandom(numbersData.slice(0, 10), Math.min(count, 10)).map((item) => ({
        question: `How many ${item.emoji} are here? ${item.emoji.repeat(item.number)}`,
        correctAnswer: String(item.number),
        options: makeOptions(String(item.number), numbersData.slice(0, 10).map((n) => String(n.number))),
        category: 'numbers' as const,
        emoji: item.emoji,
      }));
      break;
    case 'colors':
      questions = pickRandom(colorsData, Math.min(count, colorsData.length)).map((item) => ({
        question: `What color is this? ${item.emojis[0]}`,
        correctAnswer: item.name,
        options: makeOptions(item.name, colorsData.map((c) => c.name)),
        category: 'colors' as const,
        emoji: item.emojis[0],
      }));
      break;
    case 'shapes':
      questions = pickRandom(shapesData, Math.min(count, shapesData.length)).map((item) => ({
        question: `What shape is this? ${item.emoji}`,
        correctAnswer: item.name,
        options: makeOptions(item.name, shapesData.map((s) => s.name)),
        category: 'shapes' as const,
        emoji: item.emoji,
      }));
      break;
    case 'animals':
      questions = pickRandom(animalsData, Math.min(count, animalsData.length)).map((item) => ({
        question: `Which animal says "${item.sound}"?`,
        correctAnswer: item.name,
        options: makeOptions(item.name, animalsData.map((a) => a.name)),
        category: 'animals' as const,
        emoji: item.emoji,
      }));
      break;
    case 'bodyparts':
      questions = pickRandom(bodyPartsData, Math.min(count, bodyPartsData.length)).map((item) => ({
        question: `Which body part ${item.funFact.toLowerCase().replace('your ', '').replace('!', '')}?`,
        correctAnswer: item.name,
        options: makeOptions(item.name, bodyPartsData.map((b) => b.name)),
        category: 'bodyparts' as const,
        emoji: item.emoji,
      }));
      break;
    default:
      return generateQuiz(count);
  }
  return shuffle(questions).slice(0, count);
}
