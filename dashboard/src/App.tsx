import { useEffect, useMemo, useState } from "react";

type Locale = "en" | "zh";

function initialLocale(): Locale {
  try {
    const saved = localStorage.getItem("dashboard-locale");
    if (saved === "en" || saved === "zh") return saved;
  } catch {
    /* private mode */
  }
  if (typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("zh")) {
    return "zh";
  }
  return "en";
}

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

const OUT_OF_REACH = new Set([
  "Software Engineering",
  "Hardware",
  "Quantitative Finance",
  "Data Science, AI & ML",
]);

const FINANCE_TITLE =
  /\b(fp&a|fpa)\b|financial analyst|finance intern|finance internship|business\s*\/\s*finance|corporate finance|internal audit|audit intern|accounting intern|investment analyst|equity research|treasury intern/i;

const OTHER_FIT =
  /product|business analyst|business analytics|business operations|sales operations|revenue operations|strateg|operations|process|salesforce|program manag|business systems|business technology|business management|sourcing|go-to-market|bizops/i;

const OTHER_OUT =
  /engineer|security|cyber|devops|embedded|vlsi|firmware|robot|architect|developer|software|hardware|data engineer|quality assurance|\bqa\b|database|administrator|cloud intern|ui programming|research/i;

function canDo(role: Role): boolean {
  if (OUT_OF_REACH.has(role.category)) return false;
  if (FINANCE_TITLE.test(role.role)) return false;
  if (role.category === "Other") {
    if (OTHER_OUT.test(role.role)) return false;
    if (!OTHER_FIT.test(role.role)) return false;
  }
  return true;
}

function daysSince(posted: string | null): number | null {
  if (!posted) return null;
  const then = Date.parse(`${posted}T12:00:00Z`);
  if (Number.isNaN(then)) return null;
  return Math.floor((Date.now() - then) / 86_400_000);
}

function ageLabel(posted: string | null, zh: boolean): string {
  const age = daysSince(posted);
  if (age === null) return zh ? "未寫" : "Unknown";
  if (age <= 0) return zh ? "今天" : "Today";
  if (zh) return `${age} 天前`;
  return age === 1 ? "1 day ago" : `${age} days ago`;
}

function regionOf(role: Role): Region {
  return role.region === "other" ? "other" : "us";
}

