export const PASTEL_PALETTE = [
  '#FDE68A', '#FCA5A5', '#A7F3D0', '#BAE6FD', '#DDD6FE',
  '#FED7AA', '#BBF7D0', '#FBCFE8', '#E9D5FF', '#CFFAFE',
] as const;

export interface AvatarOption {
  id: string;
  label: string;
  emoji: string;
  group: 'animal' | 'food';
}

export const AVATAR_ANIMALS: AvatarOption[] = [
  { id: 'bear',      label: 'Bear',      emoji: '🐻', group: 'animal' },
  { id: 'fox',       label: 'Fox',       emoji: '🦊', group: 'animal' },
  { id: 'koala',     label: 'Koala',     emoji: '🐨', group: 'animal' },
  { id: 'penguin',   label: 'Penguin',   emoji: '🐧', group: 'animal' },
  { id: 'lion',      label: 'Lion',      emoji: '🦁', group: 'animal' },
  { id: 'tiger',     label: 'Tiger',     emoji: '🐯', group: 'animal' },
  { id: 'frog',      label: 'Frog',      emoji: '🐸', group: 'animal' },
  { id: 'butterfly', label: 'Butterfly', emoji: '🦋', group: 'animal' },
  { id: 'wolf',      label: 'Wolf',      emoji: '🐺', group: 'animal' },
  { id: 'unicorn',   label: 'Unicorn',   emoji: '🦄', group: 'animal' },
];

export const AVATAR_FOOD: AvatarOption[] = [
  { id: 'pizza',   label: 'Pizza',   emoji: '🍕', group: 'food' },
  { id: 'taco',    label: 'Taco',    emoji: '🌮', group: 'food' },
  { id: 'ramen',   label: 'Ramen',   emoji: '🍜', group: 'food' },
  { id: 'sushi',   label: 'Sushi',   emoji: '🍣', group: 'food' },
  { id: 'avocado', label: 'Avocado', emoji: '🥑', group: 'food' },
  { id: 'donut',   label: 'Donut',   emoji: '🍩', group: 'food' },
  { id: 'cupcake', label: 'Cupcake', emoji: '🧁', group: 'food' },
  { id: 'wrap',    label: 'Wrap',    emoji: '🌯', group: 'food' },
  { id: 'salad',   label: 'Salad',   emoji: '🥗', group: 'food' },
  { id: 'bento',   label: 'Bento',   emoji: '🍱', group: 'food' },
];

export const AVATAR_OPTIONS: AvatarOption[] = [...AVATAR_ANIMALS, ...AVATAR_FOOD];

export const avatarById = (id: string): AvatarOption | undefined =>
  AVATAR_OPTIONS.find((a) => a.id === id);

export const avatarEmoji = (id: string): string =>
  avatarById(id)?.emoji ?? '🐻';

export const avatarDefaultBg = (id: string): string => {
  const animalIdx = AVATAR_ANIMALS.findIndex((a) => a.id === id);
  if (animalIdx >= 0) return PASTEL_PALETTE[animalIdx];
  const foodIdx = AVATAR_FOOD.findIndex((a) => a.id === id);
  return PASTEL_PALETTE[foodIdx >= 0 ? foodIdx : 0];
};
