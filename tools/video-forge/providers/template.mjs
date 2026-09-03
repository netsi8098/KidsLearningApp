/**
 * Deterministic episode composer.
 *
 * Builds a complete, valid, age-appropriate episode from a curriculum bank —
 * no model, no network. Given the same spec it always produces the same script,
 * which makes it the provider used by tests and the safety net when neither
 * Anthropic nor Ollama is reachable.
 */
import { agePresets, hostThemes } from '../config.mjs';
import { slug } from '../lib/util.mjs';

/**
 * Curriculum bank. Each entry gives the host something concrete to teach and
 * a set of distractors for "choose" interactions. Emojis double as the visual,
 * which is why every item carries exactly one.
 */
const CURRICULUM = {
  colors: {
    title: 'Colors All Around Us',
    emoji: '🎨',
    noun: 'color',
    items: [
      { name: 'RED',    visual: '🍓', because: 'Strawberries are red, and so are fire trucks!', distractors: ['🍌', '🫐', '🥒'] },
      { name: 'BLUE',   visual: '🫐', because: 'The sky is blue, and so is the big ocean!',      distractors: ['🍓', '🍊', '🌽'] },
      { name: 'YELLOW', visual: '🍌', because: 'Bananas are yellow, just like the sunshine!',    distractors: ['🫐', '🍓', '🥒'] },
      { name: 'GREEN',  visual: '🥒', because: 'Grass is green, and so are leafy trees!',        distractors: ['🍓', '🍌', '🫐'] },
    ],
  },
  counting: {
    title: 'Counting Together',
    emoji: '🔢',
    noun: 'number',
    items: [
      { name: 'ONE',   visual: '🍎',         because: 'One means just a single thing. One apple!',   distractors: ['🍎🍎', '🍎🍎🍎'] },
      { name: 'TWO',   visual: '🦋🦋',       because: 'Two means a pair. You have two hands!',       distractors: ['🦋', '🦋🦋🦋'] },
      { name: 'THREE', visual: '⭐⭐⭐',      because: 'Three little stars, shining in the night!',   distractors: ['⭐', '⭐⭐'] },
      { name: 'FOUR',  visual: '🐾🐾🐾🐾',    because: 'A puppy has four paws. One, two, three, four!', distractors: ['🐾🐾', '🐾🐾🐾'] },
    ],
  },
  shapes: {
    title: 'Shapes Everywhere',
    emoji: '🔷',
    noun: 'shape',
    items: [
      { name: 'CIRCLE',   visual: '⭕', because: 'A circle is perfectly round, like a wheel!',     distractors: ['🔺', '🟦'] },
      { name: 'SQUARE',   visual: '🟦', because: 'A square has four sides, all the same size!',    distractors: ['⭕', '🔺'] },
      { name: 'TRIANGLE', visual: '🔺', because: 'A triangle has three sides and three corners!',  distractors: ['⭕', '🟦'] },
      { name: 'STAR',     visual: '⭐', because: 'A star has five bright points!',                 distractors: ['⭕', '🟦'] },
    ],
  },
  alphabet: {
    title: 'Letters and Their Sounds',
    emoji: '🔤',
    noun: 'letter',
    items: [
      { name: 'A', visual: '🍎', because: 'A says "ah". A is for Apple!',   distractors: ['🐻', '🐱'] },
      { name: 'B', visual: '🐻', because: 'B says "buh". B is for Bear!',   distractors: ['🍎', '🐱'] },
      { name: 'C', visual: '🐱', because: 'C says "kuh". C is for Cat!',    distractors: ['🍎', '🐻'] },
      { name: 'D', visual: '🐶', because: 'D says "duh". D is for Dog!',    distractors: ['🍎', '🐱'] },
    ],
  },
  animals: {
    title: 'Animals and Their Sounds',
    emoji: '🐾',
    noun: 'animal',
    items: [
      { name: 'a COW',   visual: '🐮', because: 'A cow says "mooo" and gives us milk!',       distractors: ['🐶', '🐱'] },
      { name: 'a DUCK',  visual: '🦆', because: 'A duck says "quack" and loves the water!',   distractors: ['🐮', '🐶'] },
      { name: 'a SHEEP', visual: '🐑', because: 'A sheep says "baaa" and has fluffy wool!',   distractors: ['🦆', '🐱'] },
      { name: 'a FROG',  visual: '🐸', because: 'A frog says "ribbit" and hops so high!',     distractors: ['🐮', '🦆'] },
    ],
  },
  emotions: {
    title: 'How Are You Feeling?',
    emoji: '💛',
    noun: 'feeling',
    items: [
      { name: 'HAPPY',    visual: '😊', because: 'Happy is a warm, sunny feeling inside!',       distractors: ['😢', '😴'] },
      { name: 'SAD',      visual: '😢', because: 'Everyone feels sad sometimes, and that is okay!', distractors: ['😊', '😴'] },
      { name: 'EXCITED',  visual: '🤩', because: 'Excited is when you can hardly wait!',         distractors: ['😴', '😢'] },
      { name: 'CALM',     visual: '😌', because: 'Calm is slow breathing and a quiet body.',     distractors: ['🤩', '😢'] },
    ],
  },
  weather: {
    title: 'Looking at the Weather',
    emoji: '🌤️',
    noun: 'kind of weather',
    items: [
      { name: 'SUNNY',  visual: '☀️',  because: 'Sunny days are bright and warm outside!',   distractors: ['🌧️', '❄️'] },
      { name: 'RAINY',  visual: '🌧️', because: 'Rain helps flowers and trees grow big!',     distractors: ['☀️', '❄️'] },
      { name: 'SNOWY',  visual: '❄️',  because: 'Snow is cold and soft and white!',           distractors: ['☀️', '🌧️'] },
      { name: 'WINDY',  visual: '🍃',  because: 'Wind pushes clouds and kites through the sky!', distractors: ['☀️', '❄️'] },
    ],
  },
  bodyparts: {
    title: 'My Amazing Body',
    emoji: '🙋',
    noun: 'body part',
    items: [
      { name: 'your HANDS', visual: '✋',  because: 'Hands help you wave, clap, and hold things!', distractors: ['👀', '👂'] },
      { name: 'your EYES',  visual: '👀',  because: 'Eyes help you see colors and faces!',         distractors: ['✋', '👂'] },
      { name: 'your EARS',  visual: '👂',  because: 'Ears help you hear music and voices!',        distractors: ['👀', '✋'] },
      { name: 'your FEET',  visual: '🦶',  because: 'Feet help you walk, run, and jump!',          distractors: ['✋', '👀'] },
    ],
  },
};

