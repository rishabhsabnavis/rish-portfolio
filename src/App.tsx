import { useCallback, useEffect, useRef, useState } from 'react';
import { contact, PLAYER_TONE, PLAYER_TONES, projects, type Project } from './data/projects';

type PlayerState = { loadedId: string | null; playing: boolean };

const tone = PLAYER_TONES[PLAYER_TONE];
const discCount = String(projects.length).padStart(2, '0');
const COUNT_WORDS = [
  'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six',
  'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve',
];
const countWord = COUNT_WORDS[projects.length] ?? String(projects.length);

function idFromHash(hash: string): string | null | undefined {
  // `#/emolog` -> 'emolog'. Empty hash -> null (nothing loaded).
  // Section anchors like `#work` -> undefined (leave state alone).
  if (hash === '' || hash === '#' || hash === '#/') return null;
  if (!hash.startsWith('#/')) return undefined;
  const id = decodeURIComponent(hash.slice(2));
  return projects.some((p) => p.id === id) ? id : null;
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ---------- small pieces ---------- */

function DiscArt({ project, eager, small }: { project: Project; eager?: boolean; small?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className="disc-fallback" aria-hidden="true">
        {project.num}
      </span>
    );
  }
  return (
    <img
      className="disc-img"
      src={small ? project.img.replace(/\.webp$/, '-sm.webp') : project.img}
      alt=""
      width={small ? 132 : 800}
      height={small ? 132 : 800}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
      <polygon points="7,4 20,12 7,20" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <line x1="8" y1="5" x2="8" y2="19" />
      <line x1="16" y1="5" x2="16" y2="19" />
    </svg>
  );
}

function EjectIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12,5 20,14 4,14" />
      <line x1="4" y1="19" x2="20" y2="19" />
    </svg>
  );
}

/* ---------- sections ---------- */

function Background({ current }: { current?: Project }) {
  return (
    <div className="bg" aria-hidden="true">
      <img className="bg-art" src="/assets/background.webp" alt="" fetchPriority="high" />
      {current && (
        <div key={current.id} className="bg-wash fade-in">
          <img src={current.img} alt="" />
        </div>
      )}
      <div className="drift drift-a" />
      <div className="drift drift-b" />
      <div className="bg-veil" />
    </div>
  );
}

function Player({
  current,
  playing,
  onToggle,
  onEject,
  boxRef,
}: {
  current?: Project;
  playing: boolean;
  onToggle: () => void;
  onEject: () => void;
  boxRef: React.RefObject<HTMLDivElement>;
}) {
  const empty = !current;
  const isPlaying = !empty && playing;
  return (
    <div className="player">
      <div className="glass player-card">
        <div className="player-crop" ref={boxRef}>
          <img
            className="player-art"
            src="/assets/cd-player.webp"
            alt="Line-drawn green CD player"
            fetchPriority="high"
            style={{ filter: tone.filter }}
          />
          <div className="disc-slot">
            {current && (
              <div key={current.id} className="disc-in">
                <div
                  className={isPlaying ? 'spinner' : 'spinner paused'}
                  style={{ '--ring': tone.ring } as React.CSSProperties}
                >
                  <DiscArt project={current} eager />
                  <div className="sheen" aria-hidden="true" />
                  <div className="clamp" aria-hidden="true" />
                  <div className="spindle" aria-hidden="true" />
                </div>
              </div>
            )}
          </div>
          <div className={empty ? 'led' : 'led on'} aria-hidden="true" />
        </div>
      </div>

      <div className="readout">
        <div className="lcd">
          <span className="lcd-main">
            {current ? `${current.num}  ${current.title.toUpperCase()}` : 'INSERT DISC'}
          </span>
          <span className="lcd-status">{empty ? '--:--' : isPlaying ? 'PLAY' : 'PAUSE'}</span>
        </div>
        <button
          type="button"
          className="ctrl"
          onClick={onToggle}
          disabled={empty}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button type="button" className="ctrl" onClick={onEject} disabled={empty} aria-label="Eject disc">
          <EjectIcon />
        </button>
      </div>
    </div>
  );
}

function LinerNotes({ current }: { current?: Project }) {
  return (
    <div className="glass panel notes">
      {!current ? (
        <div className="notes-empty">
          <h2 className="label">LINER NOTES</h2>
          <p className="quote">
            {countWord} discs on the rack. Load one to hear what it does.
          </p>
          <p className="notes-empty-body">
            Every disc is a project: voice agents, speech middleware, a renderer, a classifier. The
            player reads its notes back to you here.
          </p>
        </div>
      ) : (
        <article key={current.id} className="notes-article fade-in" aria-labelledby="track-title">
          <span className="label">
            TRACK {current.num} / {current.kind}
          </span>
          <h2 id="track-title" className="track-title">
            {current.title}
          </h2>
          <p className="blurb">{current.blurb}</p>
          <ul className="note-list">
            {current.notes.map((n) => (
              <li key={n}>
                <span className="plus" aria-hidden="true">+</span>
                <span>{n}</span>
              </li>
            ))}
          </ul>
          <ul className="chips" aria-label="Stack">
            {current.stack.map((s) => (
              <li key={s} className="chip">{s}</li>
            ))}
          </ul>
          {(current.links?.github || current.links?.demo) && (
            <div className="track-links">
              {current.links.github && (
                <a href={current.links.github} target="_blank" rel="noreferrer">
                  GITHUB <span className="visually-hidden">for {current.title}</span>
                </a>
              )}
              {current.links.demo && (
                <a href={current.links.demo} target="_blank" rel="noreferrer">
                  DEMO <span className="visually-hidden">of {current.title}</span>
                </a>
              )}
            </div>
          )}
        </article>
      )}
    </div>
  );
}

