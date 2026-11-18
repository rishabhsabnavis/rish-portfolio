/**
 * The records in the crate on the landing page. Each one is a section of the
 * site: pull it from the crate and its disc goes on the player.
 * Content here comes from the resume (~/Desktop/important/Rishabh_Sabnavis_Resume.pdf).
 */

export type RecordId = 'projects' | 'experience' | 'personal' | 'contact';

export type CrateRecord = {
  id: RecordId;
  title: string;
  /** Short line on the sleeve's price sticker. */
  sticker: string;
  /** Center label color of the vinyl once it is on the player. */
  label: string;
};

/** Front of the crate first. */
export const records: CrateRecord[] = [
  { id: 'projects', title: 'Projects', sticker: '6 tracks', label: '#1f6b2e' },
  { id: 'experience', title: 'Experience', sticker: '3 roles', label: '#c9d9a3' },
  { id: 'personal', title: 'Personal', sticker: 'The B-side', label: '#e7ecd8' },
  { id: 'contact', title: 'Contact', sticker: 'Say hello', label: '#a8e6a0' },
];

export type Role = {
  org: string;
  role: string;
  dates: string;
  notes: string[];
};

export const experience: Role[] = [
  {
    org: 'Hattori Lab, UT Southwestern Medical Center',
    role: 'Software Research Intern',
    dates: 'Jul 2025 to Jun 2026',
    notes: [
      'Python API automation that made neural pathway processing over 30x faster and cut manual work by 95%',
      'React and FastAPI app for exploring neural data on 138,000+ cells, with sub-second queries for 30+ concurrent users',
    ],
  },
  {
    org: 'NRVE',
    role: 'Software Engineering Intern',
    dates: 'Jun 2025 to Aug 2025',
    notes: [
      'REST APIs for auth, music generation and real-time sync on MongoDB and AWS API Gateway, cutting response latency 45%',
      'AI music generation on AWS SageMaker with AudioCraft in PyTorch: custom tracks by artist, genre and tempo, tripling module retention',
    ],
  },
  {
    org: 'National Geospatial-Intelligence Agency',
    role: 'Software Engineering Intern',
    dates: 'Jun 2023 to Aug 2023',
    notes: [
      'Python tooling to organize NASA lunar metadata across 3 file types, speeding up image rendering and simulation by 10%',
      'Labeled satellite imagery to train computer vision models, raising F1 past 0.7',
    ],
  },
];

export const skills = [
  'Python', 'TypeScript', 'Java', 'C++', 'SQL', 'Swift',
  'React', 'FastAPI', 'Next.js', 'PyTorch', 'LangGraph',
  'Docker', 'AWS', 'PostgreSQL', 'Twilio', 'LiveKit',
];
