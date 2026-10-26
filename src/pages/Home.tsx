import { useEffect } from "react";
import { Link } from "react-router-dom";
import { person, proof } from "../content";
import { useI18n } from "../i18n";

export function Home() {
  const { locale, t } = useI18n();
  const modules = [
    { id: "intro", num: "01", label: t.navIntro, blurb: t.moduleIntro },
    { id: "experience", num: "02", label: t.navExperience, blurb: t.moduleExperience },
    { id: "skills", num: "03", label: t.navSkills, blurb: t.moduleSkills },
    { id: "projects", num: "04", label: t.navProjects, blurb: t.moduleProjects },
    { id: "education", num: "05", label: t.navEducation, blurb: t.moduleEducation },
  ];

  useEffect(() => {
    document.title = "Chih-Chi Huang — Technical Product Management";
  }, []);

  return (
    <main id="content" className="wrap flat-home">
      <header className="hero">
        <div>
          <p className="kicker">
            <span>{t.kickerSchool}</span>
            <span>{t.kickerProgram}</span>
          </p>
          <h1 className="lockup">
            {person.name} <i>{person.short}</i>
          </h1>
          <p className="target-role">{t.nextValue}</p>
          <p className="lede">{t.lede}</p>
          <p className="support">{t.support}</p>
          <p className="where">{person.location[locale]}</p>
          <div className="hero-actions">
            <a className="button primary" href={`mailto:${person.email}`}>
              {person.email}
            </a>
            <a className="button ghost" href={person.linkedin} target="_blank" rel="noreferrer">
              {t.linkedin}
            </a>
            <a className="button ghost" href={person.github} target="_blank" rel="noreferrer">
              {t.github}
            </a>
          </div>
        </div>
        <figure className="portrait">
          <img src={`${import.meta.env.BASE_URL}cover.png`} alt={t.coverAlt} />
        </figure>
      </header>

      <div className="outcome-row" aria-label={t.proofTitle}>
        {proof.map((item) => (
          <Link key={item.slug} to={`/work/${item.slug}`}>
            <strong>{item.value}</strong>
            <span>{item.label[locale]}</span>
          </Link>
        ))}
      </div>

      <h2 className="modules-heading">{t.modules}</h2>
      <p className="chapter-note">{t.modulesLede}</p>
      <div className="modules">
        {modules.map((module) => (
          <Link key={module.id} className="module" to={`/chapter/${module.id}`}>
            <span className="num">{module.num}</span>
            <span className="name">{module.label}</span>
            <span className="blurb">{module.blurb}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
