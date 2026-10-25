import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { SiteFooter, SiteHeader } from "./components/Chrome";
import { LanguageProvider, useI18n } from "./i18n";
import { CaseStudy } from "./pages/CaseStudy";
import { Home } from "./pages/Home";

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
      <a className="button primary" href="/">
        {t.home}
      </a>
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
        <Route path="/work/:slug" element={<CaseStudy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <SiteFooter />
    </>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </LanguageProvider>
  );
}
