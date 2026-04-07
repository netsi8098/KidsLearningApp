/**
 * Curated video & songs configuration.
 *
 * All content is hardcoded – no YouTube API key needed for the default experience.
 * Each video entry contains enough metadata to render cards + embed the player.
 * To add new videos, just append to the relevant category array.
 *
 * When a YouTube Data API key is available, the app can optionally fetch fresh
 * results via the videoService. See `src/services/videoService.ts`.
 */

export interface VideoItem {
  id: string;           // YouTube video ID
  title: string;
  channel: string;
  thumbnail: string;    // YouTube thumbnail URL (derived from id)
  duration?: string;    // e.g. "3:42"
  category: VideoCategory;
}

export type VideoCategory =
  | 'learning'
  | 'nursery-rhymes'
  | 'alphabet'
  | 'numbers'
  | 'colors-shapes'
  | 'animals'
  | 'bedtime';

export interface VideoCategoryInfo {
  key: VideoCategory;
  label: string;
  emoji: string;
  color: string;
}

export const videoCategories: VideoCategoryInfo[] = [
  { key: 'learning',        label: 'Learning',        emoji: '📖', color: '#4ECDC4' },
  { key: 'nursery-rhymes',  label: 'Nursery Rhymes',  emoji: '🎵', color: '#FF6B6B' },
  { key: 'alphabet',        label: 'Alphabet',        emoji: '🔤', color: '#A78BFA' },
  { key: 'numbers',         label: 'Numbers',         emoji: '🔢', color: '#FFB347' },
  { key: 'colors-shapes',   label: 'Colors & Shapes', emoji: '🎨', color: '#F472B6' },
  { key: 'animals',         label: 'Animals',         emoji: '🐾', color: '#6BCB77' },
  { key: 'bedtime',         label: 'Bedtime',         emoji: '🌙', color: '#6366F1' },
];

/** Helper to build a YouTube thumbnail URL from a video ID */
function thumb(id: string): string {
  return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}

/**
 * Curated, kid-safe video catalog.
 * All channels here are well-known educational kids channels.
 *
 * Approved channels:
 * - CoComelon, Super Simple Songs, Pinkfong, BabyBus
 * - Jack Hartmann, The Kiboomers, LittleBabyBum
 * - National Geographic Kids, SciShow Kids
 */