/** Aliases so a loose topic string finds the right curriculum entry. */
const ALIASES = {
  color: 'colors', colours: 'colors', colour: 'colors',
  numbers: 'counting', number: 'counting', count: 'counting', math: 'counting', maths: 'counting',
  shape: 'shapes', geometry: 'shapes',
  letters: 'alphabet', letter: 'alphabet', abc: 'alphabet', phonics: 'alphabet', reading: 'alphabet',
  animal: 'animals', pets: 'animals', farm: 'animals', 'farm animals': 'animals',
  emotion: 'emotions', feelings: 'emotions', feeling: 'emotions', mood: 'emotions',
  seasons: 'weather', season: 'weather', sky: 'weather',
  body: 'bodyparts', 'body parts': 'bodyparts', bodypart: 'bodyparts',
};

/** Resolve a free-text topic to a curriculum key, or null if unknown. */
export function resolveTopic(topic) {
  const key = String(topic).toLowerCase().trim();
  if (CURRICULUM[key]) return key;
  if (ALIASES[key]) return ALIASES[key];
  // Substring match: "learn about colors" → colors
  for (const [alias, target] of Object.entries(ALIASES)) {
    if (key.includes(alias)) return target;
  }
  for (const name of Object.keys(CURRICULUM)) {
    if (key.includes(name)) return name;
  }
  return null;
}

export function availableTopics() {
  return Object.keys(CURRICULUM);
}