function Rack({ loadedId, onPick }: { loadedId: string | null; onPick: (id: string) => void }) {
  return (
    <section className="glass panel rack" aria-labelledby="rack-label">
      <div className="rack-head">
        <h2 id="rack-label" className="label">THE RACK</h2>
        <span className="label label-count">{discCount} DISCS</span>
      </div>
      <div className="rack-grid">
        {projects.map((p, i) => {
          const loaded = p.id === loadedId;
          return (
            <button
              key={p.id}
              type="button"
              className="rack-btn"
              onClick={() => onPick(p.id)}
              aria-label={`Load ${p.title} into the player`}
              aria-pressed={loaded}
            >
              {loaded ? (
                <span className="rack-playing">
                  <span>PLAYING</span>
                </span>
              ) : (
                <span className="rack-disc">
                  <DiscArt project={p} eager={i < 6} small />
                  <span className="rack-sheen" />
                  <span className="rack-hole" />
                </span>
              )}
              <span className="rack-caption">
                <span className="rack-num">{p.num}</span>
                <span className="rack-title">{p.title}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Footer() {
  const links = [
    contact.github && { href: contact.github, label: 'GITHUB' },
    contact.linkedin && { href: contact.linkedin, label: 'LINKEDIN' },
    contact.soundcloud && { href: contact.soundcloud, label: 'SOUNDCLOUD' },
  ].filter(Boolean) as { href: string; label: string }[];
  return (
    <footer id="contact" className="glass footer">
      {contact.email ? (
        <a href={`mailto:${contact.email}`}>{contact.email.toUpperCase()}</a>
      ) : (
        <span className="footer-label">CONTACT</span>
      )}
      <div className="footer-links">
        {links.map((l) => (
          <a key={l.label} href={l.href} target="_blank" rel="noreferrer">
            {l.label}
          </a>
        ))}
      </div>
    </footer>
  );
}

/* ---------- app ---------- */

export default function App() {
  const [state, setState] = useState<PlayerState>(() => ({
    loadedId: idFromHash(window.location.hash) ?? null,
    playing: true,
  }));
  const [announce, setAnnounce] = useState('');
  const playerRef = useRef<HTMLDivElement>(null);

  const current = projects.find((p) => p.id === state.loadedId);

  // Keep the URL hash in sync so a loaded project is shareable.
  const setLoaded = useCallback((id: string | null) => {
    setState({ loadedId: id, playing: true });
    const p = projects.find((x) => x.id === id);
    setAnnounce(p ? `Now playing: ${p.title}` : 'Disc ejected');
    const next = id ? `#/${id}` : window.location.pathname + window.location.search;
    if ((id ? `#/${id}` : '') !== window.location.hash) {
      window.history.pushState(null, '', next);
    }
  }, []);

  useEffect(() => {
    const onPop = () => {
      const id = idFromHash(window.location.hash);
      if (id === undefined) return;
      setState({ loadedId: id, playing: true });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const pick = (id: string) => {
    if (id === state.loadedId) {
      setLoaded(null);
      return;
    }
    setLoaded(id);
    const el = playerRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      const visible = r.top >= 0 && r.bottom <= window.innerHeight;
      if (!visible) {
        el.scrollIntoView({ block: 'center', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      }
    }
  };

  return (
    <div className="page">
      <Background current={current} />
      <div className="wrap">
        <header className="glass nav">
          <a href="#top" className="logo">RISH</a>
          <nav aria-label="Primary" className="nav-links">
            <a href="#work">WORK</a>
            <a href="#about">ABOUT</a>
            <a href="#contact">CONTACT</a>
          </nav>
        </header>

        <main>
          <section id="top" className="hero" aria-labelledby="hero-title">
            <div className="glass hero-card">
              <h1 id="hero-title">
                Software &amp; AI
                <br />
                <em>engineer,</em> audio
                <br />
                at heart.
              </h1>
              <p className="hero-intro">
                CS at UT Dallas, AI/ML track, graduating May 2027. I build voice agents, speech
                tooling and graphics, with a background in audio engineering. Pick a disc to play a
                project.
              </p>
            </div>
          </section>

          <section id="work" className="work" aria-label="Work">
            <Player
              current={current}
              playing={state.playing}
              onToggle={() => current && setState((s) => ({ ...s, playing: !s.playing }))}
              onEject={() => setLoaded(null)}
              boxRef={playerRef}
            />
            <LinerNotes current={current} />
          </section>

          <Rack loadedId={state.loadedId} onPick={pick} />

          <section id="about" className="glass panel about" aria-labelledby="about-title">
            <h2 id="about-title" className="bside">B-side</h2>
            <div className="about-copy">
              <p>
                I&apos;m a junior in Computer Science at UT Dallas specializing in AI/ML, looking for
                new grad software and AI engineering roles. Before code I was mixing records, so I
                tend to build things that listen.
              </p>
              <p className="muted">
                Previously: UT Southwestern&apos;s Hattori Lab, NRVE (music tech), and the National
                Geospatial-Intelligence Agency. Off hours I DJ and produce as RISH.
              </p>
            </div>
          </section>
        </main>

        <Footer />
      </div>
      <div className="visually-hidden" aria-live="polite">
        {announce}
      </div>
    </div>
  );
}
