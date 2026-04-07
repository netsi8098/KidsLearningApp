// ── Pronunciation Guide ────────────────────────────────────────────────────
// Comprehensive pronunciation system for Kids Learning Fun.
// Covers alphabet, numbers, phonics patterns, and age-graded vocabulary.

// ── Types ──────────────────────────────────────────────────────────────────

export interface LetterPronunciation {
  letter: string;
  uppercase: string;
  lowercase: string;
  /** IPA phonetic representation of the letter name */
  nameIPA: string;
  /** Common phonetic sound the letter makes */
  soundIPA: string;
  /** Child-friendly phonetic approximation */
  friendlySound: string;
  /** Example word starting with this letter */
  exampleWord: string;
  /** SSML phoneme element */
  ssmlPhoneme: string;
  /** Teaching script: how to introduce this sound */
  teachingScript: string;
}

export interface NumberPronunciation {
  value: number;
  word: string;
  /** IPA for the word */
  ipa: string;
  /** Syllable breakdown */
  syllables: string;
  /** Ordinal form */
  ordinal: string;
  /** Teaching phrase */
  teachingPhrase: string;
}

export interface PhonicsPattern {
  pattern: string;
  soundIPA: string;
  friendlySound: string;
  exampleWords: string[];
  teachingNote: string;
}

export interface VocabularyEntry {
  word: string;
  ipa: string;
  syllables: string;
  definition: string;
  ageGroup: '2-3' | '4-5' | '6-8';
  category: string;
  /** Optional pronunciation note for tricky words */
  note?: string;
}

export interface EducationalPhrase {
  id: string;
  phrase: string;
  context: string;
  ssml: string;
  /** How often this phrase appears in the app */
  frequency: 'very-high' | 'high' | 'medium';
}

// ── Alphabet Pronunciation Map ─────────────────────────────────────────────

