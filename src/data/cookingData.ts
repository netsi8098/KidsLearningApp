export interface CookingCategory {
  key: string;
  label: string;
  emoji: string;
}

export interface RecipeStep {
  text: string;
  emoji: string;
}

export interface RecipeQuiz {
  question: string;
  options: string[];
  correct: number;
}

export interface CookingRecipe {
  id: string;
  title: string;
  emoji: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prepTime: string;
  ageGroup: '2-3' | '4-5' | '6-8' | 'all';
  safetyNote?: string;
  learningGoals: string[];
  vocabularyWords: string[];
  ingredients: string[];
  steps: RecipeStep[];
  quiz?: RecipeQuiz[];
}

export const cookingCategories: CookingCategory[] = [
  { key: 'snacks', label: 'Snacks', emoji: '🍪' },
  { key: 'fruit-fun', label: 'Fruit Fun', emoji: '🍓' },
  { key: 'no-bake', label: 'No-Bake', emoji: '🥣' },
  { key: 'healthy-habits', label: 'Healthy Habits', emoji: '💚' },
  { key: 'kitchen-vocab', label: 'Kitchen Vocab', emoji: '📖' },
];

export const cookingRecipes: CookingRecipe[] = [
  // ── Snacks ──
  {
    id: 'sn-1',
    title: 'Ants on a Log',
    emoji: '🐜',
    category: 'snacks',
    difficulty: 'easy',
    prepTime: '5 min',
    ageGroup: '4-5',
    safetyNote: 'Ask a grown-up to help with cutting!',
    learningGoals: ['Following steps', 'Healthy eating'],
    vocabularyWords: ['celery', 'spread', 'groove'],
    ingredients: ['Celery', 'Peanut butter', 'Raisins'],
    steps: [
      { text: 'Wash the celery sticks', emoji: '🧼' },
      { text: 'Spread peanut butter in the groove', emoji: '🥜' },
      { text: 'Place raisins on top - those are the ants!', emoji: '🐜' },
      { text: 'Enjoy your snack!', emoji: '😋' },
    ],
    quiz: [
      {
        question: 'What do the raisins represent?',
        options: ['Ants', 'Rocks', 'Stars', 'Dots'],
        correct: 0,
      },
    ],
  },
  {
    id: 'sn-2',
    title: 'Trail Mix',
    emoji: '🥜',
    category: 'snacks',
    difficulty: 'easy',
    prepTime: '3 min',
    ageGroup: '2-3',
    safetyNote: 'Check for allergies before starting!',
    learningGoals: ['Counting', 'Mixing'],
    vocabularyWords: ['mix', 'scoop', 'handful'],
    ingredients: ['Cereal', 'Pretzels', 'Raisins', 'Dried fruit'],
    steps: [
      { text: 'Scoop cereal into a big bowl', emoji: '🥣' },
      { text: 'Add a handful of pretzels', emoji: '🥨' },
      { text: 'Toss in some raisins', emoji: '🍇' },
      { text: 'Mix everything together!', emoji: '🥄' },
      { text: 'Scoop into a cup and enjoy!', emoji: '😊' },
    ],
  },

  // ── Fruit Fun ──
  {
    id: 'ff-1',
    title: 'Fruit Rainbow',
    emoji: '🌈',
    category: 'fruit-fun',
    difficulty: 'easy',
    prepTime: '5 min',
    ageGroup: '2-3',
    safetyNote: 'A grown-up should cut the fruit first!',
    learningGoals: ['Colors', 'Sorting', 'Healthy eating'],
    vocabularyWords: ['arrange', 'rainbow', 'row'],
    ingredients: ['Strawberries', 'Orange slices', 'Banana', 'Kiwi', 'Blueberries', 'Grapes'],
    steps: [
      { text: 'Place red strawberries in a row', emoji: '🍓' },
      { text: 'Add orange slices next to them', emoji: '🍊' },
      { text: 'Line up yellow banana pieces', emoji: '🍌' },
      { text: 'Add green kiwi slices', emoji: '🥝' },
      { text: 'Place blue blueberries in a row', emoji: '🫐' },
      { text: 'Finish with purple grapes! A fruit rainbow!', emoji: '🍇' },
    ],
    quiz: [
      {
        question: 'What color is a blueberry?',
        options: ['Red', 'Blue', 'Green', 'Yellow'],
        correct: 1,
      },
    ],
  },
  {
    id: 'ff-2',
    title: 'Banana Sushi',
    emoji: '🍌',
    category: 'fruit-fun',
    difficulty: 'easy',
    prepTime: '5 min',
    ageGroup: '4-5',
    safetyNote: 'A grown-up should help with slicing!',
    learningGoals: ['Following steps', 'Fine motor skills'],
    vocabularyWords: ['spread', 'roll', 'slice'],
    ingredients: ['Banana', 'Tortilla or flatbread', 'Peanut butter or cream cheese', 'Sprinkles or granola'],
    steps: [
      { text: 'Lay the tortilla flat on a plate', emoji: '🫓' },
      { text: 'Spread peanut butter all over it', emoji: '🥜' },
      { text: 'Place a banana at one edge', emoji: '🍌' },
      { text: 'Roll the tortilla around the banana tightly', emoji: '🌯' },
      { text: 'A grown-up slices it into little rounds', emoji: '🔪' },
      { text: 'Your banana sushi is ready!', emoji: '🍣' },
    ],
  },

  // ── No-Bake ──
  {
    id: 'nb-1',
    title: 'Energy Balls',
    emoji: '⚡',
    category: 'no-bake',
    difficulty: 'medium',
    prepTime: '10 min',
    ageGroup: '6-8',
    safetyNote: 'A grown-up should measure the honey!',
    learningGoals: ['Measuring', 'Mixing', 'Following recipes'],
    vocabularyWords: ['measure', 'combine', 'roll', 'chill'],
    ingredients: ['Oats', 'Honey', 'Peanut butter', 'Chocolate chips', 'Flax seeds'],
    steps: [
      { text: 'Measure 1 cup of oats into a bowl', emoji: '🥣' },
      { text: 'Add 2 big spoonfuls of peanut butter', emoji: '🥜' },
      { text: 'A grown-up adds a drizzle of honey', emoji: '🍯' },
      { text: 'Sprinkle in some chocolate chips', emoji: '🍫' },
      { text: 'Mix everything together well', emoji: '🥄' },
      { text: 'Roll the mix into small balls with your hands', emoji: '🖐️' },
      { text: 'Put them in the fridge for 30 minutes', emoji: '❄️' },
      { text: 'Enjoy your energy balls!', emoji: '⚡' },
    ],
    quiz: [
      {
        question: 'What do you do after rolling the balls?',
        options: ['Eat them right away', 'Put them in the fridge', 'Bake them', 'Throw them away'],
        correct: 1,
      },
    ],
  },
  {
    id: 'nb-2',
    title: 'Yogurt Parfait',
    emoji: '🍨',
    category: 'no-bake',
    difficulty: 'easy',
    prepTime: '5 min',
    ageGroup: '4-5',
    learningGoals: ['Layering', 'Colors', 'Healthy eating'],
    vocabularyWords: ['layer', 'parfait', 'sprinkle'],
    ingredients: ['Yogurt', 'Granola', 'Berries', 'Honey'],
    steps: [
      { text: 'Spoon yogurt into the bottom of a cup', emoji: '🥛' },
      { text: 'Add a layer of crunchy granola', emoji: '🥣' },
      { text: 'Drop in some colorful berries', emoji: '🍓' },
      { text: 'Add another layer of yogurt', emoji: '🥛' },
      { text: 'Top with more berries and a drizzle of honey', emoji: '🍯' },
      { text: 'Your parfait is beautiful and yummy!', emoji: '🎉' },
    ],
  },

  // ── Healthy Habits ──
  {
    id: 'hh-1',
    title: 'Drinking Water',
    emoji: '💧',
    category: 'healthy-habits',
    difficulty: 'easy',
    prepTime: '2 min',
    ageGroup: '2-3',
    learningGoals: ['Healthy habits', 'Self-care'],
    vocabularyWords: ['hydrate', 'thirsty', 'sip'],
    ingredients: ['Water', 'A fun cup or water bottle'],
    steps: [
      { text: 'Get your favorite cup or water bottle', emoji: '🥤' },
      { text: 'Fill it up with fresh, cool water', emoji: '🚰' },
      { text: 'Take a big sip! Ahhh!', emoji: '😊' },
      { text: 'Water keeps your body strong and healthy!', emoji: '💪' },
      { text: 'Try to drink water many times today!', emoji: '⭐' },
    ],
    quiz: [
      {
        question: 'Why should we drink water?',
        options: ['It makes us fly', 'It keeps us healthy and strong', 'It makes us invisible'],
        correct: 1,
      },
    ],
  },
  {
    id: 'hh-2',
    title: 'Food Groups',
    emoji: '🥗',
    category: 'healthy-habits',
    difficulty: 'easy',
    prepTime: '5 min',
    ageGroup: '4-5',
    learningGoals: ['Nutrition', 'Sorting', 'Food knowledge'],
    vocabularyWords: ['protein', 'grains', 'dairy', 'vegetables', 'fruits'],
    ingredients: ['No ingredients needed - this is a learning activity!'],
    steps: [
      { text: 'Fruits give us vitamins! Apples, bananas, oranges!', emoji: '🍎' },
      { text: 'Veggies make us strong! Carrots, broccoli, peas!', emoji: '🥦' },
      { text: 'Grains give us energy! Bread, rice, pasta!', emoji: '🍞' },
      { text: 'Protein builds muscles! Chicken, beans, eggs!', emoji: '🍗' },
      { text: 'Dairy makes bones strong! Milk, cheese, yogurt!', emoji: '🥛' },
      { text: 'Eat from all groups every day!', emoji: '🌟' },
    ],
    quiz: [
      {
        question: 'Which food group gives us energy?',
        options: ['Grains', 'Candy', 'Soda'],
        correct: 0,
      },
      {
        question: 'What makes our bones strong?',
        options: ['Dairy', 'Cookies', 'Chips'],
        correct: 0,
      },
    ],
  },

  // ── Kitchen Vocab ──
  {
    id: 'kv-1',
    title: 'Kitchen Tools',
    emoji: '🍴',
    category: 'kitchen-vocab',
    difficulty: 'easy',
    prepTime: '3 min',
    ageGroup: '2-3',
    learningGoals: ['Vocabulary', 'Object identification'],
    vocabularyWords: ['spoon', 'fork', 'plate', 'cup', 'bowl', 'napkin'],
    ingredients: ['No ingredients needed - this is a learning activity!'],
    steps: [
      { text: 'A spoon helps us scoop and stir!', emoji: '🥄' },
      { text: 'A fork helps us poke and pick up food!', emoji: '🍴' },
      { text: 'A plate holds our delicious food!', emoji: '🍽️' },
      { text: 'A cup holds our drink!', emoji: '🥤' },
      { text: 'A bowl is great for soup and cereal!', emoji: '🥣' },
      { text: 'A napkin keeps us clean! Great job learning!', emoji: '🧻' },
    ],
    quiz: [
      {
        question: 'What do we use to scoop and stir?',
        options: ['A spoon', 'A plate', 'A napkin'],
        correct: 0,
      },
    ],
  },
  {
    id: 'kv-2',
    title: 'Cooking Actions',
    emoji: '👩‍🍳',
    category: 'kitchen-vocab',
    difficulty: 'easy',
    prepTime: '3 min',
    ageGroup: '4-5',
    learningGoals: ['Vocabulary', 'Action words'],
    vocabularyWords: ['stir', 'mix', 'pour', 'chop', 'spread', 'peel'],
    ingredients: ['No ingredients needed - this is a learning activity!'],
    steps: [
      { text: 'STIR means to move a spoon in circles!', emoji: '🥄' },
      { text: 'MIX means to combine things together!', emoji: '🫘' },
      { text: 'POUR means to tip a liquid out carefully!', emoji: '🫗' },
      { text: 'CHOP means to cut into pieces (grown-ups only!)!', emoji: '🔪' },
      { text: 'SPREAD means to move something flat across!', emoji: '🧈' },
      { text: 'PEEL means to take off the outside skin!', emoji: '🍌' },
      { text: 'Now you know cooking words! Chef superstar!', emoji: '⭐' },
    ],
    quiz: [
      {
        question: 'What does POUR mean?',
        options: ['Cut into pieces', 'Tip a liquid out carefully', 'Take off the skin'],
        correct: 1,
      },
      {
        question: 'What does PEEL mean?',
        options: ['Move a spoon in circles', 'Combine things together', 'Take off the outside skin'],
        correct: 2,
      },
    ],
  },
];
