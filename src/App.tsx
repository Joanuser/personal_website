import { useEffect } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { SiteFooter, SiteHeader } from "./components/Chrome";
import { LanguageProvider, useI18n } from "./i18n";
import { CaseStudy } from "./pages/CaseStudy";
import { Chapter } from "./pages/Chapter";
import { Home } from "./pages/Home";

const chapterAliases = ["intro", "experience", "skills", "projects", "education"] as const;

function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const node = document.querySelector(hash);
      if (node) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        node.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

function NotFound() {
  const { t } = useI18n();
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

function Shell() {
  return (
    <>
      <ScrollManager />
      <SiteHeader />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chapter/:id" element={<Chapter />} />
        <Route path="/work/:slug" element={<CaseStudy />} />
        {chapterAliases.map((id) => (
          <Route key={id} path={`/${id}`} element={<Navigate to={`/chapter/${id}`} replace />} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <SiteFooter />
    </>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Shell />
      </BrowserRouter>
    </LanguageProvider>
  );
}
