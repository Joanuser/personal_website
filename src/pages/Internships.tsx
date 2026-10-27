import { useEffect, useMemo, useState } from "react";
import { useI18n } from "../i18n";

type Acceptance =
  | "sponsorship"
  | "cpt_opt"
  | "international"
  | "company_policy"
  | "silent"
  | "unread"
  | "listed";

type Region = "us" | "other";

type Role = {
  id: string;
  company: string;
  role: string;
  location: string;
  category: string;
  applyUrl: string;
  officialUrl: string;
  companyUrl: string;
  posted: string | null;
  workModel: string | null;
  sources: string[];
  region?: Region;
  acceptance: Acceptance;
  evidence: string;
  checkedOfficial: boolean;
  evidenceRole?: string;
  evidenceUrl?: string;
};

type Payload = {
  generatedAt: string;
  sources: { id: string; label: string; url: string }[];
  stats: {
    parsed: number;
    rejected: number;
    listed: number;
    byAcceptance: Record<string, number>;
    byRegion?: Record<string, number>;
  };
  roles: Role[];
};

type VisaFilter = "all" | "accept" | "silent" | "unread";

const ACCEPT = new Set<Acceptance>(["sponsorship", "cpt_opt", "international", "company_policy"]);

const SOURCE_LABEL: Record<string, string> = {
  simplify: "Simplify",
  "simplify-off": "Simplify off-season",
  vansh: "Vansh",
  "vansh-off": "Vansh off-season",
  sndsh: "sndsh",
  "jobright-pm": "Jobright PM",
  "jobright-ba": "Jobright BA",
};

function daysSince(posted: string | null): number | null {
  if (!posted) return null;
  const then = Date.parse(`${posted}T12:00:00Z`);
  if (Number.isNaN(then)) return null;
  return Math.floor((Date.now() - then) / 86_400_000);
}

function regionOf(role: Role): Region {
  return role.region === "other" ? "other" : "us";
}

