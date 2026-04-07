/**
 * Ollama Service — connects to local Gemma 4 model for AI vision features.
 * Requires Ollama running on localhost:11434 with gemma4 model pulled.
 */

const OLLAMA_BASE = 'http://localhost:11434';
const DEFAULT_MODEL = 'gemma4:e2b';

export interface OllamaResponse {
  model: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

/** Check if Ollama is running and the model is available */
export async function checkOllamaStatus(): Promise<{
  running: boolean;
  modelReady: boolean;
}> {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`);
    if (!res.ok) return { running: false, modelReady: false };
    const data = await res.json();
    const models: { name: string }[] = data.models ?? [];
    const hasModel = models.some(
      (m) => m.name.startsWith('gemma4')
    );
    return { running: true, modelReady: hasModel };
  } catch {
    return { running: false, modelReady: false };
  }
}

/** Convert a Blob (image) to base64 string */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Strip the data:image/...;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/** Convert an HTMLCanvasElement to base64 */
export async function canvasToBase64(canvas: HTMLCanvasElement): Promise<string> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve('');
        return;
      }
      blobToBase64(blob).then(resolve);
    }, 'image/jpeg', 0.85);
  });
}

/** Send an image + prompt to Gemma 4 and get a response */
export async function analyzeImage(
  imageBase64: string,
  prompt: string,
  model: string = DEFAULT_MODEL
): Promise<string> {
  const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: false,
      messages: [
        {
          role: 'user',
          content: prompt,
          images: [imageBase64],
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`Ollama error: ${res.status} ${res.statusText}`);
  }

  const data: OllamaResponse = await res.json();
  return data.message.content;
}

// ─── Kid-Friendly Prompts ──────────────────────────────

export const AI_PROMPTS = {
  whatsThis: `You are a friendly teacher talking to a young child (ages 3-7). Look at this image and:
1. Tell the child what the main object is in simple words
2. Share 2-3 fun facts a child would find exciting
3. Suggest a related learning activity

Use short sentences. Be enthusiastic and encouraging! Use simple vocabulary.
Format your response like this:
OBJECT: [what it is]
FUN FACTS:
- [fact 1]
- [fact 2]
- [fact 3]
ACTIVITY: [a fun activity idea]`,

  drawingDetective: `You are a fun, encouraging art teacher for young children (ages 3-7). A child drew this picture.
1. Guess what the drawing is (be generous and encouraging — children's art is abstract!)
2. Compliment their creativity
3. Suggest what they could add to make it even more amazing

Be very positive and enthusiastic! Use simple words.
Format your response like this:
GUESS: [what you think it is]
COMPLIMENT: [something nice about their drawing]
SUGGESTION: [what they could add next]`,

  letterReader: `You are a reading helper for young children (ages 3-7). Look at this image and:
1. Identify any letters, numbers, or words visible
2. Sound them out in a kid-friendly way
3. Give a fun word that starts with each letter found

Be encouraging and simple!
Format your response like this:
FOUND: [letters/words found]
SOUNDS: [how to sound them out]
FUN WORDS: [related words for each letter]`,

  natureExplorer: `You are a nature guide for young children (ages 3-7). Look at this image and:
1. Identify any plants, animals, insects, or natural elements
2. Share 2-3 amazing facts a child would love
3. Tell them if it's safe to touch or they should just look
4. Suggest a nature activity

Use simple, exciting words!
Format your response like this:
NATURE FIND: [what it is]
AMAZING FACTS:
- [fact 1]
- [fact 2]
- [fact 3]
SAFETY: [safe to touch / look but don't touch]
ACTIVITY: [nature activity idea]`,

  colorFinder: `You are a color teacher for young children (ages 3-7). Look at this image and:
1. List ALL the colors you can see (use simple color names kids know)
2. Tell them which color appears the most
3. Name an object for each color (e.g., "Red like a fire truck!")
4. Suggest a color mixing activity

Be fun and colorful with your words!
Format your response like this:
COLORS FOUND: [list of colors]
MAIN COLOR: [the dominant color]
COLOR FRIENDS:
- [color] like a [object]!
ACTIVITY: [color mixing activity idea]`,
} as const;

// ─── Response Parsers ──────────────────────────────────

export interface WhatsThisResult {
  object: string;
  funFacts: string[];
  activity: string;
  raw: string;
}

export interface DrawingResult {
  guess: string;
  compliment: string;
  suggestion: string;
  raw: string;
}

export interface LetterResult {
  found: string;
  sounds: string;
  funWords: string;
  raw: string;
}

export interface NatureResult {
  find: string;
  facts: string[];
  safety: string;
  activity: string;
  raw: string;
}

export interface ColorResult {
  colorsFound: string;
  mainColor: string;
  colorFriends: string[];
  activity: string;
  raw: string;
}

function extractSection(text: string, label: string): string {
  const regex = new RegExp(`${label}:\\s*(.+?)(?=\\n[A-Z]|$)`, 's');
  const match = text.match(regex);
  return match ? match[1].trim() : '';
}

function extractBullets(text: string, sectionLabel: string): string[] {
  const section = extractSection(text, sectionLabel);
  return section
    .split('\n')
    .map((l) => l.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean);
}

export function parseWhatsThis(raw: string): WhatsThisResult {
  return {
    object: extractSection(raw, 'OBJECT') || 'Something cool!',
    funFacts: extractBullets(raw, 'FUN FACTS'),
    activity: extractSection(raw, 'ACTIVITY') || 'Draw what you see!',
    raw,
  };
}

export function parseDrawing(raw: string): DrawingResult {
  return {
    guess: extractSection(raw, 'GUESS') || 'A wonderful drawing!',
    compliment: extractSection(raw, 'COMPLIMENT') || 'Great job!',
    suggestion: extractSection(raw, 'SUGGESTION') || 'Add some colors!',
    raw,
  };
}

export function parseLetterReader(raw: string): LetterResult {
  return {
    found: extractSection(raw, 'FOUND') || 'No letters found yet',
    sounds: extractSection(raw, 'SOUNDS') || '',
    funWords: extractSection(raw, 'FUN WORDS') || '',
    raw,
  };
}

export function parseNature(raw: string): NatureResult {
  return {
    find: extractSection(raw, 'NATURE FIND') || 'Something from nature!',
    facts: extractBullets(raw, 'AMAZING FACTS'),
    safety: extractSection(raw, 'SAFETY') || 'Ask a grown-up!',
    activity: extractSection(raw, 'ACTIVITY') || 'Go explore outside!',
    raw,
  };
}

export function parseColors(raw: string): ColorResult {
  return {
    colorsFound: extractSection(raw, 'COLORS FOUND') || '',
    mainColor: extractSection(raw, 'MAIN COLOR') || '',
    colorFriends: extractBullets(raw, 'COLOR FRIENDS'),
    activity: extractSection(raw, 'ACTIVITY') || 'Mix some colors!',
    raw,
  };
}