export const alphabetPronunciations: LetterPronunciation[] = [
  {
    letter: 'A', uppercase: 'A', lowercase: 'a',
    nameIPA: '/e\u026A/', soundIPA: '/\u00E6/',
    friendlySound: 'ah',
    exampleWord: 'apple',
    ssmlPhoneme: '<phoneme alphabet="ipa" ph="e\u026A">A</phoneme>',
    teachingScript: 'This is the letter A! A says "ah" like in apple. Ah, ah, apple!',
  },
  {
    letter: 'B', uppercase: 'B', lowercase: 'b',
    nameIPA: '/bi\u02D0/', soundIPA: '/b/',
    friendlySound: 'buh',
    exampleWord: 'ball',
    ssmlPhoneme: '<phoneme alphabet="ipa" ph="bi\u02D0">B</phoneme>',
    teachingScript: 'This is the letter B! B says "buh" like in ball. Buh, buh, ball!',
  },
  {
    letter: 'C', uppercase: 'C', lowercase: 'c',
    nameIPA: '/si\u02D0/', soundIPA: '/k/',
    friendlySound: 'kuh',
    exampleWord: 'cat',
    ssmlPhoneme: '<phoneme alphabet="ipa" ph="si\u02D0">C</phoneme>',
    teachingScript: 'This is the letter C! C says "kuh" like in cat. Kuh, kuh, cat!',
  },
  {
    letter: 'D', uppercase: 'D', lowercase: 'd',
    nameIPA: '/di\u02D0/', soundIPA: '/d/',
    friendlySound: 'duh',
    exampleWord: 'dog',
    ssmlPhoneme: '<phoneme alphabet="ipa" ph="di\u02D0">D</phoneme>',
    teachingScript: 'This is the letter D! D says "duh" like in dog. Duh, duh, dog!',
  },
  {
    letter: 'E', uppercase: 'E', lowercase: 'e',
    nameIPA: '/i\u02D0/', soundIPA: '/\u025B/',
    friendlySound: 'eh',
    exampleWord: 'elephant',
    ssmlPhoneme: '<phoneme alphabet="ipa" ph="i\u02D0">E</phoneme>',
    teachingScript: 'This is the letter E! E says "eh" like in elephant. Eh, eh, elephant!',
  },
  {
    letter: 'F', uppercase: 'F', lowercase: 'f',
    nameIPA: '/\u025Bf/', soundIPA: '/f/',
    friendlySound: 'fff',
    exampleWord: 'fish',
    ssmlPhoneme: '<phoneme alphabet="ipa" ph="\u025Bf">F</phoneme>',
    teachingScript: 'This is the letter F! F says "fff" like in fish. Fff, fff, fish!',
  },
  {
    letter: 'G', uppercase: 'G', lowercase: 'g',
    nameIPA: '/d\u0292i\u02D0/', soundIPA: '/\u0261/',
    friendlySound: 'guh',
    exampleWord: 'goat',
    ssmlPhoneme: '<phoneme alphabet="ipa" ph="d\u0292i\u02D0">G</phoneme>',
    teachingScript: 'This is the letter G! G says "guh" like in goat. Guh, guh, goat!',
  },
  {
    letter: 'H', uppercase: 'H', lowercase: 'h',
    nameIPA: '/e\u026At\u0283/', soundIPA: '/h/',
    friendlySound: 'huh',
    exampleWord: 'hat',
    ssmlPhoneme: '<phoneme alphabet="ipa" ph="e\u026At\u0283">H</phoneme>',
    teachingScript: 'This is the letter H! H says "huh" like in hat. Huh, huh, hat!',
  },
  {
    letter: 'I', uppercase: 'I', lowercase: 'i',
    nameIPA: '/a\u026A/', soundIPA: '/\u026A/',
    friendlySound: 'ih',
    exampleWord: 'igloo',
    ssmlPhoneme: '<phoneme alphabet="ipa" ph="a\u026A">I</phoneme>',
    teachingScript: 'This is the letter I! I says "ih" like in igloo. Ih, ih, igloo!',
  },
  {
    letter: 'J', uppercase: 'J', lowercase: 'j',
    nameIPA: '/d\u0292e\u026A/', soundIPA: '/d\u0292/',
    friendlySound: 'juh',
    exampleWord: 'jump',
    ssmlPhoneme: '<phoneme alphabet="ipa" ph="d\u0292e\u026A">J</phoneme>',
    teachingScript: 'This is the letter J! J says "juh" like in jump. Juh, juh, jump!',
  },
  {
    letter: 'K', uppercase: 'K', lowercase: 'k',
    nameIPA: '/ke\u026A/', soundIPA: '/k/',
    friendlySound: 'kuh',
    exampleWord: 'kite',
    ssmlPhoneme: '<phoneme alphabet="ipa" ph="ke\u026A">K</phoneme>',
    teachingScript: 'This is the letter K! K says "kuh" like in kite. Kuh, kuh, kite!',
  },
  {
    letter: 'L', uppercase: 'L', lowercase: 'l',
    nameIPA: '/\u025Bl/', soundIPA: '/l/',
    friendlySound: 'lll',
    exampleWord: 'lion',
    ssmlPhoneme: '<phoneme alphabet="ipa" ph="\u025Bl">L</phoneme>',
    teachingScript: 'This is the letter L! L says "lll" like in lion. Lll, lll, lion!',
  },
  {
    letter: 'M', uppercase: 'M', lowercase: 'm',
    nameIPA: '/\u025Bm/', soundIPA: '/m/',
    friendlySound: 'mmm',
    exampleWord: 'moon',
    ssmlPhoneme: '<phoneme alphabet="ipa" ph="\u025Bm">M</phoneme>',
    teachingScript: 'This is the letter M! M says "mmm" like in moon. Mmm, mmm, moon!',
  },
  {
    letter: 'N', uppercase: 'N', lowercase: 'n',
    nameIPA: '/\u025Bn/', soundIPA: '/n/',
    friendlySound: 'nnn',
    exampleWord: 'nose',
    ssmlPhoneme: '<phoneme alphabet="ipa" ph="\u025Bn">N</phoneme>',
    teachingScript: 'This is the letter N! N says "nnn" like in nose. Nnn, nnn, nose!',
  },
  {
    letter: 'O', uppercase: 'O', lowercase: 'o',
    nameIPA: '/o\u028A/', soundIPA: '/\u0252/',
    friendlySound: 'oh',
    exampleWord: 'octopus',
    ssmlPhoneme: '<phoneme alphabet="ipa" ph="o\u028A">O</phoneme>',
    teachingScript: 'This is the letter O! O says "oh" like in octopus. Oh, oh, octopus!',
  },
  {
    letter: 'P', uppercase: 'P', lowercase: 'p',
    nameIPA: '/pi\u02D0/', soundIPA: '/p/',
    friendlySound: 'puh',
    exampleWord: 'penguin',
    ssmlPhoneme: '<phoneme alphabet="ipa" ph="pi\u02D0">P</phoneme>',
    teachingScript: 'This is the letter P! P says "puh" like in penguin. Puh, puh, penguin!',
  },
  {
    letter: 'Q', uppercase: 'Q', lowercase: 'q',
    nameIPA: '/kju\u02D0/', soundIPA: '/kw/',
    friendlySound: 'kwuh',
    exampleWord: 'queen',
    ssmlPhoneme: '<phoneme alphabet="ipa" ph="kju\u02D0">Q</phoneme>',
    teachingScript: 'This is the letter Q! Q says "kwuh" like in queen. Kwuh, kwuh, queen!',
  },
  {
    letter: 'R', uppercase: 'R', lowercase: 'r',
    nameIPA: '/\u0251\u02D0r/', soundIPA: '/r/',
    friendlySound: 'rrr',
    exampleWord: 'rabbit',
    ssmlPhoneme: '<phoneme alphabet="ipa" ph="\u0251\u02D0r">R</phoneme>',
    teachingScript: 'This is the letter R! R says "rrr" like in rabbit. Rrr, rrr, rabbit!',
  },
  {
    letter: 'S', uppercase: 'S', lowercase: 's',
    nameIPA: '/\u025Bs/', soundIPA: '/s/',
    friendlySound: 'sss',
    exampleWord: 'sun',
    ssmlPhoneme: '<phoneme alphabet="ipa" ph="\u025Bs">S</phoneme>',
    teachingScript: 'This is the letter S! S says "sss" like in sun. Sss, sss, sun!',
  },
  {
    letter: 'T', uppercase: 'T', lowercase: 't',
    nameIPA: '/ti\u02D0/', soundIPA: '/t/',
    friendlySound: 'tuh',
    exampleWord: 'tree',
    ssmlPhoneme: '<phoneme alphabet="ipa" ph="ti\u02D0">T</phoneme>',
    teachingScript: 'This is the letter T! T says "tuh" like in tree. Tuh, tuh, tree!',
  },
  {
    letter: 'U', uppercase: 'U', lowercase: 'u',
    nameIPA: '/ju\u02D0/', soundIPA: '/\u028C/',
    friendlySound: 'uh',
    exampleWord: 'umbrella',
    ssmlPhoneme: '<phoneme alphabet="ipa" ph="ju\u02D0">U</phoneme>',
    teachingScript: 'This is the letter U! U says "uh" like in umbrella. Uh, uh, umbrella!',
  },
  {
    letter: 'V', uppercase: 'V', lowercase: 'v',
    nameIPA: '/vi\u02D0/', soundIPA: '/v/',
    friendlySound: 'vvv',
    exampleWord: 'van',
    ssmlPhoneme: '<phoneme alphabet="ipa" ph="vi\u02D0">V</phoneme>',
    teachingScript: 'This is the letter V! V says "vvv" like in van. Vvv, vvv, van!',
  },
  {
    letter: 'W', uppercase: 'W', lowercase: 'w',
    nameIPA: '/\u02C8d\u028Cb\u0259l.ju\u02D0/', soundIPA: '/w/',
    friendlySound: 'wuh',
    exampleWord: 'water',
    ssmlPhoneme: '<phoneme alphabet="ipa" ph="\u02C8d\u028Cb\u0259l.ju\u02D0">W</phoneme>',
    teachingScript: 'This is the letter W! W says "wuh" like in water. Wuh, wuh, water!',
  },
  {
    letter: 'X', uppercase: 'X', lowercase: 'x',
    nameIPA: '/\u025Bks/', soundIPA: '/ks/',
    friendlySound: 'ks',
    exampleWord: 'fox',
    ssmlPhoneme: '<phoneme alphabet="ipa" ph="\u025Bks">X</phoneme>',
    teachingScript: 'This is the letter X! X says "ks" like at the end of fox. Ks, ks, fox!',
  },
  {
    letter: 'Y', uppercase: 'Y', lowercase: 'y',
    nameIPA: '/wa\u026A/', soundIPA: '/j/',
    friendlySound: 'yuh',
    exampleWord: 'yellow',
    ssmlPhoneme: '<phoneme alphabet="ipa" ph="wa\u026A">Y</phoneme>',
    teachingScript: 'This is the letter Y! Y says "yuh" like in yellow. Yuh, yuh, yellow!',
  },
  {
    letter: 'Z', uppercase: 'Z', lowercase: 'z',
    nameIPA: '/zi\u02D0/', soundIPA: '/z/',
    friendlySound: 'zzz',
    exampleWord: 'zebra',
    ssmlPhoneme: '<phoneme alphabet="ipa" ph="zi\u02D0">Z</phoneme>',
    teachingScript: 'This is the letter Z! Z says "zzz" like in zebra. Zzz, zzz, zebra!',
  },
];

