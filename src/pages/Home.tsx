import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cases, education, experience, person, proof, skills } from "../content";
import { useI18n } from "../i18n";

function scrollToId(id: string) {
  const node = document.getElementById(id);
  if (!node) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  node.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

export function Home() {
  const { locale, t } = useI18n();
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Chih-Chi Huang — Technical Product Management";
  }, []);

  const focusCase = (slug: string) => {
    setActive(slug);
    scrollToId("work");
  };

  return (
    <main id="content">
      <div className="wrap hero">
        <div>
          <p className="kicker">{t.kicker}</p>
          <h1 className="lockup">
            Chih-Chi
            <br />
            Huang <i>{person.short}</i>
          </h1>
          <p className="lede">{t.lede}</p>
          <p className="support">{t.support}</p>
          <div className="status">
            <span>
              {t.nowLabel}
              <b>{t.nowValue}</b>
            </span>
            <span>
              {t.nextLabel}
              <b>{t.nextValue}</b>
            </span>
          </div>
          <div className="hero-actions">
            <a className="button primary" href="#work">
              {t.seeWork}
            </a>
            <a className="button ghost" href={`mailto:${person.email}`}>
              {t.write}
            </a>
          </div>
        </div>
        <aside className="proof">
          <header>
            <h2>{t.proofTitle}</h2>
            <p>{t.proofHint}</p>
          </header>
          {proof.map((item) => (
            <button key={item.slug} type="button" onClick={() => focusCase(item.slug)}>
              <strong>{item.value}</strong>
              <span>{item.label[locale]}</span>
            </button>
          ))}
        </aside>
      </div>

      <section className="wrap section" id="work">
        <div className="section-head">
          <h2>{t.workTitle}</h2>
          <p>{t.workNote}</p>
        </div>
        <div className="work-list">
          {cases.map((item) => (
            <Link
              key={item.slug}
              to={`/work/${item.slug}`}
              className={active === item.slug ? "work-row is-hot" : "work-row"}
              id={`case-${item.slug}`}
            >
              <span className="idx">{item.index}</span>
              <span>
                <p className="lens">{item.lens[locale]}</p>
                <h3>{item.title[locale]}</h3>
                <p className="meta">
                  {item.company} · {item.dates}
                </p>
              </span>
              <span className="metric-pill">{item.metrics[0]?.value}</span>
              <span className="arrow" aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="wrap section" id="experience">
        <div className="section-head">
          <h2>{t.experienceTitle}</h2>
          <p>{t.experienceNote}</p>
        </div>
        {experience.map((role) => (
          <article className="role" key={role.company}>
            <div>
              <h3>{role.company}</h3>
              <p className="role-meta">
                {role.place[locale]}
                <br />
                {role.dates}
              </p>
            </div>
            <div>
              <p className="role-meta">{role.role[locale]}</p>
              <ul>
                {role.points[locale].map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              {role.caseSlug ? (
                <Link className="more" to={`/work/${role.caseSlug}`}>
                  {t.readCase} →
                </Link>
              ) : null}
            </div>
          </article>
        ))}
      </section>

      <section className="wrap section" id="about">
        <div className="section-head">
          <h2>{t.aboutTitle}</h2>
        </div>
        <div className="about-grid">
          <div>
            <p>{t.aboutBody}</p>
            <p>{t.aboutSite}</p>
            <h3>{t.alsoTitle}</h3>
            <p>{t.alsoBody}</p>
          </div>
          <div className="panel">
            {skills.map((group) => (
              <div className="skill" key={group.label.en}>
                <h3>{group.label[locale]}</h3>
                <p>{group.items[locale].join(" · ")}</p>
              </div>
            ))}
          </div>
        </div>
        <h3 className="education-label">{t.educationTitle}</h3>
        <div>
          {education.map((school) => (
            <article className="edu" key={school.school.en}>
              <h3>{school.school[locale]}</h3>
              <p className="role-meta">
                {school.detail[locale]} · {school.place[locale]} · {school.dates} · {school.note[locale]}
              </p>
              {school.points[locale].length > 0 ? (
                <ul>
                  {school.points[locale].map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="wrap section" id="contact">
        <div className="contact">
          <h2>{t.contactTitle}</h2>
          <p>{t.contactBody}</p>
          <a className="email" href={`mailto:${person.email}`}>
            {person.email}
          </a>
          <div className="contact-links">
            <a href={`tel:${person.phoneHref}`}>
              {t.phone} {person.phoneDisplay}
            </a>
            <a href={person.linkedin} target="_blank" rel="noreferrer">
              {t.linkedin}
            </a>
            <a href={person.github} target="_blank" rel="noreferrer">
              {t.github}
            </a>
            <span>{person.location[locale]}</span>
          </div>
        </div>
      </section>
    </main>
  );
}
