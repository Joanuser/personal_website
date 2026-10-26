import { useEffect, useMemo, useState } from "react";
import { useI18n } from "../i18n";

type Acceptance =
  | "sponsorship"
  | "cpt_opt"
  | "international"
  | "company_policy"
  | "silent"
  | "unread";

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
  };
  roles: Role[];
};

type Tab = "accept" | "silent" | "unread";

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

export function Internships() {
  const { locale } = useI18n();
  const zh = locale === "zh";
  const [payload, setPayload] = useState<Payload | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("accept");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [windowDays, setWindowDays] = useState("all");
  const [shown, setShown] = useState(48);

  useEffect(() => {
    document.title = zh ? "F-1 可投的美國實習" : "F-1 internships in the US";
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
    setShown(48);
  }, [tab, query, category, windowDays]);

  const copy = zh
    ? {
        title: "收 F-1 的美國實習",
        lede: "清單本身通常沒寫簽證。這裡會打開申請連結後面的官網職缺，讀 CPT、OPT 或簽證贊助那幾句，只把寫明接受、人在美國、而且還開著的留下。",
        steps: [
          "先把 Simplify、Vansh、sndsh，以及 Jobright 的產品管理與商業分析清單合在一起，去掉重複。",
          "職缺列沒寫簽證時，改開官網那一則（Greenhouse、Lever、Ashby、Workday、SmartRecruiters 或公司招募頁），用頁面上的句子判斷。",
          "官網寫不贊助、限公民、要安全許可，或清單標了不贊助／限公民的，會拿掉。加拿大和其他國家也拿掉，因為 CPT 和 OPT 是美國的。",
          "公司過往的 H-1B 件數不算。Jobright 那種「有贊助紀錄、不保證這一則」不會被當成接受。",
        ],
        accept: "官網寫明接受",
        silent: "官網沒提到簽證",
        unread: "官網頁打不開",
        search: "搜公司、職稱、地點",
        allCategories: "全部職類",
        allDates: "不限日期",
        week: "14 天內",
        month: "30 天內",
        empty: "這個條件下面沒有職缺。",
        more: "再看一些",
        open: "打開官網職缺",
        company: "公司官網",
        evidenceFrom: "同一公司的官網職缺",
        wrote: "寫著",
        sources: "來自",
        updated: "更新時間",
        detroit: "美東",
        rejected: "已排除",
        rejectedNote: "筆（官網寫不收、限公民或要許可、已關閉，或地點不在美國）。",
        loading: "正在讀清單…",
        sponsorship: "簽證贊助",
        cpt: "CPT / OPT",
        intl: "歡迎國際生",
        policy: "同公司職缺有寫",
        silentBadge: "官網沒寫",
        unreadBadge: "頁面讀不到",
        silentHelp: "官網職缺說明已經讀過，裡面沒有 CPT、OPT 或贊助。要不要投，請再打開原文確認。",
        unreadHelp: "這一則的說明沒有從招募頁讀到。連結仍是官網職缺，簽證資訊要在那一頁自己看。",
      }
    : {
        title: "US internships that accept F-1",
        lede: "The lists rarely mention visas. This page opens the employer posting behind each application link and keeps a role when that page accepts CPT, OPT, or visa sponsorship.",
        steps: [
          "Simplify, Vansh, sndsh, and Jobright’s product and business-analyst lists are merged and de-duplicated.",
          "When the row is silent, the official posting is opened (Greenhouse, Lever, Ashby, Workday, SmartRecruiters, or the company career page) and the visa sentences on that page decide.",
          "Roles that refuse sponsorship, require citizenship or a clearance, are closed, or sit outside the US are removed. CPT and OPT are US authorizations.",
          "A company’s past H-1B count is not a yes. Jobright’s “track record, not a guarantee” line is ignored.",
        ],
        accept: "Official page says yes",
        silent: "Official page is silent",
        unread: "Official page unreadable",
        search: "Search company, role, location",
        allCategories: "All categories",
        allDates: "Any date",
        week: "Last 14 days",
        month: "Last 30 days",
        empty: "Nothing matches these filters.",
        more: "Show more",
        open: "Open the official posting",
        company: "Company site",
        evidenceFrom: "Another posting at this company",
        wrote: "says",
        sources: "From",
        updated: "Updated",
        detroit: "ET",
        rejected: "Removed",
        rejectedNote: " roles whose official text refuses sponsorship, requires citizenship or a clearance, is closed, or is outside the US.",
        loading: "Loading the list…",
        sponsorship: "Visa sponsorship",
        cpt: "CPT / OPT",
        intl: "International students",
        policy: "Sibling posting says yes",
        silentBadge: "Not mentioned",
        unreadBadge: "Page unreadable",
        silentHelp: "The official description was read and does not mention CPT, OPT, or sponsorship. Open it before you apply.",
        unreadHelp: "The description did not come back from the career page. The link is still the official posting, so the visa line has to be checked there.",
      };

  const categories = useMemo(() => {
    const names = new Set((payload?.roles ?? []).map((role) => role.category));
    return [...names].sort();
  }, [payload]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (payload?.roles ?? []).filter((role) => {
      const onTab =
        tab === "accept"
          ? ACCEPT.has(role.acceptance)
          : tab === "silent"
            ? role.acceptance === "silent"
            : role.acceptance === "unread";
      if (!onTab) return false;
      if (category !== "all" && role.category !== category) return false;
      if (windowDays !== "all") {
        const age = daysSince(role.posted);
        if (age === null || age > Number(windowDays)) return false;
      }
      if (!needle) return true;
      const hay = `${role.company} ${role.role} ${role.location} ${role.evidence}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [payload, tab, query, category, windowDays]);

  const counts = payload?.stats.byAcceptance ?? {};
  const acceptCount =
    (counts.sponsorship ?? 0) +
    (counts.cpt_opt ?? 0) +
    (counts.international ?? 0) +
    (counts.company_policy ?? 0);
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
    return copy.unreadBadge;
  }

  return (
    <main id="content" className="wrap board">
      <p className="board-kicker">F-1 · CPT · OPT · US</p>
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
            ["accept", copy.accept, acceptCount],
            ["silent", copy.silent, counts.silent ?? 0],
            ["unread", copy.unread, counts.unread ?? 0],
          ] as const
        ).map(([id, label, count]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={tab === id ? "is-selected" : ""}
            onClick={() => setTab(id)}
          >
            {label}
            <span>{count}</span>
          </button>
        ))}
      </div>
      {tab === "silent" && <p className="board-help">{copy.silentHelp}</p>}
      {tab === "unread" && <p className="board-help">{copy.unreadHelp}</p>}

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
          return (
            <article key={role.id} className="board-card">
              <div className="board-card-top">
                <span>{role.category}</span>
                <span className={`board-badge is-${role.acceptance}`}>{badge(role)}</span>
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
                    {copy.open}
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
