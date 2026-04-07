export interface AudioCategory {
  key: string;
  label: string;
  emoji: string;
}

export interface AudioEpisode {
  id: string;
  title: string;
  emoji: string;
  category: string;
  ageGroup: string;
  duration: string;
  ttsText: string;
}

export const audioCategories: AudioCategory[] = [
  { key: 'bedtime-stories', label: 'Bedtime Stories', emoji: '🌙' },
  { key: 'sing-along', label: 'Sing Along', emoji: '🎵' },
  { key: 'fun-facts', label: 'Fun Facts', emoji: '🌤️' },
  { key: 'careers', label: 'Careers', emoji: '👩‍⚕️' },
  { key: 'calm-audio', label: 'Calm Audio', emoji: '🌧️' },
  { key: 'daily-routines', label: 'Daily Routines', emoji: '🌅' },
];

export const audioEpisodes: AudioEpisode[] = [
  // ── Bedtime Stories ──────────────────────────────────────
  {
    id: 'bs-1',
    title: 'The Sleepy Bear',
    emoji: '🐻',
    category: 'bedtime-stories',
    ageGroup: '2-3',
    duration: '3 min',
    ttsText:
      'Once upon a time, a little bear yawned under the big oak tree. He stretched his fuzzy paws and curled up on a bed of soft leaves. The moonlight whispered goodnight, and the sleepy bear drifted into happy dreams full of honey and butterflies.',
  },
  {
    id: 'bs-2',
    title: 'Moonlight Lullaby',
    emoji: '🌙',
    category: 'bedtime-stories',
    ageGroup: '2-3',
    duration: '4 min',
    ttsText:
      'The moon rose high above the sleepy village. She hummed a gentle lullaby that floated through every open window. Bunnies in their burrows, birds in their nests, and kittens on warm pillows all closed their eyes and smiled as the moonlight song wrapped them in a cozy blanket of dreams.',
  },
  {
    id: 'bs-3',
    title: 'Stars and Dreams',
    emoji: '⭐',
    category: 'bedtime-stories',
    ageGroup: '4-5',
    duration: '5 min',
    ttsText:
      'Little Mia loved watching stars from her bedroom window. One night, a tiny star floated down and landed on her pillow. It whispered, "Make a wish!" Mia wished for an adventure in the sky. Together they soared past fluffy clouds and danced with the northern lights before the star gently carried her back home to sleep.',
  },

  // ── Sing Along ───────────────────────────────────────────
  {
    id: 'sa-1',
    title: 'ABC Song',
    emoji: '🎵',
    category: 'sing-along',
    ageGroup: '2-3',
    duration: '2 min',
    ttsText:
      'A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, and Z! Now I know my ABCs. Next time won\'t you sing with me? Great job singing along! Every letter is special and makes wonderful words.',
  },
  {
    id: 'sa-2',
    title: 'Counting Song',
    emoji: '🔢',
    category: 'sing-along',
    ageGroup: '2-3',
    duration: '3 min',
    ttsText:
      'One little finger, two little fingers, three little fingers, four! Five little fingers, six little fingers, seven little fingers, more! Eight little fingers, nine little fingers, ten fingers waving high! Count them all together now, reaching for the sky! Wonderful counting!',
  },
  {
    id: 'sa-3',
    title: 'Color Rainbow',
    emoji: '🌈',
    category: 'sing-along',
    ageGroup: '4-5',
    duration: '3 min',
    ttsText:
      'Red and orange, yellow and green, blue and purple make a rainbow seen! Paint the sky with colors bright, every shade is pure delight. Red like apples, blue like the sea, green like the grass beneath a tree. Sing the colors, one by one, rainbow magic is so fun!',
  },

  // ── Fun Facts ────────────────────────────────────────────
  {
    id: 'ff-1',
    title: 'Why is the Sky Blue?',
    emoji: '🌤️',
    category: 'fun-facts',
    ageGroup: '4-5',
    duration: '3 min',
    ttsText:
      'Have you ever looked up and wondered why the sky is blue? Sunlight looks white, but it is actually made of all the colors of the rainbow! When sunlight hits the tiny air molecules, blue light bounces around the most because it travels in short waves. That is why we see a beautiful blue sky on a sunny day!',
  },
  {
    id: 'ff-2',
    title: 'How Do Fish Breathe?',
    emoji: '🐟',
    category: 'fun-facts',
    ageGroup: '4-5',
    duration: '4 min',
    ttsText:
      'Fish live underwater, but they still need oxygen just like us! Instead of lungs, fish have special body parts called gills on the sides of their heads. Water flows in through their mouths and passes over the gills, which grab the oxygen out of the water. It is like magic breathing underwater! Pretty cool, right?',
  },
  {
    id: 'ff-3',
    title: 'Why Do Stars Twinkle?',
    emoji: '✨',
    category: 'fun-facts',
    ageGroup: '6-8',
    duration: '4 min',
    ttsText:
      'When you look up at night, stars seem to twinkle and dance. But stars do not actually blink! Their light travels through layers of our atmosphere, and the moving air bends the light back and forth. This bending makes the starlight shimmer and sparkle. The closer a star is to the horizon, the more it seems to twinkle!',
  },

  // ── Careers ──────────────────────────────────────────────
  {
    id: 'ca-1',
    title: 'A Day as a Doctor',
    emoji: '👩‍⚕️',
    category: 'careers',
    ageGroup: '4-5',
    duration: '4 min',
    ttsText:
      'Good morning, Doctor! Today you put on your white coat and stethoscope. First, you check on a little boy with a tummy ache and give him medicine to feel better. Then you help a girl with a scraped knee by cleaning it gently and putting on a colorful bandage. Doctors help people feel healthy and happy every day!',
  },
  {
    id: 'ca-2',
    title: 'A Day as a Firefighter',
    emoji: '🚒',
    category: 'careers',
    ageGroup: '4-5',
    duration: '3 min',
    ttsText:
      'The alarm rings at the fire station! You slide down the pole and jump into your big red fire truck. Sirens wailing, you race to help a family whose kitchen has smoke. You spray water with the big hose and make sure everyone is safe. Firefighters are brave heroes who protect our neighborhoods!',
  },
  {
    id: 'ca-3',
    title: 'A Day as a Teacher',
    emoji: '👩‍🏫',
    category: 'careers',
    ageGroup: '4-5',
    duration: '4 min',
    ttsText:
      'Welcome to your classroom, Teacher! The children wave hello as they sit at their colorful desks. You read a fun story, then teach them how to count to twenty. At recess, you play tag together. After lunch, the class paints beautiful pictures. Teachers make learning exciting and help children discover amazing things every single day!',
  },

  // ── Calm Audio ───────────────────────────────────────────
  {
    id: 'cl-1',
    title: 'Gentle Rain Sounds',
    emoji: '🌧️',
    category: 'calm-audio',
    ageGroup: 'all',
    duration: '5 min',
    ttsText:
      'Close your eyes and imagine soft raindrops falling on a tin roof. Pitter patter, pitter patter. Each drop is gentle and calm. The rain washes the flowers and fills the puddles where little ducks swim. Breathe in slowly, breathe out slowly. Let the peaceful sound of rain relax your whole body from head to toe.',
  },
  {
    id: 'cl-2',
    title: 'Forest Morning',
    emoji: '🌲',
    category: 'calm-audio',
    ageGroup: 'all',
    duration: '5 min',
    ttsText:
      'Imagine walking through a quiet forest in the early morning. Sunlight peeks through tall green trees. Birds sing cheerful songs. A gentle breeze rustles the leaves above you. You take a deep breath and smell fresh pine and wildflowers. A friendly squirrel hops nearby. Everything feels peaceful, safe, and perfectly calm in this magical forest.',
  },
  {
    id: 'cl-3',
    title: 'Peaceful Ocean',
    emoji: '🌊',
    category: 'calm-audio',
    ageGroup: 'all',
    duration: '5 min',
    ttsText:
      'Picture a beautiful beach with warm golden sand. Gentle waves roll in and softly wash over your toes. Whoosh, whoosh, whoosh. Seagulls glide through the blue sky. A warm breeze touches your cheeks. You feel so relaxed listening to the rhythm of the ocean. Let each wave carry away your worries. Peace and calm surround you.',
  },

  // ── Daily Routines ───────────────────────────────────────
  {
    id: 'dr-1',
    title: 'Morning Routine Song',
    emoji: '🌅',
    category: 'daily-routines',
    ageGroup: '2-3',
    duration: '2 min',
    ttsText:
      'Good morning, sunshine, time to start the day! Stretch your arms up high, hip hip hooray! Wash your face with water, brush your teeth so bright, pick your favorite clothes and get dressed just right. Eat a yummy breakfast, milk and toast hooray! Now you are all ready for a wonderful day!',
  },
  {
    id: 'dr-2',
    title: 'Brush Your Teeth!',
    emoji: '🪥',
    category: 'daily-routines',
    ageGroup: '2-3',
    duration: '2 min',
    ttsText:
      'Grab your toothbrush, squeeze the paste, brush brush brush, no time to waste! Top teeth first, then bottom too, scrub the front and back for you. Round and round in little circles, making all those germs go away. Brush for two whole minutes and your smile will shine all day! Sparkle sparkle, great job!',
  },
  {
    id: 'dr-3',
    title: 'Getting Ready for Bed',
    emoji: '🛏️',
    category: 'daily-routines',
    ageGroup: '2-3',
    duration: '3 min',
    ttsText:
      'The sun is going down, it is time for bed! Put on your cozy pajamas, rest your sleepy head. Brush your teeth so clean, wash your hands and face. Pick your favorite stuffed animal and find your sleeping place. Mommy or daddy reads a story, then tucks you in so tight. Close your eyes, sweet dreams, goodnight goodnight goodnight!',
  },
];