export function Internships() {
  const { locale } = useI18n();
  const zh = locale === "zh";
  const [payload, setPayload] = useState<Payload | null>(null);
  const [error, setError] = useState("");
  const [region, setRegion] = useState<Region>("us");
  const [visa, setVisa] = useState<VisaFilter>("all");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [windowDays, setWindowDays] = useState("all");
  const [shown, setShown] = useState(48);

  useEffect(() => {
    document.title = zh ? "實習看板" : "Internship boards";
  }, [zh]);

  useEffect(() => {
    const url = `${import.meta.env.BASE_URL}internships.json`;
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json() as Promise<Payload>;
      })
      .then(setPayload)
      .catch(() => setError(zh ? "清單還沒產生。" : "The list has not been generated."));
  }, [zh]);

  useEffect(() => {
    setCategory("all");
    setVisa("all");
  }, [region]);

  useEffect(() => {
    setShown(48);
  }, [region, visa, query, category, windowDays]);

  const copy = zh
    ? {
        title: "實習看板",
        lede: "美國的職缺都在第一張看板：官網寫明接受的會標出來，沒寫簽證的、頁面打不開的也留在上面，附上名稱和連結。美國以外的在另一張看板。",
        steps: [
          "先把 Simplify、Vansh、sndsh，以及 Jobright 的產品管理與商業分析清單合在一起，去掉重複。",
          "美國職缺如果清單沒寫簽證，會打開官網那一則。寫明接受的會標成 CPT、OPT 或簽證贊助。",
          "官網沒提到簽證的，以及頁面讀不到的，仍列在美國看板上。讀不到的只顯示名稱和連結，自己打開看。",
          "官網寫不贊助、限公民或要安全許可的美國職缺會拿掉。其他國家不拿掉，改列在另一張看板。",
        ],
        us: "美國",
        other: "其他國家",
        allVisa: "全部簽證狀態",
        accept: "官網寫明接受",
        silent: "官網沒寫",
        unread: "只有連結",
        search: "搜公司、職稱、地點",
        allCategories: "全部職類",
        allDates: "不限日期",
        week: "14 天內",
        month: "30 天內",
        empty: "這個條件下面沒有職缺。",
        more: "再看一些",
        open: "打開官網職缺",
        openLink: "打開連結",
        company: "公司官網",
        evidenceFrom: "同一公司的官網職缺",
        wrote: "寫著",
        sources: "來自",
        updated: "更新時間",
        detroit: "美東",
        rejected: "已排除",
        rejectedNote: "筆（官網寫不收、限公民或要許可，或已關閉）。",
        loading: "正在讀清單…",
        sponsorship: "簽證贊助",
        cpt: "CPT / OPT",
        intl: "歡迎國際生",
        policy: "同公司職缺有寫",
        silentBadge: "官網沒寫",
        unreadBadge: "自己打開看",
        usHelp: "沒有寫明簽證的，和頁面打不開的，都在這張看板上。打不開的請用名稱旁的連結自己看。",
        otherHelp: "這些職缺不在美國。每筆都有名稱和連結，簽證資訊請打開那一頁看。",
      }
    : {
        title: "Internship boards",
        lede: "US roles stay on the first board, including ones that never mention a visa and ones whose page would not open. Each of those still has a name and a link. Roles outside the US are on a second board.",
        steps: [
          "Simplify, Vansh, sndsh, and Jobright’s product and business-analyst lists are merged and de-duplicated.",
          "For a US role, the official posting is opened when the row is silent. A page that accepts CPT, OPT, or sponsorship is marked.",
          "US roles whose page never mentions a visa, and roles whose page could not be read, stay on this board. Unreadable rows keep the name and link.",
          "US roles that refuse sponsorship, require citizenship or a clearance, or are closed are removed. Other countries stay, on the other board.",
        ],
        us: "United States",
        other: "Other countries",
        allVisa: "Any visa note",
        accept: "Official page says yes",
        silent: "Official page is silent",
        unread: "Link only",
        search: "Search company, role, location",
        allCategories: "All categories",
        allDates: "Any date",
        week: "Last 14 days",
        month: "Last 30 days",
        empty: "Nothing matches these filters.",
        more: "Show more",
        open: "Open the official posting",
        openLink: "Open the link",
        company: "Company site",
        evidenceFrom: "Another posting at this company",
        wrote: "says",
        sources: "From",
        updated: "Updated",
        detroit: "ET",
        rejected: "Removed",
        rejectedNote: " roles whose official text refuses sponsorship, requires citizenship or a clearance, or is closed.",
        loading: "Loading the list…",
        sponsorship: "Visa sponsorship",
        cpt: "CPT / OPT",
        intl: "International students",
        policy: "Sibling posting says yes",
        silentBadge: "Not mentioned",
        unreadBadge: "Open it yourself",
        usHelp: "Roles that never mention a visa, and roles whose page would not open, are on this board. Use the link next to the name when the page could not be read.",
        otherHelp: "These roles are outside the US. Each one has a name and a link; check the visa line on that page.",
      };

  const regionRoles = useMemo(
    () => (payload?.roles ?? []).filter((role) => regionOf(role) === region),
    [payload, region],
  );

  const categories = useMemo(() => {
    const names = new Set(regionRoles.map((role) => role.category));
    return [...names].sort();
  }, [regionRoles]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return regionRoles.filter((role) => {
      if (region === "us" && visa !== "all") {
        const matches =
          visa === "accept"
            ? ACCEPT.has(role.acceptance)
            : visa === "silent"
              ? role.acceptance === "silent"
              : role.acceptance === "unread";
        if (!matches) return false;
      }
      if (category !== "all" && role.category !== category) return false;
      if (windowDays !== "all") {
        const age = daysSince(role.posted);
        if (age === null || age > Number(windowDays)) return false;
      }
      if (!needle) return true;
      const hay = `${role.company} ${role.role} ${role.location} ${role.evidence}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [regionRoles, region, visa, query, category, windowDays]);

  const usCount = (payload?.roles ?? []).filter((role) => regionOf(role) === "us").length;
  const otherCount = (payload?.roles ?? []).filter((role) => regionOf(role) === "other").length;
  const updated = payload
    ? new Intl.DateTimeFormat(zh ? "zh-Hant" : "en-US", {
        timeZone: "America/Detroit",
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(payload.generatedAt))
    : "";

  function badge(role: Role): string {
    if (role.acceptance === "sponsorship") return copy.sponsorship;
    if (role.acceptance === "cpt_opt") return copy.cpt;
    if (role.acceptance === "international") return copy.intl;
    if (role.acceptance === "company_policy") return copy.policy;
    if (role.acceptance === "silent") return copy.silentBadge;
    if (role.acceptance === "unread") return copy.unreadBadge;
    return "";
  }

  return (
    <main id="content" className="wrap board">
      <p className="board-kicker">F-1 · CPT · OPT</p>
      <h1>{copy.title}</h1>
      <p className="board-lede">{copy.lede}</p>
      <ol className="board-steps">
        {copy.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      {payload ? (
        <p className="board-meta">
          {copy.updated} {updated} {copy.detroit}. {copy.rejected} {payload.stats.rejected}
          {copy.rejectedNote}
        </p>
      ) : (
        <p className="board-meta">{error || copy.loading}</p>
      )}
      {payload && (
        <p className="board-sources">
          {payload.sources.map((source) => (
            <a key={source.id} href={source.url}>
              {source.label}
            </a>
          ))}
        </p>
      )}

      <div className="board-tabs" role="tablist" aria-label={copy.title}>
        {(
          [
            ["us", copy.us, usCount],
            ["other", copy.other, otherCount],
          ] as const
        ).map(([id, label, count]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={region === id}
            className={region === id ? "is-selected" : ""}
            onClick={() => setRegion(id)}
          >
            {label}
            <span>{count}</span>
          </button>
        ))}
      </div>
      <p className="board-help">{region === "us" ? copy.usHelp : copy.otherHelp}</p>

      <div className="board-filters">
        <label>
          <span className="sr-only">{copy.search}</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.search}
            type="search"
          />
        </label>
        {region === "us" && (
          <label>
            <span className="sr-only">{copy.allVisa}</span>
            <select value={visa} onChange={(event) => setVisa(event.target.value as VisaFilter)}>
              <option value="all">{copy.allVisa}</option>
              <option value="accept">{copy.accept}</option>
              <option value="silent">{copy.silent}</option>
              <option value="unread">{copy.unread}</option>
            </select>
          </label>
        )}
        <label>
          <span className="sr-only">{copy.allCategories}</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">{copy.allCategories}</option>
            {categories.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">{copy.allDates}</span>
          <select value={windowDays} onChange={(event) => setWindowDays(event.target.value)}>
            <option value="all">{copy.allDates}</option>
            <option value="14">{copy.week}</option>
            <option value="30">{copy.month}</option>
          </select>
        </label>
      </div>

      <p className="board-count">{filtered.length}</p>
      {filtered.length === 0 && payload && <p className="board-help">{copy.empty}</p>}
      <div className="board-list">
        {filtered.slice(0, shown).map((role) => {
          const href = role.officialUrl || role.applyUrl;
          const label = badge(role);
          const linkText = role.acceptance === "unread" || role.acceptance === "listed" ? copy.openLink : copy.open;
          return (
            <article key={`${role.region ?? "us"}-${role.id}`} className="board-card">
              <div className="board-card-top">
                <span>{role.category}</span>
                {label && <span className={`board-badge is-${role.acceptance}`}>{label}</span>}
              </div>
              <h2>{role.role}</h2>
              <p className="board-company">{role.company}</p>
              <p className="board-where">
                {[role.location, role.posted, role.workModel].filter(Boolean).join(" · ")}
              </p>
              {role.evidence && (
                <blockquote>
                  {role.acceptance === "company_policy" && role.evidenceRole ? (
                    <>
                      {copy.evidenceFrom}「{role.evidenceRole}」{copy.wrote}：「{role.evidence}」
                    </>
                  ) : (
                    <>「{role.evidence}」</>
                  )}
                </blockquote>
              )}
              <div className="board-actions">
                {href && (
                  <a className="button primary" href={href} target="_blank" rel="noreferrer">
                    {linkText}
                  </a>
                )}
                {role.companyUrl && (
                  <a className="button ghost" href={role.companyUrl} target="_blank" rel="noreferrer">
                    {copy.company}
                  </a>
                )}
              </div>
              <p className="board-from">
                {copy.sources}{" "}
                {role.sources.map((source) => SOURCE_LABEL[source] ?? source).join(" · ")}
              </p>
            </article>
          );
        })}
      </div>
      {shown < filtered.length && (
        <button type="button" className="button ghost board-more" onClick={() => setShown((value) => value + 48)}>
          {copy.more}
        </button>
      )}
    </main>
  );
}
