/**
 * Curated avatar options for child profiles.
 * NO real photos allowed (COPPA compliance).
 * 36 illustrated emoji avatars organized by category.
 */
export const avatarEmojis = [
  // Animals
  '🦊', '🐰', '🐻', '🐼', '🦁', '🐸',
  '🐱', '🐶', '🦄', '🐨', '🐯', '🐷',
  '🦋', '🐙', '🐧', '🐮', '🦒', '🐳',
  '🦜', '🐹', '🦉', '🐢', '🦈', '🐝',
  // Fun characters
  '🤖', '👽', '🦸', '🧙', '🧚', '🎃',
  // Nature & objects
  '🌻', '🌈', '⭐', '🎈', '🚀', '🎨',
];

/** Background colors for avatar circles */
export const avatarColors = [
  '#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA', '#FF8C42',
  '#6BCB77', '#45B7D1', '#FF8FAB', '#FFD93D', '#C3B1E1',
];

/** Get a deterministic color for an avatar */
export function getAvatarColor(emoji: string): string {
  const idx = emoji.charCodeAt(0) % avatarColors.length;
  return avatarColors[idx];
}
