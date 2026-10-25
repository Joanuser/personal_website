import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cases, education, employers, experience, person, proof, skills } from "../content";
import { CompareChart, percentIn, tenureMonths } from "../components/Charts";
import { Logo } from "../components/Logos";
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
          <p className="kicker">
            <span>{t.kickerSchool}</span>
            <span>{t.kickerProgram}</span>
          </p>
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
              <b>
                {t.nowValue}
                <small>{t.nowProgram}</small>
              </b>
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
        <figure className="painting">
          <img
            src={`${import.meta.env.BASE_URL}art/watercolor-door.jpg`}
            alt={t.paintingAlt}
            width={864}
            height={1152}
          />
        </figure>
        <aside className="proof">
          <header>
            <h2>{t.proofTitle}</h2>
            <p>{t.proofHint}</p>
          </header>
          {proof.map((item) => {
            const amount = percentIn(item.value) ?? 0;
            return (
              <button key={item.slug} type="button" onClick={() => focusCase(item.slug)}>
                <strong>{item.value}</strong>
                <span className="track" aria-hidden="true">
                  <span style={{ width: `${amount}%` }} />
                </span>
                <span>{item.label[locale]}</span>
              </button>
            );
          })}
        </aside>
      </div>

      <section className="logo-rail" aria-label={t.logoLabel}>
        <div className="wrap logo-rail-inner">
          <p>{t.logoLabel}</p>
          <ul>
            {employers.map((employer) => (
              <li key={employer.id}>
                <a href={`#role-${employer.id}`}>
                  <Logo id={employer.id} />
                  <span className="sr">{employer.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="method" aria-label={t.methodTitle}>
        <div className="wrap method-inner">
          <p>{t.methodTitle}</p>
          <ol>
            {t.methodSteps.map((step, index) => (
              <li key={step}>
                <span>0{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="wrap section" id="work">
        <div className="section-head">
          <h2>{t.workTitle}</h2>
          <p>{t.workNote}</p>
        </div>
        <div className="project-grid">
          {cases.slice(0, 4).map((item) => (
            <article key={item.slug} className="project-card" id={`case-${item.slug}`}>
              <Link to={`/work/${item.slug}`} className="project-card-body">
                <div className="project-card-top">
                  <span className="idx">{item.index}</span>
                  <span className="lens">{item.lens[locale]}</span>
                  {item.status === "progress" ? <span className="pill">{t.inProgress}</span> : null}
                </div>
                <h3>{item.title[locale]}</h3>
                {item.chart ? (
                  <CompareChart
                    caption={item.chart.caption[locale]}
                    rows={item.chart.rows.map((row) => ({
                      label: row.label[locale],
                      value: row.value,
                      display: row.display,
                    }))}
                  />
                ) : (
                  <p className="card-summary">{item.summary[locale]}</p>
                )}
                <p className="card-meta">
                  <span>{item.company}</span>
                  <span>{item.dates}</span>
                </p>
              </Link>
              {item.links && item.links.length > 0 ? (
                <div className="card-links">
                  {item.links.map((link) => (
                    <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                      {link.label[locale]}
                      <span aria-hidden="true">↗</span>
                    </a>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
        <h3 className="education-label">{t.earlierWork}</h3>
        <div className="work-list">
          {cases.slice(4).map((item) => {
            const amount = percentIn(item.metrics[0]?.value ?? "");
            return (
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
                    <span>{item.company}</span>
                    <span>{item.dates}</span>
                  </p>
                  {amount ? (
                    <span className="track track-ink" aria-hidden="true">
                      <span style={{ width: `${amount}%` }} />
                    </span>
                  ) : null}
                </span>
                <span className="metric-pill">{item.metrics[0]?.value}</span>
                <span className="arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="wrap section" id="experience">
        <div className="section-head">
          <h2>{t.experienceTitle}</h2>
          <p>{t.experienceNote}</p>
        </div>
        {experience.map((role) => {
          const months = tenureMonths(role.dates);
          const longest = Math.max(
            ...experience.map((item) => tenureMonths(item.dates) ?? 1),
          );
          return (
          <article className="role" key={role.company} id={role.logoId ? `role-${role.logoId}` : undefined}>
            <div>
              <h3>{role.company}</h3>
              <p className="role-meta">
                <span>{role.place[locale]}</span>
                <span>{role.dates}</span>
              </p>
              {months ? (
                <div className="track track-ink tenure" aria-hidden="true">
                  <span style={{ width: `${(months / longest) * 100}%` }} />
                </div>
              ) : null}
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
          );
        })}
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
                <div className="chips">
                  {group.items[locale].map((chip) => (
                    <span className="chip" key={chip.name}>
                      {chip.name}
                      {chip.note ? <small>{chip.note}</small> : null}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <h3 className="education-label">{t.educationTitle}</h3>
        <div>
          {education.map((school) => (
            <article className="edu" key={school.school.en}>
              <h3>{school.school[locale]}</h3>
              <div className="edu-facts">
                <span>{school.detail[locale]}</span>
                <span>{school.place[locale]}</span>
                <span>{school.dates}</span>
                <span>{school.note[locale]}</span>
              </div>
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