export const curatedVideos: VideoItem[] = [
  // === LEARNING ===
  { id: 'ZanHgPprl-0', title: 'Learn Colors, Numbers & ABCs', channel: 'CoComelon', thumbnail: thumb('ZanHgPprl-0'), duration: '15:30', category: 'learning' },
  { id: 'eCbHpeOgPuw', title: 'Learn to Count 1-10', channel: 'Super Simple Songs', thumbnail: thumb('eCbHpeOgPuw'), duration: '3:15', category: 'learning' },
  { id: 'DR-cfDsHCGA', title: 'Learn Shapes for Kids', channel: 'BabyBus', thumbnail: thumb('DR-cfDsHCGA'), duration: '12:45', category: 'learning' },
  { id: '2bLk6gXJNbw', title: 'First Words for Baby', channel: 'Super Simple Songs', thumbnail: thumb('2bLk6gXJNbw'), duration: '20:00', category: 'learning' },

  // === NURSERY RHYMES ===
  { id: 'yCjJyiqpAuU', title: 'Wheels on the Bus', channel: 'CoComelon', thumbnail: thumb('yCjJyiqpAuU'), duration: '3:20', category: 'nursery-rhymes' },
  { id: '0j6k1SNgLcg', title: 'Twinkle Twinkle Little Star', channel: 'Super Simple Songs', thumbnail: thumb('0j6k1SNgLcg'), duration: '2:50', category: 'nursery-rhymes' },
  { id: 'BsSz8MpUvKc', title: 'Old MacDonald Had a Farm', channel: 'Super Simple Songs', thumbnail: thumb('BsSz8MpUvKc'), duration: '4:10', category: 'nursery-rhymes' },
  { id: 'gGKKOqnD-Yw', title: 'Baby Shark Dance', channel: 'Pinkfong', thumbnail: thumb('gGKKOqnD-Yw'), duration: '2:16', category: 'nursery-rhymes' },
  { id: 'e_04ZrNroTo', title: 'Itsy Bitsy Spider', channel: 'CoComelon', thumbnail: thumb('e_04ZrNroTo'), duration: '3:00', category: 'nursery-rhymes' },
  { id: 'fe4fOiaKo5o', title: 'Head Shoulders Knees & Toes', channel: 'Super Simple Songs', thumbnail: thumb('fe4fOiaKo5o'), duration: '2:30', category: 'nursery-rhymes' },

  // === ALPHABET ===
  { id: 'hq3yfQnllfQ', title: 'ABC Song', channel: 'Pinkfong', thumbnail: thumb('hq3yfQnllfQ'), duration: '2:30', category: 'alphabet' },
  { id: 'Y88p4V_BCXE', title: 'Phonics Song with TWO Words', channel: 'ChuChu TV', thumbnail: thumb('Y88p4V_BCXE'), duration: '4:23', category: 'alphabet' },
  { id: 'BELlZKpi1Zs', title: 'ABC Phonics Song', channel: 'Jack Hartmann', thumbnail: thumb('BELlZKpi1Zs'), duration: '5:10', category: 'alphabet' },
  { id: '5XEN4mtV5x4', title: 'A is for Apple', channel: 'The Kiboomers', thumbnail: thumb('5XEN4mtV5x4'), duration: '2:50', category: 'alphabet' },

  // === NUMBERS ===
  { id: 'Yt8GFgxlITs', title: 'Numbers Song 1-20', channel: 'Jack Hartmann', thumbnail: thumb('Yt8GFgxlITs'), duration: '3:45', category: 'numbers' },
  { id: '0TgLtF3PMOc', title: 'Count and Move', channel: 'Jack Hartmann', thumbnail: thumb('0TgLtF3PMOc'), duration: '4:20', category: 'numbers' },
  { id: '85M1yxIcHpw', title: '5 Little Ducks', channel: 'LittleBabyBum', thumbnail: thumb('85M1yxIcHpw'), duration: '3:30', category: 'numbers' },

  // === COLORS & SHAPES ===
  { id: 'zBMOCqk-M3M', title: 'Colors Song', channel: 'Pinkfong', thumbnail: thumb('zBMOCqk-M3M'), duration: '2:30', category: 'colors-shapes' },
  { id: 'jYAQzxgMb3I', title: 'Learn Colors with Balloons', channel: 'BabyBus', thumbnail: thumb('jYAQzxgMb3I'), duration: '8:00', category: 'colors-shapes' },
  { id: 'OEbRDtCAFdU', title: 'Shapes Song for Kids', channel: 'The Kiboomers', thumbnail: thumb('OEbRDtCAFdU'), duration: '3:00', category: 'colors-shapes' },
  { id: '4CWrFXBWIFo', title: 'Rainbow Colors Song', channel: 'Super Simple Songs', thumbnail: thumb('4CWrFXBWIFo'), duration: '2:15', category: 'colors-shapes' },

  // === ANIMALS ===
  { id: 'pWepfJ-8XR0', title: 'Animal Sounds Song', channel: 'Pinkfong', thumbnail: thumb('pWepfJ-8XR0'), duration: '3:00', category: 'animals' },
  { id: 'OwRmivbNgQk', title: 'Animals for Kids', channel: 'National Geographic Kids', thumbnail: thumb('OwRmivbNgQk'), duration: '6:30', category: 'animals' },
  { id: 'p5qwOxlvyhk', title: 'Farm Animals for Toddlers', channel: 'BabyBus', thumbnail: thumb('p5qwOxlvyhk'), duration: '10:00', category: 'animals' },
  { id: 'CI8RqEQmv4Y', title: 'Sea Animals Song', channel: 'Pinkfong', thumbnail: thumb('CI8RqEQmv4Y'), duration: '2:45', category: 'animals' },

  // === BEDTIME ===
  { id: 'GBkT19uH2RQ', title: 'Rock-a-bye Baby', channel: 'Super Simple Songs', thumbnail: thumb('GBkT19uH2RQ'), duration: '3:10', category: 'bedtime' },
  { id: 'ufKmPvdEpfg', title: 'Calm Lullabies for Babies', channel: 'LittleBabyBum', thumbnail: thumb('ufKmPvdEpfg'), duration: '30:00', category: 'bedtime' },
  { id: 'TpGSQOLh1ss', title: 'Hush Little Baby', channel: 'CoComelon', thumbnail: thumb('TpGSQOLh1ss'), duration: '3:15', category: 'bedtime' },
];

/** Get videos for a specific category */
export function getVideosByCategory(category: VideoCategory): VideoItem[] {
  return curatedVideos.filter(v => v.category === category);
}

/** Search videos by title keyword */
export function searchVideos(query: string): VideoItem[] {
  const lower = query.toLowerCase().trim();
  if (!lower) return curatedVideos;
  return curatedVideos.filter(
    v => v.title.toLowerCase().includes(lower) ||
         v.channel.toLowerCase().includes(lower) ||
         v.category.includes(lower)
  );
}