export function App() {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const zh = locale === "zh";

  useEffect(() => {
    document.documentElement.lang = zh ? "zh-Hant" : "en";
    try {
      localStorage.setItem("dashboard-locale", locale);
    } catch {
      /* private mode */
    }
  }, [locale, zh]);
  const [payload, setPayload] = useState<Payload | null>(null);
  const [error, setError] = useState("");
  const [region, setRegion] = useState<Region>("us");
  const [visa, setVisa] = useState<VisaFilter>("all");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [windowDays, setWindowDays] = useState("all");
  const [fitOnly, setFitOnly] = useState(true);

  useEffect(() => {
    document.title = "Dashboard";
  }, []);

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
  }, [region]);

  const copy = zh
    ? {
        title: "Dashboard",
        lede: "點上面的數字切換清單。沒寫簽證的、頁面打不開的都在美國這一格，其他國家在最後一格。",
        us: "美國",
        other: "其他國家",
        allVisa: "全部簽證狀態",
        accept: "官網寫明接受",
        silent: "官網沒寫",
        unread: "只有連結",
        search: "搜公司、職稱、地點",
        allCategories: "全部職類",
        allDates: "不限日期，由新到舊",
        day: "1 天內",
        three: "3 天內",
        seven: "7 天內",
        week: "14 天內",
        month: "30 天內",
        colCategory: "職類",
        colRole: "實習名稱",
        colCompany: "公司名稱",
        colVisa: "簽證贊助狀態",
        colLocation: "地點",
        colPosted: "post 時間",
        colAge: "距離今天",
        colOfficial: "打開官網職缺",
        colCompanySite: "公司官網",
        unknownVisa: "未查",
        empty: "這個條件下面沒有職缺。",
        fit: "只看我能做的",
        fitHelp: "已拿掉軟體工程、硬體、資料科學、量化，以及財務分析。留下產品、業務分析，和少數營運職缺。",
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
        title: "Dashboard",
        lede: "The numbers are the boards. US roles stay listed when a visa is not mentioned or the page would not open. Other countries are the last tile.",
        us: "United States",
        other: "Other countries",
        allVisa: "Any visa note",
        accept: "Official page says yes",
        silent: "Official page is silent",
        unread: "Link only",
        search: "Search company, role, location",
        allCategories: "All categories",
        allDates: "Any date, newest first",
        day: "Last 1 day",
        three: "Last 3 days",
        seven: "Last 7 days",
        week: "Last 14 days",
        month: "Last 30 days",
        colCategory: "Category",
        colRole: "Internship",
        colCompany: "Company",
        colVisa: "Visa status",
        colLocation: "Location",
        colPosted: "Posted",
        colAge: "How long ago",
        colOfficial: "Open the posting",
        colCompanySite: "Company site",
        unknownVisa: "Not checked",
        empty: "Nothing matches these filters.",
        fit: "Only roles I can do",
        fitHelp: "Software, hardware, data science, quant, and financial analysis are hidden. Product, business analysis, and a few operations roles stay.",
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

  const pool = useMemo(() => {
    const roles = payload?.roles ?? [];
    return fitOnly ? roles.filter(canDo) : roles;
  }, [payload, fitOnly]);

  const regionRoles = useMemo(
    () => pool.filter((role) => regionOf(role) === region),
    [pool, region],
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
    }).sort((a, b) => {
      if (a.posted && b.posted && a.posted !== b.posted) return a.posted < b.posted ? 1 : -1;
      if (a.posted) return -1;
      if (b.posted) return 1;
      return a.company.localeCompare(b.company);
    });
  }, [regionRoles, region, visa, query, category, windowDays]);

  const usRoles = pool.filter((role) => regionOf(role) === "us");
  const usCount = usRoles.length;
  const acceptCount = usRoles.filter((role) => ACCEPT.has(role.acceptance)).length;
  const silentCount = usRoles.filter((role) => role.acceptance === "silent").length;
  const unreadCount = usRoles.filter((role) => role.acceptance === "unread").length;
  const otherCount = pool.filter((role) => regionOf(role) === "other").length;
  const slice =
    region === "other" ? "other" : visa === "all" ? "us" : visa;

  function openSlice(nextRegion: Region, nextVisa: VisaFilter) {
    setRegion(nextRegion);
    setVisa(nextVisa);
  }
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
    <>
      <header className="topbar">
        <div>
          <p className="kicker">F-1 · CPT · OPT</p>
          <h1>{copy.title}</h1>
        </div>
        <div className="lang" role="group" aria-label={zh ? "語言" : "Language"}>
          <button type="button" aria-pressed={locale === "en"} onClick={() => setLocale("en")}>
            EN
          </button>
          <button type="button" aria-pressed={locale === "zh"} onClick={() => setLocale("zh")}>
            中文
          </button>
        </div>
      </header>
      <main id="content" className="wrap">
      <p className="lede">{copy.lede}</p>
      {payload ? (
        <p className="board-meta">
          {copy.updated} {updated} {copy.detroit}. {copy.rejected} {payload.stats.rejected}
          {copy.rejectedNote}
        </p>
      ) : (
        <p className="board-meta">{error || copy.loading}</p>
      )}

      <div className="board-metrics" role="tablist" aria-label={copy.title}>
        {(
          [
            ["us", "us", "all", copy.us, usCount],
            ["accept", "us", "accept", copy.accept, acceptCount],
            ["silent", "us", "silent", copy.silent, silentCount],
            ["unread", "us", "unread", copy.unread, unreadCount],
            ["other", "other", "all", copy.other, otherCount],
          ] as const
        ).map(([id, nextRegion, nextVisa, label, count]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={slice === id}
            className={slice === id ? "board-metric is-selected" : "board-metric"}
            onClick={() => openSlice(nextRegion, nextVisa)}
          >
            <strong>{count}</strong>
            <span>{label}</span>
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
        <label className="fit">
          <input
            type="checkbox"
            checked={fitOnly}
            onChange={(event) => {
              setFitOnly(event.target.checked);
              setCategory("all");
            }}
          />
          {copy.fit}
        </label>
        <label>
          <span className="sr-only">{copy.allDates}</span>
          <select value={windowDays} onChange={(event) => setWindowDays(event.target.value)}>
            <option value="all">{copy.allDates}</option>
            <option value="1">{copy.day}</option>
            <option value="3">{copy.three}</option>
            <option value="7">{copy.seven}</option>
            <option value="14">{copy.week}</option>
            <option value="30">{copy.month}</option>
          </select>
        </label>
      </div>

      {fitOnly && <p className="board-help">{copy.fitHelp}</p>}
      <p className="board-count">{filtered.length}</p>
      {filtered.length === 0 && payload && <p className="board-help">{copy.empty}</p>}
      {filtered.length > 0 && (
        <div className="board-sheet">
          <table className="board-table">
            <colgroup>
              <col className="col-category" />
              <col className="col-role" />
              <col className="col-company" />
              <col className="col-visa" />
              <col className="col-location" />
              <col className="col-posted" />
              <col className="col-age" />
              <col className="col-official" />
              <col className="col-site" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">{copy.colCategory}</th>
                <th scope="col">{copy.colRole}</th>
                <th scope="col">{copy.colCompany}</th>
                <th scope="col">{copy.colVisa}</th>
                <th scope="col">{copy.colLocation}</th>
                <th scope="col">{copy.colPosted}</th>
                <th scope="col">{copy.colAge}</th>
                <th scope="col">{copy.colOfficial}</th>
                <th scope="col">{copy.colCompanySite}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((role) => {
                const href = role.officialUrl || role.applyUrl;
                const status = badge(role) || copy.unknownVisa;
                return (
                  <tr key={`${role.region ?? "us"}-${role.id}`}>
                    <td>{role.category}</td>
                    <td className="role-cell">{role.role}</td>
                    <td>{role.company}</td>
                    <td>
                      <span className={`board-badge is-${role.acceptance}`}>{status}</span>
                    </td>
                    <td>{role.location || "—"}</td>
                    <td>{role.posted || "—"}</td>
                    <td>{ageLabel(role.posted, zh)}</td>
                    <td>
                      {href ? (
                        <a href={href} target="_blank" rel="noreferrer">
                          {copy.open}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      {role.companyUrl ? (
                        <a href={role.companyUrl} target="_blank" rel="noreferrer">
                          {copy.company}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      </main>
    </>
  );
}
