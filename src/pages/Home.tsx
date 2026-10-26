import { useEffect } from "react";
import { Link } from "react-router-dom";
import { person } from "../content";
import { useI18n } from "../i18n";

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
          <div className="cover-frame">
            <img
              className="frontispiece"
              src={`${import.meta.env.BASE_URL}cover.png`}
              alt={t.coverAlt}
            />
          </div>
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
