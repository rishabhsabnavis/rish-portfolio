import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { contact, PLAYER_TONE, PLAYER_TONES, projects, type Project } from './data/projects';
import { experience, records, skills, type CrateRecord, type RecordId } from './data/records';

/* ---------- routing ---------- */

type Route = { record: RecordId | null; projectId: string | null };

const CRATE: Route = { record: null, projectId: null };
const PULL_MS = 1050;

function parseHash(hash: string): Route | undefined {
  // '#/' -> crate, '#/projects/bookr' -> that project, '#/experience' -> that record.
  // Old project links ('#/bookr') still work. Plain anchors ('#top') are ignored.
  if (hash === '' || hash === '#' || hash === '#/') return CRATE;
  if (!hash.startsWith('#/')) return undefined;
  const [first, second] = decodeURIComponent(hash.slice(2)).split('/');
  if (records.some((r) => r.id === first)) {
    const projectId =
      first === 'projects' && projects.some((p) => p.id === second) ? second : null;
    return { record: first as RecordId, projectId };
  }
  if (projects.some((p) => p.id === first)) return { record: 'projects', projectId: first };
  return CRATE;
}

function toHash(r: Route) {
  if (!r.record) return '#/';
  return r.projectId ? `#/${r.record}/${r.projectId}` : `#/${r.record}`;
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const tone = PLAYER_TONES[PLAYER_TONE];

/* ---------- discs ---------- */

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

function Vinyl({ record }: { record: CrateRecord }) {
  return (
    <span className="vinyl" style={{ '--label': record.label } as React.CSSProperties}>
      <span className="vinyl-label" />
    </span>
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

/* ---------- background ---------- */

function Background({ project }: { project?: Project }) {
  return (
    <div className="bg" aria-hidden="true">
      <img className="bg-art" src="/assets/background.webp" alt="" fetchPriority="high" />
      {project && (
        <div key={project.id} className="bg-wash fade-in">
          <img src={project.img} alt="" />
        </div>
      )}
      <div className="drift drift-a" />
      <div className="drift drift-b" />
      <div className="bg-veil" />
    </div>
  );
}

/* ---------- the crate (landing) ---------- */

function Sleeve({
  record,
  depth,
  state,
  disabled,
  onHover,
  onPull,
}: {
  record: CrateRecord;
  depth: number;
  state: 'idle' | 'lifted' | 'leaning' | 'pulled';
  disabled: boolean;
  onHover: (depth: number | null) => void;
  onPull: () => void;
}) {
  return (
    <button
      type="button"
      className={`sleeve sleeve--${record.id} is-${state}`}
      style={{ '--d': depth, zIndex: state === 'pulled' ? 40 : 10 - depth } as React.CSSProperties}
      onPointerEnter={() => onHover(depth)}
      onPointerLeave={() => onHover(null)}
      onFocus={() => onHover(depth)}
      onBlur={() => onHover(null)}
      onClick={onPull}
      disabled={disabled}
      aria-label={`Pull ${record.title} from the crate`}
    >
      <span className="sleeve-disc" aria-hidden="true">
        <Vinyl record={record} />
      </span>
      <span className="sleeve-cover" aria-hidden="true">
        <span className="sleeve-art" />
        <span className="sleeve-title">{record.title}</span>
        <span className="sleeve-sticker">{record.sticker}</span>
      </span>
    </button>
  );
}

function Crate({ onPull }: { onPull: (id: RecordId) => void }) {
  const [hover, setHover] = useState<number | null>(null);
  const [pulling, setPulling] = useState<RecordId | null>(null);
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const pull = (id: RecordId) => {
    if (pulling) return;
    if (prefersReducedMotion()) {
      onPull(id);
      return;
    }
    setPulling(id);
    timer.current = window.setTimeout(() => onPull(id), PULL_MS);
  };

  return (
    <div className={pulling ? 'crate is-pulling' : 'crate'}>
      <img className="crate-back" src="/assets/crate-back.webp" alt="" width={840} height={566} />
      <div className="crate-stack">
        {records.map((r, depth) => {
          let state: 'idle' | 'lifted' | 'leaning' | 'pulled' = 'idle';
          if (pulling) state = pulling === r.id ? 'pulled' : 'idle';
          else if (hover !== null && depth === hover) state = 'lifted';
          else if (hover !== null && depth < hover) state = 'leaning';
          return (
            <Sleeve
              key={r.id}
              record={r}
              depth={depth}
              state={state}
              disabled={pulling !== null}
              onHover={setHover}
              onPull={() => pull(r.id)}
            />
          );
        })}
      </div>
      <div className="crate-front" aria-hidden="true">
        <img src="/assets/crate-front.webp" alt="" width={840} height={498} />
        <span className="crate-stamp">Rishabh Sabnavis &nbsp;/&nbsp; records</span>
      </div>
    </div>
  );
}

function Landing({ onPull }: { onPull: (id: RecordId) => void }) {
  return (
    <main className="landing">
      <h1 className="visually-hidden">Rishabh Sabnavis, software and AI engineer</h1>
      <Crate onPull={onPull} />
    </main>
  );
}

/* ---------- player ---------- */

function Player({
  discKey,
  disc,
  readout,
  playing,
  onToggle,
  onEject,
  boxRef,
}: {
  discKey: string;
  disc: ReactNode;
  readout: string;
  playing: boolean;
  onToggle: () => void;
  onEject: () => void;
  boxRef: React.RefObject<HTMLDivElement>;
}) {
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
            <div key={discKey} className="disc-in">
              <div
                className={playing ? 'spinner' : 'spinner paused'}
                style={{ '--ring': tone.ring } as React.CSSProperties}
              >
                {disc}
                <div className="sheen" aria-hidden="true" />
                <div className="clamp" aria-hidden="true" />
                <div className="spindle" aria-hidden="true" />
              </div>
            </div>
          </div>
          <div className="led on" aria-hidden="true" />
        </div>
      </div>

      <div className="readout">
        <div className="lcd">
          <span className="lcd-main">{readout}</span>
          <span className="lcd-status">{playing ? 'PLAY' : 'PAUSE'}</span>
        </div>
        <button type="button" className="ctrl" onClick={onToggle} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button type="button" className="ctrl" onClick={onEject} aria-label="Eject and go back to the crate">
          <EjectIcon />
        </button>
      </div>
    </div>
  );
}

/* ---------- liner notes per record ---------- */

function ProjectNotes({ project, onBack }: { project: Project; onBack: () => void }) {
  return (
    <article key={project.id} className="notes-article fade-in" aria-labelledby="track-title">
      <button type="button" className="text-btn" onClick={onBack}>
        All projects
      </button>
      <span className="label">
        TRACK {project.num} / {project.kind}
      </span>
      <h2 id="track-title" className="track-title">
        {project.title}
      </h2>
      <p className="blurb">{project.blurb}</p>
      <ul className="note-list">
        {project.notes.map((n) => (
          <li key={n}>
            <span className="plus" aria-hidden="true">+</span>
            <span>{n}</span>
          </li>
        ))}
      </ul>
      <ul className="chips" aria-label="Stack">
        {project.stack.map((s) => (
          <li key={s} className="chip">{s}</li>
        ))}
      </ul>
      {(project.links?.github || project.links?.demo) && (
        <div className="track-links">
          {project.links.github && (
            <a href={project.links.github} target="_blank" rel="noreferrer">
              GITHUB <span className="visually-hidden">for {project.title}</span>
            </a>
          )}
          {project.links.demo && (
            <a href={project.links.demo} target="_blank" rel="noreferrer">
              DEMO <span className="visually-hidden">of {project.title}</span>
            </a>
          )}
        </div>
      )}
    </article>
  );
}

function Tracklist({ onPick }: { onPick: (id: string) => void }) {
  return (
    <article className="notes-article fade-in" aria-labelledby="track-title">
      <h2 id="track-title" className="track-title">Projects</h2>
      <p className="blurb">
        Voice agents, speech middleware, an iOS app, a renderer and a classifier. Pick a track
        to put its disc on.
      </p>
      <ol className="tracklist">
        {projects.map((p) => (
          <li key={p.id}>
            <button type="button" className="track-row" onClick={() => onPick(p.id)}>
              <span className="track-num">{p.num}</span>
              <span className="track-name">{p.title}</span>
              <span className="track-kind">{p.kind.toLowerCase()}</span>
            </button>
          </li>
        ))}
      </ol>
    </article>
  );
}

function ExperienceNotes() {
  return (
    <article className="notes-article fade-in" aria-labelledby="track-title">
      <h2 id="track-title" className="track-title">Experience</h2>
      <div className="roles">
        {experience.map((r) => (
          <section key={r.org} className="role">
            <h3 className="role-org">{r.org}</h3>
            <p className="role-meta">
              {r.role}, {r.dates}
            </p>
            <ul className="note-list">
              {r.notes.map((n) => (
                <li key={n}>
                  <span className="plus" aria-hidden="true">+</span>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <ul className="chips" aria-label="Skills">
        {skills.map((s) => (
          <li key={s} className="chip">{s}</li>
        ))}
      </ul>
    </article>
  );
}

function PersonalNotes() {
  return (
    <article className="notes-article fade-in" aria-labelledby="track-title">
      <h2 id="track-title" className="track-title">Personal</h2>
      <p className="blurb">
        I&apos;m a senior in Computer Science at UT Dallas, specializing in AI/ML and graduating
        May 2027.
      </p>
      <ul className="note-list">
        <li>
          <span className="plus" aria-hidden="true">+</span>
          <span>I DJ and produce as RISH</span>
        </li>
        <li>
          <span className="plus" aria-hidden="true">+</span>
          <span>Captain of the UTD Raftaar Bollywood Fusion Collegiate Dance team</span>
        </li>
        <li>
          <span className="plus" aria-hidden="true">+</span>
          <span>Member of ACM and the Artificial Intelligence Society at UT Dallas</span>
        </li>
        <li>
          <span className="plus" aria-hidden="true">+</span>
          <span>Coursework in generative AI, agentic AI, and LLM fine-tuning with audio</span>
        </li>
      </ul>
    </article>
  );
}

function ContactNotes() {
  return (
    <article className="notes-article fade-in" aria-labelledby="track-title">
      <h2 id="track-title" className="track-title">Contact</h2>
      <p className="blurb">
        I&apos;m looking for new grad software and AI engineering roles. Email is the fastest way
        to reach me.
      </p>
      <ul className="contact-list">
        {contact.email && (
          <li>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </li>
        )}
        {contact.linkedin && (
          <li>
            <a href={contact.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          </li>
        )}
        {contact.github && (
          <li>
            <a href={contact.github} target="_blank" rel="noreferrer">GitHub</a>
          </li>
        )}
      </ul>
    </article>
  );
}

/* ---------- project rack ---------- */

function Rack({ loadedId, onPick }: { loadedId: string | null; onPick: (id: string) => void }) {
  return (
    <section className="glass panel rack" aria-labelledby="rack-label">
      <div className="rack-head">
        <h2 id="rack-label" className="label">THE RACK</h2>
        <span className="label label-count">
          {String(projects.length).padStart(2, '0')} DISCS
        </span>
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

/* ---------- record view ---------- */

function RecordView({
  route,
  go,
}: {
  route: Route & { record: RecordId };
  go: (r: Route) => void;
}) {
  const [playing, setPlaying] = useState(true);
  const playerRef = useRef<HTMLDivElement>(null);
  const record = records.find((r) => r.id === route.record)!;
  const project = projects.find((p) => p.id === route.projectId);

  const pickProject = (id: string) => {
    go({ record: 'projects', projectId: id === route.projectId ? null : id });
    setPlaying(true);
    const el = playerRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      if (r.top < 0 || r.bottom > window.innerHeight) {
        el.scrollIntoView({ block: 'center', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      }
    }
  };

  let notes: ReactNode;
  if (record.id === 'projects') {
    notes = project ? (
      <ProjectNotes project={project} onBack={() => go({ record: 'projects', projectId: null })} />
    ) : (
      <Tracklist onPick={pickProject} />
    );
  } else if (record.id === 'experience') notes = <ExperienceNotes />;
  else if (record.id === 'personal') notes = <PersonalNotes />;
  else notes = <ContactNotes />;

  return (
    <>
      <div className="record-bar">
        <button type="button" className="text-btn back-btn" onClick={() => go(CRATE)}>
          Back to the crate
        </button>
      </div>
      <section id="work" className="work" aria-label={record.title}>
        <Player
          discKey={project ? project.id : record.id}
          disc={project ? <DiscArt project={project} eager /> : <Vinyl record={record} />}
          readout={
            project
              ? `${project.num}  ${project.title.toUpperCase()}`
              : `${record.title.toUpperCase()}`
          }
          playing={playing}
          onToggle={() => setPlaying((p) => !p)}
          onEject={() => go(CRATE)}
          boxRef={playerRef}
        />
        <div className="glass panel notes">{notes}</div>
      </section>
      {record.id === 'projects' && <Rack loadedId={route.projectId} onPick={pickProject} />}
    </>
  );
}

/* ---------- footer ---------- */

function Footer() {
  const links = [
    contact.github && { href: contact.github, label: 'GITHUB' },
    contact.linkedin && { href: contact.linkedin, label: 'LINKEDIN' },
    contact.soundcloud && { href: contact.soundcloud, label: 'SOUNDCLOUD' },
  ].filter(Boolean) as { href: string; label: string }[];
  return (
    <footer className="glass footer">
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
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash) ?? CRATE);
  const [announce, setAnnounce] = useState('');

  const routeRef = useRef(route);
  routeRef.current = route;

  const go = useCallback((next: Route) => {
    if (routeRef.current.record !== next.record) window.scrollTo({ top: 0, behavior: 'auto' });
    setRoute(next);
    const rec = records.find((r) => r.id === next.record);
    const proj = projects.find((p) => p.id === next.projectId);
    setAnnounce(proj ? `Now playing: ${proj.title}` : rec ? `Now playing: ${rec.title}` : 'Back at the crate');
    if (toHash(next) !== (window.location.hash || '#/')) {
      window.history.pushState(null, '', toHash(next));
    }
  }, []);

  useEffect(() => {
    const onPop = () => {
      const r = parseHash(window.location.hash);
      if (r) setRoute(r);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const project = projects.find((p) => p.id === route.projectId);

  return (
    <div className="page">
      <Background project={project} />
      {route.record ? (
        <div className="wrap">
          <header className="glass nav">
            <a
              href="#/"
              className="logo"
              onClick={(e) => {
                e.preventDefault();
                go(CRATE);
              }}
            >
              Rishabh Sabnavis
            </a>
            <nav aria-label="Primary" className="nav-links">
              {records.map((r) => (
                <a
                  key={r.id}
                  href={`#/${r.id}`}
                  aria-current={route.record === r.id ? 'page' : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    go({ record: r.id, projectId: null });
                  }}
                >
                  {r.title.toUpperCase()}
                </a>
              ))}
            </nav>
          </header>

          <main>
            <RecordView key={route.record} route={route as Route & { record: RecordId }} go={go} />
          </main>

          <Footer />
        </div>
      ) : (
        <Landing onPull={(id) => go({ record: id, projectId: null })} />
      )}
      <div className="visually-hidden" aria-live="polite">
        {announce}
      </div>
    </div>
  );
}