/**
 * Generic lesson used when the topic is not in the bank. Still a real episode:
 * it teaches observation vocabulary around the requested subject rather than
 * inventing facts that might be wrong.
 */
function genericBank(topic) {
  const label = String(topic).trim();
  return {
    title: `Let's Explore ${label.replace(/\b\w/g, (m) => m.toUpperCase())}`,
    emoji: '🌟',
    noun: 'idea',
    items: [
      { name: 'LOOKING closely', visual: '👀', because: `When we explore ${label}, we start by looking carefully!`, distractors: ['👂', '✋'] },
      { name: 'LISTENING',       visual: '👂', because: 'Listening helps us notice sounds we might miss!',          distractors: ['👀', '✋'] },
      { name: 'ASKING QUESTIONS', visual: '❓', because: 'Asking "why" is how clever kids learn new things!',        distractors: ['👀', '👂'] },
      { name: 'SHARING',         visual: '🤝', because: 'Telling someone what you learned makes it stick!',         distractors: ['❓', '👂'] },
    ],
  };
}

/** Rotate an array deterministically so repeat runs vary the opener. */
function pick(list, seed) {
  return list[seed % list.length];
}

export function composeFromTemplate({ topic, ageGroup = '4-5', host = 'leo', durationMinutes = 3 }) {
  const preset = agePresets[ageGroup] ?? agePresets['4-5'];
  const theme = hostThemes[host] ?? hostThemes.leo;
  const key = resolveTopic(topic);
  const bank = key ? CURRICULUM[key] : genericBank(topic);
  const items = bank.items.slice(0, Math.max(2, preset.teachCount));
  const seed = topic.length + ageGroup.length;

  const greeting = pick([
    `Hello there, my friend! I'm ${theme.name}.`,
    `Hi hi! It's me, ${theme.name}!`,
    `Welcome back, little explorer! ${theme.name} here.`,
  ], seed);

  const segments = [];

  segments.push({
    type: 'intro',
    hostLine: `${greeting} Today we learn about ${bank.title.toLowerCase()}!`,
    hostExpression: 'excited',
    hostPose: 'waving',
    durationMs: 4000,
  });

  segments.push({
    type: 'topic-reveal',
    title: bank.title,
    emoji: bank.emoji,
    hostLine: `Are you ready? Let's find out together!`,
    revealAnimation: 'rainbow-burst',
  });

  items.forEach((item, i) => {
    segments.push({
      type: 'teach',
      content: item.because,
      visual: item.visual,
      hostLine: `Look! This is ${item.name}. ${item.because}`,
    });

    // Alternate the participation style so the child is not doing the same
    // action every time: choose, then call-and-repeat.
    if (i % 2 === 0) {
      const options = [item.visual, ...item.distractors].slice(0, ageGroup === '2-3' ? 3 : 4);
      segments.push({
        type: 'interaction',
        prompt: `Which one is ${item.name}?`,
        interactionType: 'choose',
        options,
        correctAnswer: item.visual,
        hostHint: `Remember: ${item.because}`,
      });
    } else {
      segments.push({
        type: 'call-response',
        hostLine: `Can you say ${item.name} with me? Let's try!`,
        expectedResponse: item.name,
        celebrateOnResponse: true,
      });
    }
  });

  segments.push({
    type: 'recap',
    summary: `Today we learned about ${items.map((i) => i.name).join(', ')}.`,
    hostLine: `Wow! You learned so much today. I am so proud of you!`,
    hostExpression: 'celebrating',
  });

  segments.push({
    type: 'goodbye',
    hostLine: `Great job, my friend! Come back soon and we'll learn more. Bye bye!`,
    nextSuggestion: key === 'colors' ? 'Try "Counting Together" next!' : 'Try "Colors All Around Us" next!',
  });

  return {
    id: `ep-${slug(key ?? topic)}-${ageGroup.replace('-', '')}`,
    title: bank.title,
    emoji: bank.emoji,
    hostCharacterId: host,
    topic: key ?? String(topic).toLowerCase().trim(),
    ageGroup,
    durationMinutes,
    segments,
  };
}
