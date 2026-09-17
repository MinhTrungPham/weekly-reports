export interface HeroContent {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  badge: string;
}

export interface FeatureItem {
  number: string;
  title: string;
  description: string;
  accent: string;
}

export interface CharacterProfile {
  name: string;
  role: string;
  description: string;
  image: string;
  imageAlt: string;
  accent: string;
}

export interface TeamMember extends CharacterProfile {
  mark: string;
}

export interface TimelineEntry {
  era: string;
  title: string;
  description: string;
}

export interface IconicMoment {
  label: string;
  title: string;
  description: string;
  image: string;
}

export interface JutsuItem {
  name: string;
  type: string;
  description: string;
  symbol: string;
  image: string;
}

export interface QuoteItem {
  quote: string;
  speaker: string;
  context: string;
}

export interface RivalryContent {
  kicker: string;
  title: string;
  description: string;
  left: string;
  right: string;
}

export const narutoHero: HeroContent = {
  eyebrow: "木ノ葉隠れの里 / THE HIDDEN LEAF",
  title: "The way of the ninja is never a straight line.",
  description: "A cinematic field guide to the shinobi world, its bonds, and one loud-hearted ninja who refused to give up.",
  image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdTv_S0APGcZXaV-tfgAk-sH9kwyhU_1X-3hTevj_tyw&s=10",
  imageAlt: "Naruto Uzumaki on the cover of the first manga volume",
  badge: "火の意志 / WILL OF FIRE",
};

export const shinobiWorld: FeatureItem[] = [
  { number: "01", title: "Chakra", description: "The energy that turns discipline, instinct and imagination into jutsu.", accent: "orange" },
  {
    number: "02",
    title: "Bonds",
    description: "Every mission is shaped by the people who stand beside you and the ones you choose to protect.",
    accent: "yellow",
  },
  { number: "03", title: "Will of Fire", description: "A village survives when its people carry the next generation forward.", accent: "red" },
];

export const characters: CharacterProfile[] = [
  {
    name: "Naruto Uzumaki",
    role: "The loud one",
    description: "From the village outcast to the shinobi who made recognition impossible to ignore.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEX9LjT2nGzl08qSD6Fbgj-qV--jZKDcExY1J28AsKFg&s=10",
    imageAlt: "Naruto Uzumaki",
    accent: "orange",
  },
  {
    name: "Sasuke Uchiha",
    role: "The avenger",
    description: "A prodigy walking the long road between revenge, truth and belonging.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVEe9mi5mgbKF0t2OtCHt8gv2OVffoiH6AKP0t6AOQTg&s=10",
    imageAlt: "Sasuke Uchiha",
    accent: "blue",
  },
  {
    name: "Sakura Haruno",
    role: "The medic",
    description: "Precision, courage and a strength that was always more than first impressions.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQX7ogfDwbsQUwwcf3rZyY0Mm-D5CLWqcZbRo4n5w6-NQ&s=10",
    imageAlt: "Sakura Haruno",
    accent: "pink",
  },
];

export const journey: TimelineEntry[] = [
  { era: "01 / BEGINNING", title: "The academy", description: "A lonely prankster discovers the first shape of his dream." },
  { era: "02 / EXAM", title: "Chunin trials", description: "The forest, the arena and the first glimpse of a world much larger than home." },
  { era: "03 / DEPARTURE", title: "The search", description: "Friends become rivals as every path demands a choice." },
  { era: "04 / LEGACY", title: "The next generation", description: "The will of fire passes forward, changed but never extinguished." },
];

export const iconicMoments: IconicMoment[] = [
  {
    label: "01 / PROMISE",
    title: "I never go back on my word.",
    description: "A promise becomes a compass when the road disappears.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQviuSHho9FVxur3TNprp-_jR7RNftNky-KJ8KFpA0_Qw&s=10",
  },
  {
    label: "02 / NINE TAILS",
    title: "A power that had to be understood.",
    description: "Fear becomes partnership one hard-won step at a time.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDvlqFHzo2x7RhAibUHbWZzGoAUDnbQee0Fo018rx5Yg&s=10",
  },
  {
    label: "03 / VALLEY",
    title: "Two paths collide.",
    description: "The fight is never only about who wins.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXVpngpjzNWG5lDm8aWcGyGBHpf3t1YJQa0yDMzw4dbw&s=10",
  },
];

export const jutsu: JutsuItem[] = [
  {
    name: "影分身の術",
    type: "NINJUTSU",
    description: "Shadow Clone Technique",
    symbol: "影",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgyNqUX6dSF0rW1Jocq3NtbzwITdIXnTa7yLY8_kaBgw&s=10",
  },
  {
    name: "螺旋丸",
    type: "SHAPE TRANSFORMATION",
    description: "Rasengan",
    symbol: "螺",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRg8ZHK34xouvKJhXuNntaauYvNFunf9pg4XGmodfV4Mw&s=10",
  },
  {
    name: "写輪眼",
    type: "KEKKEI GENKAI",
    description: "Sharingan",
    symbol: "写",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQodCU1Tt4E5gKyFKRgk9BDwL0CK7wHV-qWRDxxVfkN_Q&s=10",
  },
  {
    name: "千鳥",
    type: "LIGHTNING RELEASE",
    description: "Chidori",
    symbol: "千",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpDCcoDDiVlZDApde5V5sTtvYNCFEs9WXgIhYrhiSw1w&s=10",
  },
  {
    name: "八卦掌",
    type: "TAIJUTSU",
    description: "Eight Trigrams Palms",
    symbol: "八",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQI6QQULN9JpyImA8i3M77hNttp1d87aAqGGLTYFieffg&s=10",
  },
  {
    name: "砂瀑送葬",
    type: "NINJUTSU",
    description: "Sand Burial",
    symbol: "砂",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTL2h6HRtBPUgd06DxCdQkU3juXf3LRgyu8UIseUOUPIg&s=10",
  },
];

export const quotes: QuoteItem[] = [
  { quote: "Hard work is worthless for those that don't believe in themselves.", speaker: "Naruto Uzumaki", context: "THE NINJA WAY" },
  { quote: "People's lives don't end when they die. It ends when they lose faith.", speaker: "Itachi Uchiha", context: "THE UCHIHA" },
  { quote: "Those who abandon their friends are worse than scum.", speaker: "Kakashi Hatake", context: "TEAM 7" },
];

export const rivalry: RivalryContent = {
  kicker: "09 / THE FINAL VALLEY",
  title: "Naruto vs Sasuke",
  description: "Two lonely boys, two definitions of strength, and one bond that kept returning to the battlefield.",
  left: "THE ONE WHO REACHED OUT",
  right: "THE ONE WHO WALKED AWAY",
};
