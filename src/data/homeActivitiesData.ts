export interface HomeActivityCategory {
  key: string;
  label: string;
  emoji: string;
}

export interface HomeActivity {
  id: string;
  title: string;
  emoji: string;
  category: string;
  materials: string[];
  durationMinutes: number;
  ageGroup: '2-3' | '4-5' | '6-8' | 'all';
  steps: string[];
  learningOutcome: string;
  parentTip: string;
}

export const homeActivityCategories: HomeActivityCategory[] = [
  { key: 'crafts', label: 'Crafts', emoji: '✂️' },
  { key: 'yoga', label: 'Yoga', emoji: '🧘' },
  { key: 'fitness', label: 'Fitness', emoji: '💪' },
  { key: 'cooking-irl', label: 'Cooking IRL', emoji: '🍳' },
  { key: 'science', label: 'Science', emoji: '🔬' },
  { key: 'outdoor', label: 'Outdoor', emoji: '🌿' },
];

export const homeActivities: HomeActivity[] = [
  // ── Crafts ──
  {
    id: 'ha-crafts-1',
    title: 'Paper Plate Animals',
    emoji: '🐷',
    category: 'crafts',
    materials: ['Paper plates', 'Crayons or markers', 'Glue', 'Construction paper', 'Scissors (grown-up help)'],
    durationMinutes: 20,
    ageGroup: '2-3',
    steps: [
      'Pick an animal you want to make! A pig, a lion, or a bear!',
      'Color the paper plate the animal\'s color (pink for pig, yellow for lion).',
      'Cut out ears, eyes, and a nose from construction paper.',
      'Glue the pieces onto your paper plate.',
      'Add details with markers - whiskers, spots, or stripes!',
      'Hold up your animal and make its sound!',
    ],
    learningOutcome: 'Develops fine motor skills, color recognition, and creative expression.',
    parentTip: 'Let your child choose the animal and colors. There is no wrong way to create! Pre-cut shapes for younger kids.',
  },
  {
    id: 'ha-crafts-2',
    title: 'Finger Painting',
    emoji: '🎨',
    category: 'crafts',
    materials: ['Finger paints (washable)', 'Large paper', 'Old t-shirt or smock', 'Wipes for cleanup'],
    durationMinutes: 15,
    ageGroup: '2-3',
    steps: [
      'Put on your painting shirt to keep clothes clean!',
      'Lay out the big paper on the table or floor.',
      'Dip your fingers in your favorite color.',
      'Make handprints, swirls, dots, and lines!',
      'Try mixing two colors together - what happens?',
      'Let your masterpiece dry and hang it up!',
    ],
    learningOutcome: 'Explores color mixing, sensory play, and self-expression through tactile art.',
    parentTip: 'Cover the work area with newspaper first. Encourage exploration over making a specific picture. Talk about the colors as they paint.',
  },

  // ── Yoga ──
  {
    id: 'ha-yoga-1',
    title: 'Sun Salutation',
    emoji: '🌞',
    category: 'yoga',
    materials: ['Yoga mat or soft carpet', 'Comfortable clothes'],
    durationMinutes: 10,
    ageGroup: '4-5',
    steps: [
      'Stand tall like a mountain with hands at your heart.',
      'Reach up high to the sun! Stretch as tall as you can!',
      'Bend forward and touch the ground like a waterfall.',
      'Step one foot back into a lunge - you\'re a brave warrior!',
      'Come into plank - your body is a strong bridge!',
      'Lower down and lift your chest like a cobra - hisssss!',
      'Push up into downward dog - wag your tail!',
      'Step forward, stand up, and reach for the sun again!',
    ],
    learningOutcome: 'Builds body awareness, flexibility, and mindfulness. Introduces yoga sequencing.',
    parentTip: 'Do the poses alongside your child. Use the animal and nature imagery to keep it fun. Praise effort, not perfection.',
  },
  {
    id: 'ha-yoga-2',
    title: 'Tree Pose Challenge',
    emoji: '🌳',
    category: 'yoga',
    materials: ['Open space', 'Comfortable clothes'],
    durationMinutes: 10,
    ageGroup: '4-5',
    steps: [
      'Stand tall and feel your feet on the ground.',
      'Slowly lift one foot and place it on your ankle or calf.',
      'Bring your hands together at your heart.',
      'Can you balance? Try lifting your arms like branches!',
      'Imagine your roots growing deep into the ground.',
      'Hold for 5 breaths, then switch legs!',
      'Try with your eyes closed for a super challenge!',
    ],
    learningOutcome: 'Develops balance, concentration, and body control. Teaches patience and persistence.',
    parentTip: 'Stand near a wall so they can touch it if they wobble. Falling over is part of learning - make it fun by saying the tree is swaying in the wind!',
  },

  // ── Fitness ──
  {
    id: 'ha-fitness-1',
    title: 'Indoor Treasure Hunt',
    emoji: '🔍',
    category: 'fitness',
    materials: ['Small toys or stickers to hide', 'Paper for clue cards', 'Crayons'],
    durationMinutes: 20,
    ageGroup: '4-5',
    steps: [
      'A grown-up hides 5-10 small treasures around the house.',
      'Draw simple picture clues on paper cards.',
      'Start at the first clue and read it together!',
      'Run, hop, or crawl to find each hidden treasure!',
      'Collect all the treasures in a bag or basket.',
      'Count your treasures at the end! Did you find them all?',
    ],
    learningOutcome: 'Promotes physical activity, problem-solving, counting, and following directions.',
    parentTip: 'Adjust difficulty by age. For younger kids, use picture clues and hide items in obvious spots. For older kids, write word-based clues.',
  },
  {
    id: 'ha-fitness-2',
    title: 'Balloon Volleyball',
    emoji: '🎈',
    category: 'fitness',
    materials: ['A balloon', 'A piece of string or ribbon for the net', 'Open indoor space'],
    durationMinutes: 15,
    ageGroup: '2-3',
    steps: [
      'Blow up a balloon (grown-up helps tie it).',
      'Stretch a string across the room at kid height for a net.',
      'Stand on one side, the other player on the other side.',
      'Hit the balloon back and forth over the string!',
      'Try to keep the balloon from touching the ground!',
      'Count how many times you can pass it back and forth!',
    ],
    learningOutcome: 'Develops hand-eye coordination, counting, and gross motor skills in a safe indoor environment.',
    parentTip: 'Balloons move slowly, making this perfect for young kids. If playing solo, have them hit the balloon up and count how many times before it lands.',
  },

  // ── Cooking IRL ──
  {
    id: 'ha-cooking-1',
    title: 'Make a Sandwich',
    emoji: '🥪',
    category: 'cooking-irl',
    materials: ['Bread slices', 'Butter or cream cheese', 'Fillings (ham, cheese, lettuce)', 'Butter knife'],
    durationMinutes: 10,
    ageGroup: '4-5',
    steps: [
      'Wash your hands first!',
      'Lay two pieces of bread on a clean plate.',
      'Spread butter or cream cheese on one slice.',
      'Add your favorite fillings on top.',
      'Put the second slice of bread on top.',
      'Cut the sandwich in half (grown-up can help!).',
      'Enjoy your sandwich! You made it yourself!',
    ],
    learningOutcome: 'Builds independence, sequencing skills, and healthy eating habits.',
    parentTip: 'Let your child choose the fillings to build ownership. Use a butter knife for safety. Talk about each step as they work through it.',
  },
  {
    id: 'ha-cooking-2',
    title: 'Fruit Salad',
    emoji: '🍇',
    category: 'cooking-irl',
    materials: ['3-4 types of fruit', 'A big bowl', 'A spoon', 'Cutting board (grown-up)'],
    durationMinutes: 10,
    ageGroup: '2-3',
    steps: [
      'Wash your hands and the fruit!',
      'A grown-up cuts the fruit into small pieces.',
      'Put each type of fruit into the big bowl.',
      'Name the colors as you add them - red strawberry, yellow banana!',
      'Gently mix everything with a spoon.',
      'Scoop some into a small bowl and taste it!',
    ],
    learningOutcome: 'Teaches color recognition, healthy eating, and following multi-step directions.',
    parentTip: 'Let kids help with soft fruit using a butter knife. Name each fruit and its color. Ask "What color is this?" as you go.',
  },

  // ── Science ──
  {
    id: 'ha-science-1',
    title: 'Baking Soda Volcano',
    emoji: '🌋',
    category: 'science',
    materials: ['Baking soda', 'Vinegar', 'Dish soap', 'Food coloring', 'A cup or small container', 'A tray to catch the mess'],
    durationMinutes: 15,
    ageGroup: '6-8',
    steps: [
      'Place the cup on a tray to catch the overflow.',
      'Put 2 big spoonfuls of baking soda in the cup.',
      'Add a squirt of dish soap and a few drops of food coloring.',
      'Slowly pour in vinegar and watch what happens!',
      'The volcano erupts! Fizzy lava overflows!',
      'Talk about why: vinegar and baking soda make a gas called carbon dioxide!',
    ],
    learningOutcome: 'Introduces chemical reactions, cause and effect, and scientific observation skills.',
    parentTip: 'Do this on a tray or in the sink for easy cleanup. Ask your child to predict what will happen before adding the vinegar. Repeat with different amounts to compare.',
  },
  {
    id: 'ha-science-2',
    title: 'Color Mixing Magic',
    emoji: '🎨',
    category: 'science',
    materials: ['3 cups of water', 'Red, yellow, and blue food coloring', 'Paper towels', 'Extra empty cups'],
    durationMinutes: 15,
    ageGroup: '4-5',
    steps: [
      'Fill 3 cups with water.',
      'Add red food coloring to one, yellow to another, blue to the third.',
      'Pour a little red and yellow into an empty cup. What color do you see?',
      'Pour a little blue and yellow into another cup. What happens?',
      'Mix red and blue together! A new color appears!',
      'You discovered: red + yellow = orange, blue + yellow = green, red + blue = purple!',
    ],
    learningOutcome: 'Teaches primary and secondary colors, predictions, and the basics of color theory.',
    parentTip: 'Have your child guess the result before mixing. Use an old tablecloth to protect surfaces. This is a great time to introduce "what if" questions.',
  },

  // ── Outdoor ──
  {
    id: 'ha-outdoor-1',
    title: 'Nature Walk Bingo',
    emoji: '🌿',
    category: 'outdoor',
    materials: ['Paper', 'Crayons or markers', 'A clipboard or book to lean on'],
    durationMinutes: 30,
    ageGroup: '4-5',
    steps: [
      'Draw a 3x3 grid on paper to make a bingo card.',
      'In each square, draw something to find: a bird, a flower, a rock, a leaf, etc.',
      'Go outside on a nature walk!',
      'When you spot something on your card, cross it off!',
      'Try to get 3 in a row for BINGO!',
      'Can you find everything on your card?',
    ],
    learningOutcome: 'Encourages outdoor exploration, observation skills, and nature awareness.',
    parentTip: 'Pre-draw the bingo card for younger kids. Adjust items to your area (beach, park, backyard). Bring a bag to collect small natural treasures like leaves or pebbles.',
  },
  {
    id: 'ha-outdoor-2',
    title: 'Cloud Watching',
    emoji: '☁️',
    category: 'outdoor',
    materials: ['A blanket', 'A partly cloudy day'],
    durationMinutes: 15,
    ageGroup: '2-3',
    steps: [
      'Spread out a blanket in the yard or park.',
      'Lie on your back and look up at the sky!',
      'Point to a cloud - what shape does it look like?',
      'Is it a bunny? A dragon? A big ice cream cone?',
      'Watch the clouds move slowly across the sky.',
      'Take a deep breath and enjoy the peaceful sky!',
    ],
    learningOutcome: 'Stimulates imagination, calming mindfulness, and descriptive language skills.',
    parentTip: 'This is a wonderful calming activity. Ask open-ended questions like "What else could that cloud be?" Share your own cloud shapes too. Great for winding down.',
  },
];
