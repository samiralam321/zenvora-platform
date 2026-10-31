export interface Track {
  id: string;
  title: string;
  artist: string;
  category: "Ambient & Nature" | "Deep Focus" | "Cinematic" | "Anime & Lofi";
  youtubeId: string;
  icon: string;
}

export const STUDY_TRACKS: Track[] = [
  // ── Ambient & Nature ──
  {
    id: "relaxing-rain-sound",
    title: "Relaxing Rain Sound",
    artist: "Ambient Nature Sounds",
    category: "Ambient & Nature",
    youtubeId: "7jQASnRrUzs",
    icon: "🌧️",
  },
  {
    id: "a-gentle-sunlight",
    title: "A Gentle Sunlight",
    artist: "Calm Orchestral Piano",
    category: "Ambient & Nature",
    youtubeId: "MDXE7gus1HY",
    icon: "☀️",
  },
  {
    id: "snowfall",
    title: "Snowfall",
    artist: "Øneheart & reidenshi",
    category: "Ambient & Nature",
    youtubeId: "OtLcqr3RQJY",
    icon: "❄️",
  },
  {
    id: "winter-has-come",
    title: "Winter Has Come",
    artist: "Atmospheric Ambient Focus",
    category: "Ambient & Nature",
    youtubeId: "VmSxEEbVbjo",
    icon: "🌲",
  },

  // ── Deep Focus & Concentration ──
  {
    id: "focus",
    title: "Focus",
    artist: "Concentration Soundscapes",
    category: "Deep Focus",
    youtubeId: "8JiPi_TUZug",
    icon: "🎯",
  },
  {
    id: "concentration",
    title: "Concentration",
    artist: "ADHD Alpha Waves & Flow",
    category: "Deep Focus",
    youtubeId: "afSvi37y-nI",
    icon: "🧠",
  },
  {
    id: "no-surprise",
    title: "No Surprises (Ambient Piano)",
    artist: "Radiohead Relaxing Cover",
    category: "Deep Focus",
    youtubeId: "FLhyFqj69no",
    icon: "🎹",
  },
  {
    id: "beanie",
    title: "Beanie",
    artist: "Mellow Chill Beats",
    category: "Deep Focus",
    youtubeId: "2jeOhTeW-tA",
    icon: "☕",
  },
  {
    id: "solitude",
    title: "Solitude",
    artist: "M83 (Slowed & Reverb Focus)",
    category: "Deep Focus",
    youtubeId: "vcNAUtqcK48",
    icon: "🌙",
  },

  // ── Cinematic & Soundtracks ──
  {
    id: "interstellar",
    title: "Interstellar (Main Theme)",
    artist: "Hans Zimmer",
    category: "Cinematic",
    youtubeId: "nc91s-8aaBM",
    icon: "🌌",
  },
  {
    id: "can-you-hear-the-music",
    title: "Can You Hear The Music",
    artist: "Ludwig Göransson (Oppenheimer)",
    category: "Cinematic",
    youtubeId: "4JZ-o3iAJv4",
    icon: "🎻",
  },
  {
    id: "oppenheimer",
    title: "Oppenheimer Suite",
    artist: "Ludwig Göransson",
    category: "Cinematic",
    youtubeId: "296B2kd_DYs",
    icon: "⚛️",
  },
  {
    id: "succession",
    title: "Succession (Main Title Theme)",
    artist: "Nicholas Britell",
    category: "Cinematic",
    youtubeId: "ObT0RaT_woU",
    icon: "🎼",
  },
  {
    id: "light-of-the-seven",
    title: "Light of the Seven",
    artist: "Ramin Djawadi (Rain & Thunder)",
    category: "Cinematic",
    youtubeId: "GMRcZ1up_K8",
    icon: "🕯️",
  },

  // ── Anime & Lofi ──
  {
    id: "relaxing-anime-music",
    title: "Relaxing Anime Lofi Beats",
    artist: "Lofi Girl Study Stream",
    category: "Anime & Lofi",
    youtubeId: "5qap5aO4i9A",
    icon: "🌸",
  },
  {
    id: "kira",
    title: "Kira's Theme",
    artist: "Death Note (Study Instrumental)",
    category: "Anime & Lofi",
    youtubeId: "henSHvSi9Hg",
    icon: "📓",
  },
];

export const MUSIC_CATEGORIES = [
  "All",
  "Ambient & Nature",
  "Deep Focus",
  "Cinematic",
  "Anime & Lofi",
] as const;
