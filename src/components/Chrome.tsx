import { useState } from "react";
import { Link } from "react-router-dom";
import { person } from "../content";
import { useI18n } from "../i18n";

export function SiteHeader() {
  const { t, locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className={open ? "header is-open" : "header"}>
      <a className="skip" href="#content">
        {t.skip}
      </a>
      <div className="header-inner">
        <Link to="/" className="brand" onClick={close}>
          <span className="brand-mark" aria-hidden="true">
            CH
          </span>
          <span>
            {person.name}
            <small>{person.short}</small>
          </span>
        </Link>
        <nav className="nav" aria-label="Primary">
          <div className="lang" role="group" aria-label={t.langLabel}>
            <button type="button" aria-pressed={locale === "en"} onClick={() => setLocale("en")}>
              EN
            </button>
            <button type="button" aria-pressed={locale === "zh"} onClick={() => setLocale("zh")}>
              中文
            </button>
          </div>
          <button
            className="menu-toggle"
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? t.close : t.menu}
          </button>
          <div className="nav-links">
            <Link to="/#intro" onClick={close}>{t.navIntro}</Link>
            <Link to="/#experience" onClick={close}>{t.navExperience}</Link>
            <Link to="/#skills" onClick={close}>{t.navSkills}</Link>
            <Link to="/#projects" onClick={close}>{t.navProjects}</Link>
            <Link to="/#education" onClick={close}>{t.navEducation}</Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="wrap footer">
      <span>© {new Date().getFullYear()} {person.name}</span>
      <span className="colophon">{t.colophon}</span>
    </footer>
  );
}
