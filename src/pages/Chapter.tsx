import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { cases, education, experience, person, proof, skills } from "../content";
import { CompareChart, percentIn, tenureMonths } from "../components/Charts";
import { Voyage } from "../components/Voyage";
import { useI18n } from "../i18n";

const order = ["intro", "experience", "skills", "projects", "education"] as const;
type ChapterId = (typeof order)[number];

function isChapter(id: string | undefined): id is ChapterId {
  return order.includes(id as ChapterId);
}

export function Chapter() {
  const { id } = useParams();
  const { locale, t } = useI18n();
  const story = [...experience].reverse();
  const [selected, setSelected] = useState<string | null>(story[0]?.logoId ?? null);

  useEffect(() => {
    document.title = "Chih-Chi Huang — Technical Product Management";
  }, [id]);

  if (!isChapter(id)) {
    return (
      <main id="content" className="wrap not-found">
        <h1>{t.notFoundTitle}</h1>
        <p>{t.notFoundBody}</p>
        <Link className="button primary" to="/">
          {t.home}
        </Link>
      </main>
    );
  }

  const index = order.indexOf(id);
  const next = order[index + 1];
  const titles: Record<ChapterId, string> = {
    intro: t.navIntro,
    experience: t.navExperience,
    skills: t.navSkills,
    projects: t.navProjects,
    education: t.navEducation,
  };
  const role = story.find((item) => (item.logoId ?? item.company) === selected) ?? story[0];

  return (
    <main id="content" className="desk-scene">
      <article className="spread">
        <div className="page">
          <Link className="back" to="/">
            ← {t.contents}
          </Link>
          <p className="contents-kicker">0{index + 1}</p>
          <h1 className="contents-title">{titles[id]}</h1>
          {id === "experience" ? (
            <>
              <p className="story-line">{t.voyageNote}</p>
              <Voyage selected={selected} onSelect={setSelected} />
            </>
          ) : (
            <p className="story-line">{id === "intro" ? t.lede : t.contentsLede}</p>
          )}
          {next ? (
            <Link className="chapter-next" to={`/chapter/${next}`}>
              <span>{t.nextChapter}</span>
              <strong>
                0{index + 2} {titles[next]}
              </strong>
            </Link>
          ) : (
            <a className="chapter-next" href={`mailto:${person.email}`}>
              <span>{t.navContact}</span>
              <strong>{person.email}</strong>
            </a>
          )}
        </div>
        <div className="page page-story">
          {id === "intro" ? <Intro locale={locale} /> : null}
          {id === "experience" && role ? <RolePage role={role} locale={locale} /> : null}
          {id === "skills" ? <SkillsPage locale={locale} /> : null}
          {id === "projects" ? <ProjectsPage locale={locale} /> : null}
          {id === "education" ? <EducationPage locale={locale} /> : null}
        </div>
      </article>
    </main>
  );
}

function Intro({ locale }: { locale: "en" | "zh" }) {
  const { t } = useI18n();
  return (
    <>
      <p className="kicker">
        <span>{t.kickerSchool}</span>
        <span>{t.kickerProgram}</span>
      </p>
      <p className="story-line">{t.support}</p>
      <p>{t.aboutBody}</p>
      <p>{t.alsoBody}</p>
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
      <div className="proof proof-page">
        {proof.map((item) => {
          const amount = percentIn(item.value) ?? 0;
          return (
            <Link key={item.slug} to={`/work/${item.slug}`}>
              <strong>{item.value}</strong>
              <span className="track" aria-hidden="true">
                <span style={{ width: `${amount}%` }} />
              </span>
              <span>{item.label[locale]}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}

function RolePage({
  role,
  locale,
}: {
  role: (typeof experience)[number];
  locale: "en" | "zh";
}) {
  const { t } = useI18n();
  const months = tenureMonths(role.dates);
  const longest = Math.max(...experience.map((item) => tenureMonths(item.dates) ?? 1));
  return (
    <article>
      <h2>{role.company}</h2>
      <p className="role-meta">{role.role[locale]}</p>
      <p className="role-meta">
        <span>{role.place[locale]}</span>
        <span>{role.dates}</span>
      </p>
      {months ? (
        <div className="track track-ink tenure" aria-hidden="true">
          <span style={{ width: `${(months / longest) * 100}%` }} />
        </div>
      ) : null}
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
    </article>
  );
}

function SkillsPage({ locale }: { locale: "en" | "zh" }) {
  return (
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
  );
}

function ProjectsPage({ locale }: { locale: "en" | "zh" }) {
  const { t } = useI18n();
  return (
    <>
      <p className="chapter-note">{t.workNote}</p>
      <div className="project-grid">
        {cases.slice(0, 4).map((item) => (
          <article key={item.slug} className="project-card">
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
        {cases.slice(4).map((item) => (
          <Link key={item.slug} to={`/work/${item.slug}`} className="work-row">
            <span className="idx">{item.index}</span>
            <span>
              <p className="lens">{item.lens[locale]}</p>
              <h3>{item.title[locale]}</h3>
              <p className="meta">
                <span>{item.company}</span>
                <span>{item.dates}</span>
              </p>
            </span>
            <span className="metric-pill">{item.metrics[0]?.value}</span>
            <span className="arrow" aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}

function EducationPage({ locale }: { locale: "en" | "zh" }) {
  return (
    <>
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
    </>
  );
}
