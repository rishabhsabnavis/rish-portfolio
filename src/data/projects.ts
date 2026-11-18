export type Project = {
  id: string;
  num: string;
  kind: string;
  title: string;
  img: string;
  blurb: string;
  notes: string[];
  stack: string[];
  links?: { github?: string; demo?: string };
};

type ProjectInput = Omit<Project, 'num' | 'img'>;

const base: ProjectInput[] = [
  {
    id: 'emolog',
    kind: 'SDK',
    title: 'emolog',
    blurb:
      'Paralinguistic middleware for voice AI. It hears how something is said, not just what, and hands that context to the LLM.',
    notes: [
      'Extracts pitch, energy and speaking rate and maps prosody to emotion',
      'Injects that context into the LLM system prompt on every turn',
      'Drop-in SDK built for LiveKit and Vapi, packaged for PyPI',
    ],
    stack: ['Python', 'LiveKit', 'Vapi', 'PyPI'],
    links: { github: 'https://github.com/rishabhsabnavis/emolog' },
  },
  {
    id: 'bookr',
    kind: 'VOICE AGENT',
    title: 'Bookr',
    blurb: 'A multi-agent voice booking system. Call it, talk to it, and it books.',
    notes: [
      'Multi-agent orchestration with LangGraph',
      'Retrieval over pgvector for grounded answers',
      'Telephony through Twilio and LiveKit',
    ],
    stack: ['LangGraph', 'pgvector', 'RAG', 'Twilio', 'LiveKit', 'Railway', 'Vercel', 'Neon'],
    links: {
      github: 'https://github.com/rishabhsabnavis/Bookr',
      demo: 'https://bookr-lyart.vercel.app',
    },
  },
  {
    id: 'gigcaller',
    kind: 'VOICE AGENT',
    title: 'GigCaller',
    blurb:
      'A multi-agent voice booking system for DJs, so the phone calls about gigs handle themselves.',
    notes: [
      'LangGraph agents behind a FastAPI service',
      'Calls over LiveKit SIP with ElevenLabs voices',
      'Memory and retrieval on MongoDB and pgvector',
    ],
    stack: ['LangGraph', 'FastAPI', 'MongoDB', 'pgvector', 'LiveKit SIP', 'ElevenLabs', 'S3'],
  },
  {
    id: 'contextos',
    kind: 'MIDDLEWARE',
    title: 'ContextOS',
    blurb:
      'Context compression middleware for AI agents. Less noise in the window, more room to think.',
    notes: ['Sits between an agent and its model', 'Compresses context before it is sent'],
    stack: ['Python', 'LLM agents'],
  },
  {
    id: 'splat',
    kind: 'GRAPHICS',
    title: 'CPU Gaussian Splatting',
    blurb:
      'A Gaussian Splatting renderer that runs on the CPU, built by a team of four for Computer Graphics at UT Dallas.',
    notes: [
      'My part: .ply loading and scene trimming',
      'Spherical harmonics for view-dependent color',
      'Presented the conclusion',
    ],
    stack: ['3DGS', 'Spherical harmonics', 'PLY'],
  },
  {
    id: 'noise',
    kind: 'AUDIO ML',
    title: 'Urban Noise Classifier',
    blurb:
      'Classifies urban noise pollution from raw audio, with a web front end to explore it.',
    notes: [
      'Wav2Vec2 audio representations',
      'Models in TensorFlow and PyTorch',
      'React front end deployed on AWS',
    ],
    stack: ['Wav2Vec2', 'TensorFlow', 'PyTorch', 'React', 'AWS'],
    links: { github: 'https://github.com/rishabhsabnavis/noiseapp' },
  },
];

export const projects: Project[] = base.map((p, i) => {
  const num = String(i + 1).padStart(2, '0');
  return { ...p, num, img: `/assets/discs/${num}.webp` };
});

/** Footer links. Anything left undefined is not rendered. */
export const contact: {
  email?: string;
  github?: string;
  linkedin?: string;
  soundcloud?: string;
} = {
  github: 'https://github.com/rishabhsabnavis',
};

export const PLAYER_TONES = {
  Forest: { filter: 'saturate(1.6) brightness(0.82) contrast(1.25)', ring: '#12501f' },
  Leaf: { filter: 'saturate(1.1) contrast(1.05)', ring: '#2b7a3a' },
  Moss: {
    filter: 'sepia(0.35) hue-rotate(25deg) saturate(1.3) brightness(0.9) contrast(1.15)',
    ring: '#4a5a1f',
  },
  Ink: { filter: 'grayscale(1) brightness(0.7) contrast(1.6)', ring: '#0e2a14' },
} as const;

export const PLAYER_TONE: keyof typeof PLAYER_TONES = 'Forest';