// ── Number Pronunciation (1-20) ────────────────────────────────────────────

export const numberPronunciations: NumberPronunciation[] = [
  { value: 1,  word: 'one',       ipa: '/w\u028Cn/',          syllables: 'one',        ordinal: 'first',       teachingPhrase: 'One! Just one. Hold up one finger!' },
  { value: 2,  word: 'two',       ipa: '/tu\u02D0/',          syllables: 'two',        ordinal: 'second',      teachingPhrase: 'Two! One, two. Like your two eyes!' },
  { value: 3,  word: 'three',     ipa: '/\u03B8ri\u02D0/',    syllables: 'three',      ordinal: 'third',       teachingPhrase: 'Three! One, two, three. A triangle has three sides!' },
  { value: 4,  word: 'four',      ipa: '/f\u0254\u02D0r/',    syllables: 'four',       ordinal: 'fourth',      teachingPhrase: 'Four! One, two, three, four. Like four legs on a dog!' },
  { value: 5,  word: 'five',      ipa: '/fa\u026Av/',         syllables: 'five',       ordinal: 'fifth',       teachingPhrase: 'Five! One, two, three, four, five. A whole hand!' },
  { value: 6,  word: 'six',       ipa: '/s\u026Aks/',         syllables: 'six',        ordinal: 'sixth',       teachingPhrase: 'Six! Five and one more makes six!' },
  { value: 7,  word: 'seven',     ipa: '/\u02C8s\u025Bv.n\u0329/', syllables: 'sev-en',   ordinal: 'seventh',     teachingPhrase: 'Seven! There are seven days in a week!' },
  { value: 8,  word: 'eight',     ipa: '/e\u026At/',          syllables: 'eight',      ordinal: 'eighth',      teachingPhrase: 'Eight! An octopus has eight arms!' },
  { value: 9,  word: 'nine',      ipa: '/na\u026An/',         syllables: 'nine',       ordinal: 'ninth',       teachingPhrase: 'Nine! Almost ten. Just one more!' },
  { value: 10, word: 'ten',       ipa: '/t\u025Bn/',          syllables: 'ten',        ordinal: 'tenth',       teachingPhrase: 'Ten! All ten fingers! Wiggle them!' },
  { value: 11, word: 'eleven',    ipa: '/\u026A\u02C8l\u025Bv.n\u0329/', syllables: 'e-lev-en', ordinal: 'eleventh',  teachingPhrase: 'Eleven! Ten and one more makes eleven!' },
  { value: 12, word: 'twelve',    ipa: '/tw\u025Blv/',        syllables: 'twelve',     ordinal: 'twelfth',     teachingPhrase: 'Twelve! A dozen! Like twelve eggs in a carton!' },
  { value: 13, word: 'thirteen',  ipa: '/\u02CC\u03B8\u025C\u02D0r\u02C8ti\u02D0n/', syllables: 'thir-teen', ordinal: 'thirteenth', teachingPhrase: 'Thirteen! Three plus ten makes thirteen!' },
  { value: 14, word: 'fourteen',  ipa: '/\u02CCf\u0254\u02D0r\u02C8ti\u02D0n/', syllables: 'four-teen', ordinal: 'fourteenth', teachingPhrase: 'Fourteen! Four plus ten makes fourteen!' },
  { value: 15, word: 'fifteen',   ipa: '/\u02CCf\u026Af\u02C8ti\u02D0n/', syllables: 'fif-teen', ordinal: 'fifteenth', teachingPhrase: 'Fifteen! Five plus ten makes fifteen!' },
  { value: 16, word: 'sixteen',   ipa: '/\u02CCs\u026Aks\u02C8ti\u02D0n/', syllables: 'six-teen', ordinal: 'sixteenth', teachingPhrase: 'Sixteen! Six plus ten makes sixteen!' },
  { value: 17, word: 'seventeen', ipa: '/\u02CCs\u025Bv.n\u0329\u02C8ti\u02D0n/', syllables: 'sev-en-teen', ordinal: 'seventeenth', teachingPhrase: 'Seventeen! Seven plus ten makes seventeen!' },
  { value: 18, word: 'eighteen',  ipa: '/\u02CCe\u026A\u02C8ti\u02D0n/', syllables: 'eigh-teen', ordinal: 'eighteenth', teachingPhrase: 'Eighteen! Eight plus ten makes eighteen!' },
  { value: 19, word: 'nineteen',  ipa: '/\u02CCna\u026An\u02C8ti\u02D0n/', syllables: 'nine-teen', ordinal: 'nineteenth', teachingPhrase: 'Nineteen! Nine plus ten makes nineteen! Almost twenty!' },
  { value: 20, word: 'twenty',    ipa: '/\u02C8tw\u025Bn.ti/', syllables: 'twen-ty', ordinal: 'twentieth', teachingPhrase: 'Twenty! Two tens make twenty! Fantastic counting!' },
];

