import { useEffect } from "react";
import { Link } from "react-router-dom";
import { person } from "../content";
import { useI18n } from "../i18n";

function Frontispiece() {
  return (
    <svg className="frontispiece" viewBox="0 0 360 240" role="img" aria-hidden="true">
      <rect width="360" height="240" fill="#f4efe4" />
      <ellipse cx="70" cy="48" rx="70" ry="36" fill="#d5e6f2" opacity="0.85" />
      <ellipse cx="250" cy="36" rx="90" ry="32" fill="#e7f0c8" opacity="0.7" />
      <ellipse cx="300" cy="150" rx="70" ry="48" fill="#c9d7a4" />
      <ellipse cx="210" cy="168" rx="54" ry="40" fill="#8eaa62" />
      <ellipse cx="250" cy="150" rx="28" ry="22" fill="#d7e7a8" />
      <path d="M40 188c40-16 80-16 140-4s90 8 150-10v66H40V188z" fill="#d9c39a" />
      <path d="M118 176V104h92v72" fill="#f7f3ea" stroke="#243044" strokeWidth="2" />
      <path d="M108 108L164 62l66 46" fill="#6e8f62" stroke="#243044" strokeWidth="2" strokeLinejoin="round" />
      <rect x="148" y="132" width="22" height="44" fill="#3d5c7a" stroke="#243044" strokeWidth="2" />
      <rect x="132" y="118" width="16" height="16" fill="#d5e6f2" stroke="#243044" strokeWidth="1.5" />
      <rect x="178" y="118" width="16" height="16" fill="#d5e6f2" stroke="#243044" strokeWidth="1.5" />
      <rect x="210" y="78" width="10" height="28" fill="#c46a58" />
      <ellipse cx="78" cy="168" rx="26" ry="18" fill="#e7b3a2" />
      <ellipse cx="96" cy="176" rx="16" ry="12" fill="#f3d2c4" />
    </svg>
  );
}

export function Home() {
  const { t } = useI18n();
  const chapters = [
    { id: "intro", num: "01", label: t.navIntro },
    { id: "experience", num: "02", label: t.navExperience },
    { id: "skills", num: "03", label: t.navSkills },
    { id: "projects", num: "04", label: t.navProjects },
    { id: "education", num: "05", label: t.navEducation },
  ];

  useEffect(() => {
    document.title = "Chih-Chi Huang — Technical Product Management";
  }, []);

  return (
    <main id="content" className="desk-scene">
      <article className="spread">
        <div className="page">
          <Frontispiece />
          <p className="story-line">{t.lede}</p>
          <p className="story-sign">{person.name}</p>
        </div>
        <div className="page">
          <p className="contents-kicker">{t.contentsLede}</p>
          <h1 className="contents-title">{t.contents}</h1>
          <ol className="contents-list">
            {chapters.map((chapter) => (
              <li key={chapter.id}>
                <Link to={`/chapter/${chapter.id}`}>
                  <span className="num">{chapter.num}</span>
                  <span className="leader" aria-hidden="true" />
                  <span className="name">{chapter.label}</span>
                </Link>
              </li>
            ))}
          </ol>
          <a className="story-mail" href={`mailto:${person.email}`}>
            {person.email}
          </a>
        </div>
      </article>
    </main>
  );
}
