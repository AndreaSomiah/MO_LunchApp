export interface DietaryOption {
  value: '' | 'vegetarian' | 'vegan' | 'halal' | 'gluten-free' | 'dairy-free';
  label: string;
  emoji: string;
}

export const DIETARY_OPTIONS: readonly DietaryOption[] = [
  { value: '',             label: 'No preference', emoji: '🍽️' },
  { value: 'vegetarian',  label: 'Vegetarian',    emoji: '🥗' },
  { value: 'vegan',       label: 'Vegan',         emoji: '🌱' },
  { value: 'halal',       label: 'Halal',         emoji: '☪️' },
  { value: 'gluten-free', label: 'Gluten-free',   emoji: '🌾' },
  { value: 'dairy-free',  label: 'Dairy-free',    emoji: '🥛' },
] as const;

export const dietaryEmoji = (value: string | undefined | null): string => {
  const found = DIETARY_OPTIONS.find((d) => d.value === (value ?? ''));
  return found?.emoji ?? '🍽️';
};

export const dietaryLabel = (value: string | undefined | null): string => {
  const found = DIETARY_OPTIONS.find((d) => d.value === (value ?? ''));
  return found?.label ?? 'No preference';
};