// ── Phonics Patterns ───────────────────────────────────────────────────────

export const phonicsPatterns: PhonicsPattern[] = [
  {
    pattern: 'sh',
    soundIPA: '/\u0283/',
    friendlySound: 'shh',
    exampleWords: ['ship', 'shell', 'shoe', 'fish'],
    teachingNote: 'Put your finger to your lips and say "shh" like you are telling a secret!',
  },
  {
    pattern: 'ch',
    soundIPA: '/t\u0283/',
    friendlySound: 'chuh',
    exampleWords: ['chair', 'cheese', 'cherry', 'lunch'],
    teachingNote: 'Like a train: choo choo! That is the "ch" sound!',
  },
  {
    pattern: 'th',
    soundIPA: '/\u03B8/',
    friendlySound: 'thh',
    exampleWords: ['three', 'thumb', 'think', 'bath'],
    teachingNote: 'Put your tongue between your teeth and blow gently. Thh!',
  },
  {
    pattern: 'ee',
    soundIPA: '/i\u02D0/',
    friendlySound: 'eee',
    exampleWords: ['tree', 'bee', 'see', 'free'],
    teachingNote: 'Open your mouth wide and smile! Eee! Like you are really happy!',
  },
  {
    pattern: 'oo',
    soundIPA: '/u\u02D0/',
    friendlySound: 'ooo',
    exampleWords: ['moon', 'spoon', 'food', 'zoo'],
    teachingNote: 'Make your lips round like an O and say "ooo" like you see something amazing!',
  },
  {
    pattern: 'ai',
    soundIPA: '/e\u026A/',
    friendlySound: 'ay',
    exampleWords: ['rain', 'train', 'snail', 'tail'],
    teachingNote: 'Say "ay" like when you wave at a friend. Ay! Rain, train!',
  },
  {
    pattern: 'ck',
    soundIPA: '/k/',
    friendlySound: 'k',
    exampleWords: ['duck', 'clock', 'sock', 'stick'],
    teachingNote: 'A quick little sound at the back of your throat: k! Duck, clock!',
  },
  {
    pattern: 'ng',
    soundIPA: '/\u014B/',
    friendlySound: 'ng',
    exampleWords: ['ring', 'sing', 'king', 'swing'],
    teachingNote: 'Let the sound hum in your nose: nnnng! Like when you sing!',
  },
  {
    pattern: 'wh',
    soundIPA: '/w/',
    friendlySound: 'wh',
    exampleWords: ['whale', 'wheel', 'white', 'whistle'],
    teachingNote: 'Round your lips and blow softly: wh! Like the wind!',
  },
  {
    pattern: 'igh',
    soundIPA: '/a\u026A/',
    friendlySound: 'eye',
    exampleWords: ['night', 'light', 'high', 'right'],
    teachingNote: 'This special group of letters says "eye": n-eye-t, l-eye-t!',
  },
  {
    pattern: 'ou',
    soundIPA: '/a\u028A/',
    friendlySound: 'ow',
    exampleWords: ['cloud', 'house', 'mouse', 'loud'],
    teachingNote: 'Like when you stub your toe: ow! Cloud, house!',
  },
  {
    pattern: 'ar',
    soundIPA: '/\u0251\u02D0r/',
    friendlySound: 'ar',
    exampleWords: ['car', 'star', 'park', 'farm'],
    teachingNote: 'Open your mouth wide: aaaar! Like a pirate! Car, star!',
  },
];

