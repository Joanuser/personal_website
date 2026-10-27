import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { person } from "../content";
import { useI18n } from "../i18n";

export function SiteHeader() {
  const { t, locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const { pathname } = useLocation();

  return (
    <header className={open ? "header is-open" : "header"}>
      <a className="skip" href="#content">
        {t.skip}
      </a>
      <div className="header-inner">
        <Link to="/" className="brand brand-hello" onClick={close}>
          <span>{person.short}</span>
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
            <Link to="/chapter/projects" aria-current={pathname === "/chapter/projects" ? "page" : undefined} onClick={close}>{t.navProjects}</Link>
            <Link to="/chapter/experience" aria-current={pathname === "/chapter/experience" ? "page" : undefined} onClick={close}>{t.navExperience}</Link>
            <Link to="/chapter/intro" aria-current={pathname === "/chapter/intro" ? "page" : undefined} onClick={close}>{t.navIntro}</Link>
            <Link to="/chapter/education" aria-current={pathname === "/chapter/education" ? "page" : undefined} onClick={close}>{t.navEducation}</Link>
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
