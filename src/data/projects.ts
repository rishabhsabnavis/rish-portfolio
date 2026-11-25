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
  /** Shown as a pill under the title, e.g. release state. */
  status?: string;
};

/** `art` pins a disc image (public/assets/discs/NN.webp) so art stays put when the list changes. */
type ProjectInput = Omit<Project, 'num' | 'img'> & { art: string };

const base: ProjectInput[] = [
  {
    id: 'emolog',
    art: '01',
    kind: 'SDK',
    title: 'emolog',
    blurb:
      'Paralinguistic middleware for voice AI. It hears how something is said, not just what, and hands that context to the LLM.',
    notes: [
      'Extracts **pitch, energy and speaking rate** and maps prosody to emotion',
      'Injects that context into the **LLM system prompt** on every turn',
      'Drop-in **SDK** built for **LiveKit** and **Vapi**, packaged for **PyPI**',
    ],
    stack: ['Python', 'LiveKit', 'Vapi', 'PyPI'],
    links: { github: 'https://github.com/rishabhsabnavis/emolog' },
  },
  {
    id: 'bookr',
    art: '02',
    kind: 'VOICE AGENT',
    title: 'Bookr',
    blurb:
      'A multi-agent voice system for DJs that cold-calls venues over real phone lines, taking a booking from profile to matched venues to a live call to a logged outcome.',
    notes: [
      '**4 LangGraph agents**: a supervisor plus venue discovery, pitch builder and outbound caller',
      '**RAG** venue matching over a **95-venue pgvector** database, filtered by city, venue type and genre',
      'Embeddings cut to **512 dimensions** for faster cosine-similarity retrieval',
      'Production across Railway, Vercel, Neon, MongoDB Atlas, LiveKit and Twilio at about **$0.65 per call**',
    ],
    stack: ['Python', 'LangGraph', 'FastAPI', 'pgvector', 'React', 'MongoDB', 'Docker', 'LiveKit', 'Twilio'],
    links: {
      github: 'https://github.com/rishabhsabnavis/Bookr',
      demo: 'https://bookr-lyart.vercel.app',
    },
  },
  {
    id: 'neighborly',
    art: '05',
    kind: 'AI AGENT',
    title: 'Neighborly (HackUTD)',
    blurb:
      'A disaster check-in agent built in 24 hours at HackUTD 2026. After a declared hurricane it texts every policyholder in the zone, gets them help by text, voice or a human, and turns what they said into a claim draft.',
    notes: [
      'Checked in on **42 policyholders** across **15 FEMA-declared counties** by orchestrating **NVIDIA Nemotron tool calls** from an event-driven **FastAPI** agent loop',
      'Hit **6/6 live triage accuracy** and **3/3 correct plans** over **44 concurrent cases** with a **hybrid planner**: rules list due actions, the LLM orders them behind guardrails',
      'Kept every dollar figure sent to users verified, enforced by **92 pytest tests**, with a **deterministic coverage tool** and a validator that strips unverified amounts',
      'Placed an outbound voice call **within 20s** of a text reply by running **ElevenLabs** agents over **Photon SIP** with the case history injected as context',
      'Escalated life-safety cases in **under 2s** with no LLM in the path, and drafted structured claims in **1.6s**',
      'Shipped on **Vercel** and **Railway (Docker)** with **10s timeouts** and heuristic fallbacks so it stays up if a model provider fails',
    ],
    stack: ['Python', 'FastAPI', 'NVIDIA Nemotron', 'ElevenLabs', 'Next.js', 'TypeScript', 'Docker', 'Railway'],
    links: {
      github: 'https://github.com/rishabhsabnavis/neighborly',
      demo: 'https://neighborly-ecru-two.vercel.app',
    },
  },
  {
    id: 'inkling',
    art: '03',
    kind: 'iOS APP',
    title: 'Inkling',
    blurb:
      'An offline-first iOS reading companion. Scan a page, and it flags the words you probably do not know and defines them on tap.',
    notes: [
      '**Vision OCR** on the page, **WordNet** for definitions',
      '**On-device Foundation Models** pick the right word sense from sentence context',
      '**1PL Rasch model** with Bayesian updates estimates reader ability, settling **within 0.25 logits**',
      'Reader state is **event sourced** as a replayable log, backed by **146 unit tests**',
    ],
    stack: ['Swift', 'SwiftUI', 'Apple Vision', 'Foundation Models', 'Supabase Auth'],
    status: 'Waiting for App Store approval',
  },
  {
    id: 'cliptoken',
    art: '04',
    kind: 'MIDDLEWARE',
    title: 'ClipToken',
    blurb:
      'Context compression middleware for AI agents. Less noise in the window, more room to think.',
    notes: ['Sits between an **AI agent** and its **model**', '**Compresses context** before it is sent'],
    stack: ['Python', 'LLM agents'],
    links: { github: 'https://github.com/rishabhsabnavis/ClipToken' },
  },
  {
    id: 'noise',
    art: '06',
    kind: 'AUDIO ML',
    title: 'Urban Noise Classifier',
    blurb:
      'Classifies urban noise pollution from raw audio, with a web front end to explore it.',
    notes: [
      '**Wav2Vec2** audio representations',
      'Models in **TensorFlow** and **PyTorch**',
      '**React** front end deployed on **AWS**',
    ],
    stack: ['Wav2Vec2', 'TensorFlow', 'PyTorch', 'React', 'AWS'],
    links: { github: 'https://github.com/rishabhsabnavis/noiseapp' },
  },
];

export const projects: Project[] = base.map(({ art, ...p }, i) => ({
  ...p,
  num: String(i + 1).padStart(2, '0'),
  img: `/assets/discs/${art}.webp`,
}));

/** Footer links. Anything left undefined is not rendered. */
export const contact: {
  email?: string;
  github?: string;
  linkedin?: string;
  soundcloud?: string;
} = {
  email: 'rishabhsabnavis@gmail.com',
  github: 'https://github.com/rishabhsabnavis',
  linkedin: 'https://www.linkedin.com/in/rishabhsabnavis/',
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