// ── Age-Graded Vocabulary ──────────────────────────────────────────────────

export const vocabularyByAge: VocabularyEntry[] = [
  // ── Toddlers (2-3) ──
  { word: 'ball',     ipa: '/b\u0254\u02D0l/',    syllables: 'ball',     definition: 'A round thing you can throw',          ageGroup: '2-3', category: 'toys' },
  { word: 'cat',      ipa: '/k\u00E6t/',           syllables: 'cat',      definition: 'A soft furry animal that says meow',   ageGroup: '2-3', category: 'animals' },
  { word: 'dog',      ipa: '/d\u0252\u0261/',      syllables: 'dog',      definition: 'A friendly animal that says woof',     ageGroup: '2-3', category: 'animals' },
  { word: 'big',      ipa: '/b\u026A\u0261/',      syllables: 'big',      definition: 'Very large! Not small!',               ageGroup: '2-3', category: 'describing' },
  { word: 'red',      ipa: '/r\u025Bd/',           syllables: 'red',      definition: 'The colour of a fire truck',           ageGroup: '2-3', category: 'colours' },
  { word: 'up',       ipa: '/\u028Cp/',             syllables: 'up',       definition: 'Going higher! Like a bird!',           ageGroup: '2-3', category: 'direction' },
  { word: 'mama',     ipa: '/\u02C8m\u0251\u02D0.m\u0251/', syllables: 'ma-ma', definition: 'Your mum!',                      ageGroup: '2-3', category: 'family' },
  { word: 'yummy',    ipa: '/\u02C8j\u028Cm.i/',   syllables: 'yum-my',  definition: 'Tastes really good!',                  ageGroup: '2-3', category: 'food' },
  { word: 'happy',    ipa: '/\u02C8h\u00E6p.i/',   syllables: 'hap-py',  definition: 'When you feel really good and smiley', ageGroup: '2-3', category: 'feelings' },
  { word: 'star',     ipa: '/st\u0251\u02D0r/',    syllables: 'star',     definition: 'A sparkly light in the sky at night',  ageGroup: '2-3', category: 'nature' },

  // ── Preschool (4-5) ──
  { word: 'triangle', ipa: '/\u02C8tra\u026A.\u00E6\u014B.\u0261l\u0329/', syllables: 'tri-an-gle', definition: 'A shape with three sides and three corners', ageGroup: '4-5', category: 'shapes' },
  { word: 'butterfly', ipa: '/\u02C8b\u028Ct.\u0259r.fla\u026A/', syllables: 'but-ter-fly', definition: 'A beautiful insect with colourful wings', ageGroup: '4-5', category: 'animals' },
  { word: 'rainbow',  ipa: '/\u02C8re\u026An.bo\u028A/', syllables: 'rain-bow', definition: 'An arc of colours you see after rain', ageGroup: '4-5', category: 'nature' },
  { word: 'elephant', ipa: '/\u02C8\u025Bl.\u026A.f\u0259nt/', syllables: 'el-e-phant', definition: 'A very big grey animal with a long trunk', ageGroup: '4-5', category: 'animals', note: 'The "ph" makes an "f" sound' },
  { word: 'kitchen',  ipa: '/\u02C8k\u026At\u0283.\u026An/', syllables: 'kitch-en', definition: 'The room where we cook food', ageGroup: '4-5', category: 'home' },
  { word: 'purple',   ipa: '/\u02C8p\u025C\u02D0r.pl\u0329/', syllables: 'pur-ple', definition: 'A colour made from red and blue mixed together', ageGroup: '4-5', category: 'colours' },
  { word: 'music',    ipa: '/\u02C8mju\u02D0.z\u026Ak/', syllables: 'mu-sic', definition: 'Sounds that make a song or melody', ageGroup: '4-5', category: 'arts' },
  { word: 'brave',    ipa: '/bre\u026Av/',         syllables: 'brave',   definition: 'When you try something even when you are a little scared', ageGroup: '4-5', category: 'feelings' },
  { word: 'friend',   ipa: '/fr\u025Bnd/',         syllables: 'friend',  definition: 'Someone you like and play with', ageGroup: '4-5', category: 'social' },
  { word: 'between',  ipa: '/b\u026A\u02C8twi\u02D0n/', syllables: 'be-tween', definition: 'In the middle of two things', ageGroup: '4-5', category: 'position' },

  // ── Early Learners (6-8) ──
  { word: 'consonant', ipa: '/\u02C8k\u0252n.s\u0259.n\u0259nt/', syllables: 'con-so-nant', definition: 'A letter that is not a vowel, like B, C, D', ageGroup: '6-8', category: 'language' },
  { word: 'subtract',  ipa: '/s\u0259b\u02C8tr\u00E6kt/', syllables: 'sub-tract', definition: 'To take away a number from another number', ageGroup: '6-8', category: 'maths' },
  { word: 'continent', ipa: '/\u02C8k\u0252n.t\u026A.n\u0259nt/', syllables: 'con-ti-nent', definition: 'A really big piece of land, like Africa or Asia', ageGroup: '6-8', category: 'geography' },
  { word: 'experiment', ipa: '/\u026Ak\u02C8sp\u025Br.\u026A.m\u0259nt/', syllables: 'ex-per-i-ment', definition: 'A test to find out how something works', ageGroup: '6-8', category: 'science' },
  { word: 'ingredient', ipa: '/\u026An\u02C8\u0261ri\u02D0.di.\u0259nt/', syllables: 'in-gre-di-ent', definition: 'Something you put in a recipe to make food', ageGroup: '6-8', category: 'cooking' },
  { word: 'discover',  ipa: '/d\u026A\u02C8sk\u028Cv.\u0259r/', syllables: 'dis-cov-er', definition: 'To find something new or learn something for the first time', ageGroup: '6-8', category: 'learning' },
  { word: 'encourage', ipa: '/\u026An\u02C8k\u028Cr.\u026Ad\u0292/', syllables: 'en-cour-age', definition: 'To help someone feel they can do something', ageGroup: '6-8', category: 'social' },
  { word: 'imagine',   ipa: '/\u026A\u02C8m\u00E6d\u0292.\u026An/', syllables: 'i-mag-ine', definition: 'To make a picture in your mind of something that is not there', ageGroup: '6-8', category: 'creativity' },
  { word: 'rhythm',    ipa: '/\u02C8r\u026A\u00F0.\u0259m/', syllables: 'rhy-thm', definition: 'A pattern of beats in music', ageGroup: '6-8', category: 'music', note: 'The "rh" makes an "r" sound, and "th" is silent' },
  { word: 'delicate',  ipa: '/\u02C8d\u025Bl.\u026A.k\u0259t/', syllables: 'del-i-cate', definition: 'Very gentle and easy to break', ageGroup: '6-8', category: 'describing' },
];

