import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { cases, education, experience, person, proof, skills } from "../content";
import { Logo } from "../components/Logos";
import { useI18n } from "../i18n";

const order = ["intro", "experience", "skills", "projects", "education"] as const;
type ChapterId = (typeof order)[number];

function isChapter(id: string | undefined): id is ChapterId {
  return order.includes(id as ChapterId);
}

export function Chapter() {
  const { id } = useParams();
  const { locale, t } = useI18n();

  const titles: Record<ChapterId, string> = {
    intro: t.navIntro,
    experience: t.navExperience,
    skills: t.navSkills,
    projects: t.navProjects,
    education: t.navEducation,
  };

  useEffect(() => {
    if (!isChapter(id)) {
      document.title = "Chih-Chi Huang — Technical Product Management";
      return;
    }
    const label = {
      intro: t.navIntro,
      experience: t.navExperience,
      skills: t.navSkills,
      projects: t.navProjects,
      education: t.navEducation,
    }[id];
    document.title = `${label} — Chih-Chi Huang`;
  }, [id, t]);

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
  const previous = index > 0 ? order[index - 1] : undefined;
  const next = order[index + 1];

  return (
    <main id="content" className="wrap module-page">
      <Link className="back" to="/">
        ← {person.short}
      </Link>
      <h1>{titles[id]}</h1>
      {id === "experience" ? <p className="chapter-note">{t.experienceNote}</p> : null}
      {id === "intro" ? <Intro locale={locale} /> : null}
      {id === "experience" ? <ExperiencePage locale={locale} /> : null}
      {id === "skills" ? <SkillsPage locale={locale} /> : null}
      {id === "projects" ? <ProjectsPage locale={locale} /> : null}
      {id === "education" ? <EducationPage locale={locale} /> : null}
      <nav className="module-pager" aria-label={t.modules}>
        {previous ? (
          <Link to={`/chapter/${previous}`}>
            <small>{t.previous}</small>
            <strong>
              0{index} {titles[previous]}
            </strong>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/chapter/${next}`}>
            <small>{t.nextChapter}</small>
            <strong>
              0{index + 2} {titles[next]}
            </strong>
          </Link>
        ) : (
          <a href={`mailto:${person.email}`}>
            <small>{t.navContact}</small>
            <strong>{person.email}</strong>
          </a>
        )}
      </nav>
    </main>
  );
}

function Intro({ locale }: { locale: "en" | "zh" }) {
  const { t } = useI18n();
  return (
    <>
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
      <div className="outcome-row">
        {proof.map((item) => (
          <Link key={item.slug} to={`/work/${item.slug}`}>
            <strong>{item.value}</strong>
            <span>{item.label[locale]}</span>
          </Link>
        ))}
      </div>
      <h2>{t.aboutTitle}</h2>
      <p>{t.aboutBody}</p>
      <p>{t.aboutSite}</p>
      <h2>{t.alsoTitle}</h2>
      <p>{t.alsoBody}</p>
      <p>
        <Link className="more" to="/chapter/skills">
          {t.navSkills} →
        </Link>
      </p>
    </>
  );
}

function ExperiencePage({ locale }: { locale: "en" | "zh" }) {
  const { t } = useI18n();
  return (
    <>
      {experience.map((role) => (
        <article className="role" key={role.company}>
          <div>
            {role.logoId ? <Logo id={role.logoId} /> : null}
            <h3>{role.company}</h3>
            <p className="role-meta">{role.role[locale]}</p>
            <p className="role-meta">
              {role.place[locale]} · {role.dates}
            </p>
          </div>
          <div>
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
    </>
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
      <div className="case-posters">
        {cases.slice(0, 4).map((item) => (
          <ProjectCard key={item.slug} item={item} locale={locale} />
        ))}
      </div>
      <h3 className="education-label">{t.earlierWork}</h3>
      <div className="case-posters">
        {cases.slice(4).map((item) => (
          <ProjectCard key={item.slug} item={item} locale={locale} />
        ))}
      </div>
    </>
  );
}

function ProjectCard({
  item,
  locale,
}: {
  item: (typeof cases)[number];
  locale: "en" | "zh";
}) {
  const { t } = useI18n();
  return (
    <article className={`case-poster case-poster-${Number(item.index) % 4}`}>
      <Link to={`/work/${item.slug}`} className="case-poster-link">
        <p className="lens">
          {item.lens[locale]}
          {item.status === "progress" ? <span className="pill">{t.inProgress}</span> : null}
        </p>
        <h3>{item.title[locale]}</h3>
        <p className="card-summary">{item.summary[locale]}</p>
        {item.metrics[0] ? (
          <p className="case-poster-metric">
            <strong>{item.metrics[0].value}</strong>
            <span>{item.metrics[0].label[locale]}</span>
          </p>
        ) : null}
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
