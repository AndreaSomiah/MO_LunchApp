export interface Vibe {
  category: 'dev' | 'joke' | 'lyric' | 'meme';
  text: string;
  attribution?: string;
}

export const DAILY_VIBES: Vibe[] = [
  // Developer
  { category: 'dev', text: 'There are 10 kinds of people in the world: those who understand binary, and those who don\u2019t.' },
  { category: 'dev', text: 'Why do programmers prefer dark mode? Because light attracts bugs.' },
  { category: 'dev', text: '99 little bugs in the code, 99 little bugs\u2026 take one down, patch it around \u2014 117 little bugs in the code.' },
  { category: 'dev', text: 'A SQL query walks into a bar, walks up to two tables and asks: "Can I join you?"' },
  { category: 'dev', text: 'It\u2019s not a bug \u2014 it\u2019s an undocumented feature.' },
  { category: 'dev', text: 'Real programmers count from zero. Everyone else is off by one.' },
  { category: 'dev', text: 'I would tell you a UDP joke, but you might not get it.' },
  { category: 'dev', text: 'Knock knock. \u2014 Who\u2019s there? \u2014 \u2026 (very long pause) \u2026 Java.' },

  // General jokes
  { category: 'joke', text: 'I told my computer I needed a break, and it said: "No problem \u2014 I\u2019ll go to sleep."' },
  { category: 'joke', text: 'Why don\u2019t scientists trust atoms? Because they make up everything.' },
  { category: 'joke', text: 'I\u2019m on a seafood diet. I see food and I eat it.' },
  { category: 'joke', text: 'Parallel lines have so much in common\u2026 it\u2019s a shame they\u2019ll never meet.' },
  { category: 'joke', text: 'I used to play piano by ear. Now I use my hands.' },
  { category: 'joke', text: 'What do you call cheese that isn\u2019t yours? Nacho cheese.' },

  // Song lyrics
  { category: 'lyric', text: '"Don\u2019t stop believin\u2019, hold on to that feelin\u2019\u2026"', attribution: 'Journey' },
  { category: 'lyric', text: '"Cause baby you\u2019re a firework \u2014 come on, show \u2018em what you\u2019re worth."', attribution: 'Katy Perry' },
  { category: 'lyric', text: '"Here comes the sun, doo-da-doo-doo \u2014 and I say, it\u2019s alright."', attribution: 'The Beatles' },
  { category: 'lyric', text: '"I got the eye of the tiger, a fighter, dancing through the fire."', attribution: 'Katy Perry' },
  { category: 'lyric', text: '"We are the champions, my friends \u2014 and we\u2019ll keep on fighting till the end."', attribution: 'Queen' },
  { category: 'lyric', text: '"Shake it off, shake it off."', attribution: 'Taylor Swift' },
  { category: 'lyric', text: '"Hakuna matata \u2014 it means no worries for the rest of your days."', attribution: 'The Lion King' },

  // Memes / one-liners
  { category: 'meme', text: 'Stonks \uD83D\uDCC8 \u2014 your lunch order portfolio is up 12% this week.' },
  { category: 'meme', text: 'Me, opening the fridge for the 4th time hoping something new appeared.' },
  { category: 'meme', text: 'POV: it\u2019s 11:58 and you forgot to place your lunch order. \uD83D\uDE2C' },
  { category: 'meme', text: 'One does not simply\u2026 skip lunch.' },
  { category: 'meme', text: 'Lunch hits different when someone else orders it for you.' },
  { category: 'meme', text: 'Task failed successfully \u2705' },
];

const CATEGORY_META: Record<Vibe['category'], { label: string; emoji: string; bg: string; fg: string }> = {
  dev:   { label: 'Dev humour',      emoji: '\uD83D\uDCBB', bg: '#DDD6FE', fg: '#4C1D95' },
  joke:  { label: 'Daily joke',      emoji: '\uD83D\uDE04', bg: '#FDE68A', fg: '#92400E' },
  lyric: { label: 'Song of the day', emoji: '\uD83C\uDFB5', bg: '#BAE6FD', fg: '#075985' },
  meme:  { label: 'Mood',            emoji: '\uD83D\uDD25', bg: '#FBCFE8', fg: '#9D174D' },
};

export const categoryMeta = (c: Vibe['category']): { label: string; emoji: string; bg: string; fg: string } =>
  CATEGORY_META[c];

export const pickDailyVibe = (seed: Date = new Date()): Vibe => {
  // Stable pick per day so the dashboard does not flicker between renders.
  const dayKey = Number(`${seed.getFullYear()}${seed.getMonth() + 1}${seed.getDate()}`);
  return DAILY_VIBES[dayKey % DAILY_VIBES.length]!;
};

export const pickRandomVibe = (): Vibe =>
  DAILY_VIBES[Math.floor(Math.random() * DAILY_VIBES.length)]!;