// ── Educational Phrases ────────────────────────────────────────────────────

export const educationalPhrases: EducationalPhrase[] = [
  {
    id: 'ep-say',
    phrase: 'Can you say...?',
    context: 'Inviting the child to repeat a word or sound',
    ssml: '<speak><prosody rate="88%" pitch="+8%">Can you say <break time="300ms"/></prosody></speak>',
    frequency: 'very-high',
  },
  {
    id: 'ep-count',
    phrase: 'Let us count together!',
    context: 'Starting a counting activity',
    ssml: '<speak><prosody rate="92%" pitch="+10%">Let us count together!</prosody></speak>',
    frequency: 'very-high',
  },
  {
    id: 'ep-find',
    phrase: 'Can you find the...?',
    context: 'Asking the child to locate something on screen',
    ssml: '<speak><prosody rate="90%" pitch="+8%">Can you find the <break time="400ms"/></prosody></speak>',
    frequency: 'very-high',
  },
  {
    id: 'ep-colour',
    phrase: 'What colour is this?',
    context: 'Colour identification prompt',
    ssml: '<speak><prosody rate="90%" pitch="+8%">What colour is this? <break time="800ms"/></prosody></speak>',
    frequency: 'high',
  },
  {
    id: 'ep-point',
    phrase: 'Point to the...',
    context: 'Directing the child to touch a specific item',
    ssml: '<speak><prosody rate="88%" pitch="+5%">Point to the <break time="300ms"/></prosody></speak>',
    frequency: 'high',
  },
  {
    id: 'ep-sound',
    phrase: 'What sound does it make?',
    context: 'Phonics or animal sound prompt',
    ssml: '<speak><prosody rate="90%" pitch="+8%">What sound does it make? <break time="800ms"/></prosody></speak>',
    frequency: 'high',
  },
  {
    id: 'ep-listen',
    phrase: 'Listen carefully!',
    context: 'Before playing an audio clip or saying a key word',
    ssml: '<speak><prosody rate="88%" pitch="+5%">Listen carefully! <break time="500ms"/></prosody></speak>',
    frequency: 'high',
  },
  {
    id: 'ep-together',
    phrase: 'Let us do it together!',
    context: 'Collaborative activity intro',
    ssml: '<speak><prosody rate="92%" pitch="+10%">Let us do it together!</prosody></speak>',
    frequency: 'medium',
  },
  {
    id: 'ep-repeat',
    phrase: 'Say it again with me!',
    context: 'Repetition reinforcement',
    ssml: '<speak><prosody rate="88%" pitch="+8%">Say it again with me! <break time="500ms"/></prosody></speak>',
    frequency: 'medium',
  },
  {
    id: 'ep-show',
    phrase: 'Show me the...',
    context: 'Asking child to identify or point at something',
    ssml: '<speak><prosody rate="88%" pitch="+5%">Show me the <break time="300ms"/></prosody></speak>',
    frequency: 'medium',
  },
  {
    id: 'ep-how-many',
    phrase: 'How many can you see?',
    context: 'Counting prompt',
    ssml: '<speak><prosody rate="90%" pitch="+8%">How many can you see? <break time="800ms"/></prosody></speak>',
    frequency: 'high',
  },
  {
    id: 'ep-next',
    phrase: 'What comes next?',
    context: 'Pattern or sequence activity',
    ssml: '<speak><prosody rate="90%" pitch="+8%">What comes next? <break time="800ms"/></prosody></speak>',
    frequency: 'medium',
  },
];

