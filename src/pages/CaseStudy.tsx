import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { cases } from "../content";
import { CompareChart, percentIn } from "../components/Charts";
import { MarketStudy } from "../components/MarketStudy";
import { useI18n } from "../i18n";

export function CaseStudy() {
  const { slug } = useParams();
  const { locale, t } = useI18n();
  const index = cases.findIndex((item) => item.slug === slug);
  const item = index >= 0 ? cases[index] : undefined;

  useEffect(() => {
    if (!item) {
      document.title = "Chih-Chi Huang";
      return;
    }
    document.title = `${item.title[locale]} — Chih-Chi Huang`;
  }, [item, locale]);

  if (!item) {
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

  const previous = index > 0 ? cases[index - 1] : undefined;
  const next = index < cases.length - 1 ? cases[index + 1] : undefined;

  return (
    <main id="content">
      <article className="wrap">
        <header className="case-hero">
          <Link className="back" to="/chapter/projects">
            ← {t.back}
          </Link>
          <p className="kicker">
            {item.lens[locale]}
            {item.status === "progress" ? <span className="pill">{t.inProgress}</span> : null}
          </p>
          <h1>{item.title[locale]}</h1>
          <p className="support">{item.summary[locale]}</p>
          <dl className="fact-grid">
            <div>
              <dt>{t.factOrg}</dt>
              <dd>{item.company}</dd>
            </div>
            <div>
              <dt>{t.factRole}</dt>
              <dd>{item.role[locale]}</dd>
            </div>
            <div>
              <dt>{t.factPlace}</dt>
              <dd>{item.place[locale]}</dd>
            </div>
            <div>
              <dt>{t.factWhen}</dt>
              <dd>{item.dates}</dd>
            </div>
          </dl>
          {item.links && item.links.length > 0 ? (
            <div className="case-links">
              {item.links.map((link) => (
                <a key={link.href} className="button primary" href={link.href} target="_blank" rel="noreferrer">
                  {link.label[locale]}
                  <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          ) : null}
        </header>
        {item.chart ? (
          <CompareChart
            caption={item.chart.caption[locale]}
            rows={item.chart.rows.map((row) => ({
              label: row.label[locale],
              value: row.value,
              display: row.display,
            }))}
          />
        ) : null}
        <div className="case-metrics">
          {item.metrics.map((metric) => {
            const amount = percentIn(metric.value);
            return (
              <article key={`${metric.value}-${metric.label.en}`}>
                <strong>{metric.value}</strong>
                <span>{metric.label[locale]}</span>
                {amount ? (
                  <span className="track" aria-hidden="true">
                    <span style={{ width: `${amount}%` }} />
                  </span>
                ) : null}
              </article>
            );
          })}
        </div>
        <div className="case-layout">
          <nav className="toc" aria-label="Sections">
            {item.sections.map((section) => (
              <a key={section.id} href={`#${section.id}`}>
                {section.heading[locale]}
              </a>
            ))}
          </nav>
          <div className="prose">
            {item.sections.map((section) => (
              <section key={section.id} id={section.id}>
                <h2>{section.heading[locale]}</h2>
                <p>{section.body[locale]}</p>
              </section>
            ))}
            {item.study === "market" ? <MarketStudy /> : null}
          </div>
        </div>
        <p className="note">{t.writtenFrom}</p>
        <div className="pager">
          {previous ? (
            <Link to={`/work/${previous.slug}`}>
              <small>{t.previous}</small>
              <span>{previous.title[locale]}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link to={`/work/${next.slug}`}>
              <small>{t.next}</small>
              <span>{next.title[locale]}</span>
            </Link>
          ) : (
            <span />
          )}
        </div>
      </article>
    </main>
  );
}