// ── Lookup Helpers ─────────────────────────────────────────────────────────

const _letterMap = new Map<string, LetterPronunciation>(
  alphabetPronunciations.map((l) => [l.letter.toLowerCase(), l]),
);

const _numberMap = new Map<number, NumberPronunciation>(
  numberPronunciations.map((n) => [n.value, n]),
);

const _vocabMap = new Map<string, VocabularyEntry>(
  vocabularyByAge.map((v) => [v.word.toLowerCase(), v]),
);

const _phonicsMap = new Map<string, PhonicsPattern>(
  phonicsPatterns.map((p) => [p.pattern.toLowerCase(), p]),
);

/**
 * Get pronunciation hint for any word in the system.
 * Checks letters, numbers (by word), vocabulary, and phonics patterns.
 * Returns a human-readable pronunciation hint or undefined.
 */
export function getPronunciationHint(word: string): string | undefined {
  const lower = word.toLowerCase().trim();

  // Check single letter
  if (lower.length === 1 && _letterMap.has(lower)) {
    const l = _letterMap.get(lower)!;
    return `Letter ${l.letter}: name "${l.nameIPA}", sound "${l.friendlySound}" as in ${l.exampleWord}`;
  }

  // Check numbers by word
  const numberEntry = numberPronunciations.find(
    (n) => n.word.toLowerCase() === lower,
  );
  if (numberEntry) {
    return `${numberEntry.word} (${numberEntry.ipa}), syllables: ${numberEntry.syllables}`;
  }

  // Check vocabulary
  if (_vocabMap.has(lower)) {
    const v = _vocabMap.get(lower)!;
    const noteStr = v.note ? ` Note: ${v.note}` : '';
    return `${v.word} (${v.ipa}), syllables: ${v.syllables}. ${v.definition}${noteStr}`;
  }

  // Check phonics patterns within the word
  for (const [pattern, phonics] of _phonicsMap) {
    if (lower.includes(pattern)) {
      return `Contains "${phonics.pattern}" which sounds like "${phonics.friendlySound}" (${phonics.soundIPA})`;
    }
  }

  return undefined;
}

/**
 * Get the pronunciation object for a single letter.
 */
export function getLetterPronunciation(letter: string): LetterPronunciation | undefined {
  return _letterMap.get(letter.toLowerCase().trim());
}

/**
 * Get the pronunciation object for a number 1-20.
 */
export function getNumberPronunciation(value: number): NumberPronunciation | undefined {
  return _numberMap.get(value);
}

/**
 * Get vocabulary entries filtered by age group.
 */
export function getVocabularyForAge(ageGroup: '2-3' | '4-5' | '6-8'): VocabularyEntry[] {
  return vocabularyByAge.filter((v) => v.ageGroup === ageGroup);
}

/**
 * Get all phonics patterns, optionally filtered by those present in a word.
 */
export function getPhonicsInWord(word: string): PhonicsPattern[] {
  const lower = word.toLowerCase();
  return phonicsPatterns.filter((p) => lower.includes(p.pattern));
}
