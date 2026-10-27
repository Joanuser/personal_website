#!/usr/bin/env python3
"""Build two internship boards from the public lists.

The US board keeps open roles even when the official page never mentions a
visa, and it keeps a name and link when that page cannot be read. A role is
left off only when the official text refuses sponsorship or requires
citizenship or a clearance. Roles outside the US go on a second board.
"""

from __future__ import annotations

import html
import json
import re
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date, datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
OUT_PATH = ROOT / "dashboard" / "public" / "internships.json"
CACHE_PATH = ROOT / "internships" / ".cache" / "pages.json"
TODAY = datetime.now(ZoneInfo("America/Detroit")).date()
UA = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
)
FETCHER_VERSION = "v2"

SOURCES = [
    {
        "id": "simplify",
        "label": "SimplifyJobs / Pitt CSC",
        "url": "https://raw.githubusercontent.com/SimplifyJobs/Summer2027-Internships/dev/README.md",
        "listing": "https://github.com/SimplifyJobs/Summer2027-Internships",
    },
    {
        "id": "simplify-off",
        "label": "SimplifyJobs off-season",
        "url": "https://raw.githubusercontent.com/SimplifyJobs/Summer2027-Internships/dev/README-Off-Season.md",
        "listing": "https://github.com/SimplifyJobs/Summer2027-Internships/blob/dev/README-Off-Season.md",
    },
    {
        "id": "vansh",
        "label": "Vansh Summer 2027",
        "url": "https://raw.githubusercontent.com/vanshb03/Summer2027-Internships/dev/README.md",
        "listing": "https://github.com/vanshb03/Summer2027-Internships",
    },
    {
        "id": "vansh-off",
        "label": "Vansh off-season",
        "url": "https://raw.githubusercontent.com/vanshb03/Summer2027-Internships/dev/OFFSEASON_README.md",
        "listing": "https://github.com/vanshb03/Summer2027-Internships/blob/dev/OFFSEASON_README.md",
    },
    {
        "id": "sndsh",
        "label": "sndsh summer 2027",
        "url": "https://raw.githubusercontent.com/sndsh404/summer-2027-internships/main/README.md",
        "listing": "https://github.com/sndsh404/summer-2027-internships",
    },
    {
        "id": "jobright-pm",
        "label": "Jobright Product Management",
        "url": "https://raw.githubusercontent.com/jobright-ai/2026-Product-Management-Internship/master/README.md",
        "listing": "https://github.com/jobright-ai/2026-Product-Management-Internship",
        "category": "Product Management",
    },
    {
        "id": "jobright-ba",
        "label": "Jobright Business Analyst",
        "url": "https://raw.githubusercontent.com/jobright-ai/2026-Business-Analyst-Internship/master/README.md",
        "listing": "https://github.com/jobright-ai/2026-Business-Analyst-Internship",
        "category": "Business Analyst",
    },
]

SHORTENERS = ("go.vansh.nyc", "bit.ly", "tinyurl.com", "t.co", "lnkd.in")
MONTHS = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}

US_ABBR = re.compile(
    r"(?:,|\s|\()(AL|AK|AZ|AR|CA|CO|CT|DC|DE|FL|GA|HI|IA|ID|IL|IN|KS|KY|LA|MA|MD|ME|"
    r"MI|MN|MO|MS|MT|NC|ND|NE|NH|NJ|NM|NV|NY|OH|OK|OR|PA|PR|RI|SC|SD|TN|TX|UT|VA|VT|"
    r"WA|WI|WV|WY)(?=,|\s|\)|$|/)",
    re.I,
)
CANADA_PROV = re.compile(
    r"(?:,|\s|\()(AB|BC|MB|NB|NL|NS|NT|NU|ON|PE|QC|SK|YT)(?=,|\s|\)|$|/)",
    re.I,
)
FOREIGN = re.compile(
    r"\b(canada|united kingdom|england|uk|india|singapore|germany|ireland|australia|"
    r"japan|taiwan|china|france|netherlands|poland|spain|mexico|brazil|korea|israel|"
    r"switzerland|sweden|denmark|finland|norway|portugal|italy|belgium|austria|"
    r"romania|vietnam|philippines|indonesia|malaysia|thailand|dubai|hong kong|"
    r"europe|emea|toronto|vancouver|montreal|ottawa|calgary|waterloo|mississauga)\b",
    re.I,
)
US_CITY = re.compile(
    r"\b(nyc|sf|san francisco|south san francisco|south sf|chicago|st\.?\s*louis|auburn hills|new york city)\b",
    re.I,
)
US_NAME = re.compile(
    r"\b(alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|"
    r"florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|"
    r"maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|"
    r"nebraska|nevada|new hampshire|new jersey|new mexico|new york|north carolina|"
    r"north dakota|ohio|oklahoma|oregon|pennsylvania|rhode island|south carolina|"
    r"south dakota|tennessee|texas|utah|vermont|virginia|washington|west virginia|"
    r"wisconsin|wyoming|district of columbia|united states|u\.s\.a|usa)\b",
    re.I,
)

BOILER = re.compile(
    r"track record of offering|does not guarantee sponsorship|h-?1b sponsorships?, with",
    re.I,
)
NEG_CITIZEN = re.compile(
    r"(must be|required to be|requires|only open to|limited to)\s+(a |an )?"
    r"(u\.?s\.?\s+|united states\s+)?(citizen|permanent resident|lawful permanent resident)"
    r"|u\.?s\.?\s+citizen(ship)?\s+(is\s+)?required"
    r"|requires?\s+u\.?s\.?\s+citizen"
    r"|u\.?s\.?\s+persons?\s+only"
    r"|must be a u\.?s\.?\s+person"
    r"|only u\.?s\.?\s+(citizens|persons|workers)"
    r"|no foreign nationals"
    r"|export control.{0,80}(u\.?s\.?\s+person|citizen)"
    r"|(u\.?s\.?\s+person|citizenship).{0,50}export control",
    re.I,
)
CITIZEN_WAIVER = re.compile(
    r"do not require|not required|regardless of citizenship|without regard|equal opportunity",
    re.I,
)
NEG_CLEARANCE = re.compile(
    r"security clearance|ts/sci|top secret|public trust clearance|"
    r"ability to obtain (a )?(u\.?s\.? )?clearance",
    re.I,
)
NEG_SPONSOR = re.compile(
    r"(do(?:es)? not|will not|cannot|can't|unable to|not able to|no longer)\s+"
    r"(?:provide |offer |consider |support )?(?:visa |employment |immigration )?sponsor"
    r"|no (?:visa |employment |immigration )?sponsorship"
    r"|sponsorship (?:is |will )?not(?: be)? (?:available|provided|offered|considered)"
    r"|visa sponsorship (?:is |will )?not\b"
    r"|without (?:the need for |requiring |needing )?(?:current or future |future |ongoing )?"
    r"(?:visa |employment )?sponsorship"
    r"|not (?:eligible|able) (?:to |for ).{0,40}sponsor"
    r"|sponsorship is unavailable"
    r"|does not offer (?:visa )?sponsorship"
    r"|(?:visa )?sponsorship\s*:\s*no\b",
    re.I,
)
NEG_CPT = re.compile(
    r"(cpt|opt|f-1).{0,50}(not (?:eligible|accepted|considered)|ineligible|will not|cannot)"
    r"|(?:not (?:accept|consider)|unable|ineligible).{0,40}(cpt|opt|f-1 visa)",
    re.I,
)
POS_SPONSOR = re.compile(
    r"visa sponsorship (?:is |will be |are )?(?:available|provided|offered|considered)"
    r"|sponsorship (?:is |will be )?(?:available|provided|offered)"
    r"|(?:will|can|does|do|happy to|willing to|able to|open to) sponsor"
    r"|sponsor(?:s|ing)? (?:visas|h-?1b|employment visas|work visas)"
    r"|h-?1b sponsorship (?:is )?available"
    r"|offer(?:s|ing)? (?:visa |h-?1b )?sponsorship"
    r"|sponsorship available for"
    r"|(?:visa )?sponsorship\s*:\s*yes\b",
    re.I,
)
POS_INTL = re.compile(
    r"international students?.{0,40}\b(?:are |is )?(?:welcome|encouraged|accepted|invited)"
    r"|(?:welcome|open to|encourage[sd]?).{0,40}international students?",
    re.I,
)
CPT_PHRASE = re.compile(
    r"optional practical training|curricular practical training|STEM\s+OPT|F-1|F1 visa",
    re.I,
)
CPT_ACRONYM = re.compile(r"(?<![A-Za-z])(CPT|OPT)(?![A-Za-z-])")
CPT_CONTEXT = re.compile(
    r"student|visa|sponsor|authoriz|eligib|immigration|work authorization",
    re.I,
)


def log(message: str) -> None:
    print(message, file=sys.stderr, flush=True)


class Cache:
    def __init__(self, path: Path) -> None:
        self.path = path
        self.lock = threading.Lock()
        self.data: dict = {}
        if path.exists():
            try:
                loaded = json.loads(path.read_text(encoding="utf-8"))
                if isinstance(loaded, dict):
                    self.data = loaded
            except (OSError, json.JSONDecodeError):
                self.data = {}
        self.writes = 0

    def get(self, key: str):
        with self.lock:
            item = self.data.get(key)
        if not item or item.get("v") != FETCHER_VERSION:
            return None
        return item

    def set(self, key: str, value: dict) -> None:
        value = {"v": FETCHER_VERSION, **value}
        with self.lock:
            self.data[key] = value
            self.writes += 1
            should = self.writes % 200 == 0
        if should:
            self.save()

    def save(self) -> None:
        with self.lock:
            self.path.parent.mkdir(parents=True, exist_ok=True)
            temporary = self.path.with_suffix(".tmp")
            temporary.write_text(json.dumps(self.data), encoding="utf-8")
            temporary.replace(self.path)


def request(
    url: str,
    timeout: int = 30,
    data: bytes | None = None,
    headers: dict | None = None,
    max_bytes: int = 2_000_000,
):
    merged = {"User-Agent": UA, "Accept": "text/html,application/json;q=0.9,*/*;q=0.8"}
    if headers:
        merged.update(headers)
    last_error = "fetch failed"
    for attempt in range(3):
        req = urllib.request.Request(url, data=data, headers=merged)
        try:
            with urllib.request.urlopen(req, timeout=timeout) as response:
                body = response.read(max_bytes)
                return response.geturl(), response.status, dict(response.headers), body
        except urllib.error.HTTPError as error:
            last_error = f"HTTP {error.code}"
            if error.code in {429, 500, 502, 503, 504} and attempt < 2:
                time.sleep(1.5 + attempt)
                continue
            detail = error.read(400).decode("utf-8", "replace")
            return url, error.code, {}, detail.encode()
        except Exception as error:  # noqa: BLE001 - network failures stay in the cache
            last_error = type(error).__name__
            if attempt < 2:
                time.sleep(0.8)
                continue
    return url, 0, {}, last_error.encode()


def html_to_text(value: str) -> str:
    text = value or ""
    for _ in range(2):
        unescaped = html.unescape(text)
        if unescaped == text:
            break
        text = unescaped
    text = re.sub(r"(?is)<script[^>]*>.*?</script>", " ", text)
    text = re.sub(r"(?is)<style[^>]*>.*?</style>", " ", text)
    text = re.sub(r"(?i)<\s*br\s*/?>", "\n", text)
    text = re.sub(r"(?i)</\s*(p|li|h\d|div|tr)\s*>", "\n", text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = html.unescape(text).replace("\xa0", " ")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n\s+", "\n", text)
    return text.strip()


def cell_text(value: str) -> str:
    value = re.sub(r"(?i)<\s*br\s*/?>|</br>", " / ", value or "")
    return re.sub(r"\s+", " ", html_to_text(value)).strip()


def clean_label(value: str) -> str:
    value = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", value)
    value = value.replace("**", "")
    value = re.sub(r"[🛂🇺🇸🔒🔥🎓⏳]", "", value)
    value = re.sub(r"\s+", " ", value).strip(" |-")
    return value


def extract_urls(blob: str) -> list[str]:
    found = re.findall(r"https?://[^\s<>\"')\]]+", html.unescape(blob or ""))
    cleaned = []
    for url in found:
        url = url.rstrip(".,);")
        if re.search(r"\.(png|jpe?g|svg|gif|webp)(\?|$)", url, re.I):
            continue
        if "i.imgur.com" in url or "shields.io" in url:
            continue
        cleaned.append(url)
    return cleaned


def host_of(url: str) -> str:
    return urllib.parse.urlparse(url).netloc.lower().removeprefix("www.")


def url_rank(url: str) -> int:
    host = host_of(url)
    lowered = url.lower()
    if any(token in host for token in ("greenhouse.io", "lever.co", "ashbyhq.com", "smartrecruiters.com")):
        return 0
    if "myworkday" in host or "oraclecloud.com" in host or "eightfold.ai" in host:
        return 1
    if any(token in lowered for token in ("/job", "/jobs/", "career", "intern")):
        return 2
    if "jobright.ai" in host:
        return 3
    if any(token in host for token in SHORTENERS) or "simplify.jobs" in host:
        return 5
    return 4


def pick_apply_url(urls: list[str]) -> str:
    ranked = sorted(set(urls), key=lambda item: (url_rank(item), len(item)))
    return ranked[0] if ranked else ""


def canonical_id(url: str) -> str:
    if not url:
        return ""
    parsed = urllib.parse.urlparse(url)
    gh_jid = (urllib.parse.parse_qs(parsed.query).get("gh_jid") or [""])[0]
    if gh_jid.isdigit():
        return "gh:" + gh_jid
    host = parsed.netloc.lower().removeprefix("www.")
    path = parsed.path
    if "greenhouse.io" in host:
        match = re.search(r"/jobs/(\d+)", path)
        if match:
            return "gh:" + match.group(1)
    if "lever.co" in host:
        parts = [part for part in path.split("/") if part]
        if len(parts) >= 2:
            return f"lever:{parts[0].lower()}:{parts[1]}"
    if "ashbyhq.com" in host:
        parts = [part for part in path.split("/") if part]
        if len(parts) >= 2:
            return "ashby:" + parts[1]
    if "smartrecruiters.com" in host:
        parts = [part for part in path.split("/") if part]
        if len(parts) >= 2:
            return f"sr:{parts[0].lower()}:{parts[1].split('-')[0]}"
    if "myworkdayjobs.com" in host or "myworkdaysite.com" in host:
        tail = path.split("/job/")[-1].split("?")[0].lower()
        return f"wd:{host}:{tail}"
    if "jobright.ai" in host and "/jobs/info/" in path:
        return "jr:" + path.rstrip("/").split("/")[-1]
    if "oraclecloud.com" in host:
        match = re.search(r"/job/(\d+)", path)
        if match:
            return f"oracle:{host}:{match.group(1)}"
    match = re.search(r"/jobs?/(\d{7,})/?$", path)
    if match:
        return "gh:" + match.group(1)
    return host + path.rstrip("/").lower()


def is_shortener(url: str) -> bool:
    return any(token in host_of(url) for token in SHORTENERS)


def category_from_heading(heading: str) -> str | None:
    text = heading.lower()
    if "product management" in text or "product manager" in text:
        return "Product Management"
    if "business analyst" in text:
        return "Business Analyst"
    if "data science" in text or "machine learning" in text or "ai &" in text:
        return "Data Science, AI & ML"
    if "quant" in text:
        return "Quantitative Finance"
    if "hardware" in text:
        return "Hardware"
    if "software" in text:
        return "Software Engineering"
    return None


def infer_category(role: str, current: str | None) -> str:
    if current and current != "Other":
        return current
    text = f" {role.lower()} "
    checks = [
        ("Product Management", ("product manag", "product intern", "associate product", " apm ")),
        ("Business Analyst", ("business analyst", "business analytics", "business systems analyst")),
        ("Data Science, AI & ML", ("data scien", "machine learning", "artificial intelligence", "data analyst", " ai ")),
        ("Quantitative Finance", ("quant", "trading intern", "trader intern")),
        ("Hardware", ("hardware", "electrical", "fpga", "asic", "firmware")),
        ("Software Engineering", ("software", "developer", "engineer", "full stack", "frontend", "backend")),
    ]
    for name, needles in checks:
        if any(needle in text for needle in needles):
            return name
    return current or "Other"


def parse_posted(value: str, today: date = TODAY) -> str | None:
    value = cell_text(value).strip()
    if not value or value in {"-", "—", "n/a"}:
        return None
    match = re.fullmatch(r"(\d+)\s*d", value, re.I)
    if match:
        return (today - timedelta(days=int(match.group(1)))).isoformat()
    match = re.fullmatch(r"(\d+)\s*mo", value, re.I)
    if match:
        return (today - timedelta(days=30 * int(match.group(1)))).isoformat()
    match = re.fullmatch(r"(\d{4})-(\d{2})-(\d{2})", value)
    if match:
        return value
    match = re.fullmatch(r"([A-Za-z]{3,9})\s+(\d{1,2})", value)
    if match and match.group(1).lower()[:3] in MONTHS:
        month = MONTHS[match.group(1).lower()[:3]]
        day = int(match.group(2))
        try:
            posted = date(today.year, month, day)
        except ValueError:
            return None
        if posted > today + timedelta(days=2):
            posted = date(today.year - 1, month, day)
        return posted.isoformat()
    return None


def us_state_codes(location: str) -> list[str]:
    return [match.group(1).upper() for match in US_ABBR.finditer(f" {location} ")]


def is_us_location(location: str) -> bool:
    if not location:
        return False
    loc = re.sub(r"\s+", " ", location).strip()
    low = loc.lower()
    if low in {"-", "n/a", "na", "tbd"}:
        return False
    if "united states" in low or re.search(r"\busa\b", low) or "u.s." in low or "multiple us" in low:
        return True
    provinces = CANADA_PROV.search(f" {loc} ")
    states = us_state_codes(loc)
    if provinces:
        real_states = [code for code in states if code != "CA"]
        return bool(real_states)
    foreign = FOREIGN.search(low)
    if foreign and not states and not US_NAME.search(low):
        return False
    if states or US_NAME.search(low):
        return True
    if re.search(r"(?:,|\s)us$", low):
        return True
    if US_CITY.search(low) and not foreign:
        return True
    if "multiple location" in low and not foreign:
        return True
    if low == "remote" or low.startswith("remote"):
        return foreign is None
    return False


def header_map(cells: list[str]) -> dict[str, int]:
    mapping: dict[str, int] = {}
    for index, cell in enumerate(cells):
        name = cell_text(cell).lower()
        if "company" in name:
            mapping["company"] = index
        elif "title" in name or name == "role" or "role" in name:
            mapping["role"] = index
        elif "location" in name:
            mapping["location"] = index
        elif "apply" in name or "application" in name or name == "link" or "link" in name:
            mapping["apply"] = index
        elif "date" in name or "age" in name or "posted" in name or "added" in name:
            mapping["date"] = index
        elif "work" in name or "model" in name:
            mapping["model"] = index
    return mapping


def split_markdown_row(line: str) -> list[str] | None:
    if not line.startswith("|"):
        return None
    if re.match(r"^\|\s*-+", line):
        return None
    return [part.strip() for part in line.strip().strip("|").split("|")]


def row_to_role(cells: list[str], mapping: dict[str, int], source: str, category: str, last_company: str) -> dict | None:
    def take(key: str) -> str:
        index = mapping.get(key)
        if index is None or index >= len(cells):
            return ""
        return cells[index]

    raw = " ".join(cells)
    company = clean_label(cell_text(take("company")))
    if company in {"", "↳"} or company.startswith("↳"):
        company = last_company
    role = clean_label(cell_text(take("role")))
    if not company or not role or role.lower() in {"role", "job title"}:
        return None
    location = cell_text(take("location"))
    location = re.sub(r"\s*/\s*", " / ", location)
    location = re.sub(r"\s+", " ", location).strip(" /")
    urls = extract_urls(raw)
    company_urls = extract_urls(take("company"))
    return {
        "company": company,
        "role": role,
        "location": location,
        "category": infer_category(role, category),
        "applyUrl": pick_apply_url(urls),
        "companyUrl": company_urls[0] if company_urls else "",
        "posted": parse_posted(take("date")),
        "workModel": cell_text(take("model")) or None,
        "sources": [source],
        "noSponsorship": "🛂" in raw,
        "citizenship": "🇺🇸" in raw,
        "closed": "🔒" in raw,
    }


def parse_markdown_tables(text: str, source: str, default_category: str | None) -> list[dict]:
    roles: list[dict] = []
    category = default_category or "Other"
    last_company = ""
    lines = text.splitlines()
    index = 0
    while index < len(lines):
        line = lines[index]
        heading = category_from_heading(line[3:]) if line.startswith("## ") else None
        if heading:
            category = heading
            index += 1
            continue
        if (
            line.startswith("|")
            and index + 1 < len(lines)
            and re.match(r"^\|\s*-+", lines[index + 1] or "")
        ):
            header = split_markdown_row(line) or []
            mapping = header_map(header)
            index += 2
            if "company" not in mapping:
                index += 0
            while index < len(lines) and lines[index].startswith("|"):
                cells = split_markdown_row(lines[index])
                index += 1
                if not cells or "company" not in mapping:
                    continue
                role = row_to_role(cells, mapping, source, category, last_company)
                if role:
                    last_company = role["company"]
                    roles.append(role)
            continue
        index += 1
    return roles


def parse_html_tables(text: str, source: str, default_category: str | None) -> list[dict]:
    roles: list[dict] = []
    headings = list(re.finditer(r"^##\s+(.+)$", text, re.M))
    last_company = ""
    for table in re.finditer(r"<table\b[^>]*>(.*?)</table>", text, re.S | re.I):
        category = default_category or "Other"
        for heading in headings:
            if heading.start() >= table.start():
                break
            mapped = category_from_heading(heading.group(1))
            if mapped:
                category = mapped
        body = table.group(1)
        parsed_rows = []
        for row in re.findall(r"<tr\b[^>]*>(.*?)</tr>", body, re.S | re.I):
            cells = re.findall(r"<t[dh]\b[^>]*>(.*?)</t[dh]>", row, re.S | re.I)
            if cells:
                parsed_rows.append(cells)
        if len(parsed_rows) < 2:
            continue
        mapping = header_map(parsed_rows[0])
        if "company" not in mapping:
            continue
        for cells in parsed_rows[1:]:
            role = row_to_role(cells, mapping, source, category, last_company)
            if role:
                last_company = role["company"]
                roles.append(role)
    return roles


def parse_document(text: str, source: str, default_category: str | None = None) -> list[dict]:
    return parse_html_tables(text, source, default_category) + parse_markdown_tables(
        text, source, default_category
    )


def application_prompt(sentence: str) -> bool:
    """Application questions are not the employer's answer."""
    if re.search(
        r"\b(if you answered|please confirm|please select|must select|select yes)\b",
        sentence,
        re.I,
    ):
        return True
    if re.search(r'"label"\s*:|input_text|"type"\s*:\s*"input', sentence, re.I):
        return True
    return bool(
        re.search(
            r"\b(will|do) you\b.{0,80}\b(require|need)\b.{0,50}\b(sponsor|visa|cpt|opt|authorization)\b",
            sentence,
            re.I,
        )
    )


def cpt_is_real(sentence: str) -> bool:
    if application_prompt(sentence) or sponsor_is_negative(sentence) or auth_is_negative(sentence):
        return False
    if re.search(r"\bnot\b.{0,24}\b(eligible|welcome|accepted|encouraged)", sentence, re.I):
        return False
    matches = list(CPT_PHRASE.finditer(sentence)) + list(CPT_ACRONYM.finditer(sentence))
    matches += list(re.finditer(r"\bF-1\b", sentence))
    for match in matches:
        window = sentence[max(0, match.start() - 90) : match.end() + 90]
        training = re.search(r"pre-?training|post-?training|\bSFT\b|\bRLHF\b", window, re.I)
        if training and not CPT_PHRASE.search(window):
            continue
        spelled_out = bool(CPT_PHRASE.search(window))
        if not spelled_out and not CPT_CONTEXT.search(window):
            continue
        if re.search(
            r"\b(welcome|eligible|accepted|encouraged|authorized|using|allowed)\b",
            window,
            re.I,
        ):
            return True
    return False


def sponsor_is_negative(sentence: str) -> bool:
    if NEG_SPONSOR.search(sentence):
        return True
    if re.search(
        r"(?:\bnot\b|\bno\b|don't|do not|cannot|can't|unable|won't|will not|ineligible|no longer).{0,120}\bsponsor",
        sentence,
        re.I,
    ):
        return True
    return bool(
        re.search(
            r"\bsponsor\w*.{0,140}\b(not eligible|are not|is not|will not|ineligible|not available|unavailable)",
            sentence,
            re.I,
        )
    )


def cpt_is_welcome(sentence: str) -> bool:
    if re.search(r"\bnot\b.{0,24}\b(eligible|welcome|accepted|encouraged)", sentence, re.I):
        return False
    return bool(
        re.search(
            r"\b(cpt|opt|f-1)\b.{0,50}\b(are |is )?(welcome|eligible|accepted|encouraged)"
            r"|\b(welcome|eligible|accepted|encouraged).{0,40}\b(cpt|opt|f-1)\b",
            sentence,
            re.I,
        )
    )


def auth_is_negative(sentence: str) -> bool:
    if NEG_CPT.search(sentence):
        return True
    if not re.search(r"\b(cpt|opt|f-1|h-1b|visa|sponsor)", sentence, re.I):
        return False
    if not re.search(
        r"will not be considered|not be considered|not eligible|ineligible|restricted forms|"
        r"unable to (support|sponsor)|do(?:es)? not (?:participate|accept|support|sponsor)",
        sentence,
        re.I,
    ):
        return False
    return not cpt_is_welcome(sentence)


def positive_kind(sentence: str) -> str | None:
    if (
        application_prompt(sentence)
        or j1_only(sentence)
        or sponsor_is_negative(sentence)
        or auth_is_negative(sentence)
    ):
        return None
    if POS_SPONSOR.search(sentence):
        return "sponsorship"
    if cpt_is_real(sentence):
        return "cpt_opt"
    if POS_INTL.search(sentence):
        return "international"
    return None


def evidence_window(sentence: str, limit: int = 280) -> str:
    sentence = re.sub(r"\s+", " ", sentence).strip()
    if len(sentence) <= limit:
        return sentence
    match = re.search(r"sponsor|cpt|opt|f-1|visa", sentence, re.I)
    if not match:
        return sentence[: limit - 1].rstrip() + "…"
    start = max(0, match.start() - 90)
    end = min(len(sentence), match.end() + 160)
    snippet = sentence[start:end].strip()
    if start:
        snippet = "…" + snippet
    if end < len(sentence):
        snippet += "…"
    return snippet


def sentences(text: str) -> list[str]:
    text = re.sub(r"(?i)\bU\.S\.(?:A\.)?", "US", text)
    parts = re.split(r"[\n\r]+|(?<=[.!?])\s+", text)
    cleaned = []
    for part in parts:
        pieces = re.split(r"[;•●|]", part) if len(part) > 360 else [part]
        for piece in pieces:
            sentence = re.sub(r"\s+", " ", piece).strip(" -")
            if len(sentence) >= 8:
                cleaned.append(sentence)
    return cleaned


def j1_only(sentence: str) -> bool:
    if not re.search(r"\bJ-1\b", sentence, re.I):
        return False
    return not re.search(r"\b(F-1|H-?1B|CPT|OPT)\b", sentence, re.I)


def normalize_visa_labels(text: str) -> str:
    """Turn career-site fields such as 'Is Sponsorship Available? No' into sentences."""

    def repl(match: re.Match[str]) -> str:
        if match.group(1).lower() == "no":
            return "Visa sponsorship is not available."
        return "Visa sponsorship is available."

    return re.sub(
        r"is sponsorship available\?\s*(?:\|\s*)?(yes|no)\b",
        repl,
        text,
        flags=re.I,
    )


def classify_text(text: str) -> tuple[str, str]:
    """Return acceptance kind and the sentence that decided it.

    kind is sponsorship, cpt_opt, international, no, or unknown.
    """
    if not text:
        return "unknown", ""
    text = normalize_visa_labels(text)
    positives: list[tuple[str, str]] = []
    negatives: list[tuple[str, str]] = []
    for sentence in sentences(text):
        if BOILER.search(sentence) or application_prompt(sentence) or j1_only(sentence):
            continue
        if re.search(r"\bis sponsorship available\??\s*$", sentence, re.I):
            continue
        if NEG_CITIZEN.search(sentence) and not CITIZEN_WAIVER.search(sentence):
            negatives.append(("citizen", sentence))
            continue
        if NEG_CLEARANCE.search(sentence):
            negatives.append(("clearance", sentence))
            continue
        if sponsor_is_negative(sentence) or auth_is_negative(sentence):
            if cpt_is_welcome(sentence) and not sponsor_is_negative(sentence):
                positives.append(("cpt_opt", sentence))
            else:
                negatives.append(("sponsorship_no", sentence))
            continue
        kind = positive_kind(sentence)
        if kind:
            positives.append((kind, sentence))

    def first(kind: str, pool: list[tuple[str, str]]) -> str:
        return next(sentence for name, sentence in pool if name == kind)

    if any(name == "citizen" for name, _ in negatives):
        return "no", evidence_window(first("citizen", negatives))
    if any(name == "clearance" for name, _ in negatives):
        return "no", evidence_window(first("clearance", negatives))
    if any(name == "sponsorship" for name, _ in positives) and not any(
        name == "sponsorship_no" for name, _ in negatives
    ):
        return "sponsorship", evidence_window(first("sponsorship", positives))
    if any(name == "cpt_opt" for name, _ in positives) and not any(
        name == "cpt_no" for name, _ in negatives
    ):
        return "cpt_opt", evidence_window(first("cpt_opt", positives))
    if any(name == "international" for name, _ in positives) and not any(
        name == "sponsorship_no" for name, _ in negatives
    ):
        return "international", evidence_window(first("international", positives))
    if negatives:
        return "no", evidence_window(negatives[0][1])
    if positives:
        kind, sentence = positives[0]
        return kind, evidence_window(sentence)
    return "unknown", ""


def looks_like_description(text: str) -> bool:
    if len(text) < 350:
        return False
    lowered = text.lower()
    return any(word in lowered for word in ("responsib", "qualif", "require", "intern", "about the", "what you"))


def greenhouse_ids(url: str) -> tuple[str, str] | None:
    match = re.search(r"greenhouse\.io/([^/?#]+)/jobs/(\d+)", url)
    if not match or match.group(1) in {"embed", "jobs"}:
        return None
    return match.group(1), match.group(2)


def lever_ids(url: str) -> tuple[str, str] | None:
    match = re.search(r"jobs\.lever\.co/([^/?#]+)/([0-9a-f-]{8,})", url, re.I)
    if not match:
        return None
    return match.group(1), match.group(2)


def ashby_ids(url: str) -> tuple[str, str] | None:
    match = re.search(r"jobs\.ashbyhq\.com/([^/?#]+)/([0-9a-f-]{8,})", url, re.I)
    if not match:
        return None
    return match.group(1), match.group(2)


def smartrecruiters_ids(url: str) -> tuple[str, str] | None:
    match = re.search(r"jobs\.smartrecruiters\.com/([^/?#]+)/(\d+)", url, re.I)
    if not match:
        return None
    return match.group(1), match.group(2)


def oracle_text(payload: dict) -> str:
    items = payload.get("items") or []
    if not items:
        return ""
    item = items[0]
    chunks = [
        item.get("ExternalDescriptionStr") or "",
        item.get("ShortDescriptionStr") or "",
        item.get("ExternalResponsibilitiesStr") or "",
        item.get("ExternalQualificationsStr") or "",
        item.get("CorporateDescriptionStr") or "",
    ]
    return html_to_text("\n".join(chunks))


def oracle_ids(url: str) -> tuple[str, str, str] | None:
    parsed = urllib.parse.urlparse(url)
    if "oraclecloud.com" not in parsed.netloc:
        return None
    site = re.search(r"/sites/([^/]+)/job/(\d+)", parsed.path)
    if not site:
        return None
    return parsed.netloc, site.group(1), site.group(2)


def workday_parts(url: str) -> tuple[str, str, str, str] | None:
    parsed = urllib.parse.urlparse(url)
    host = parsed.netloc.lower()
    if "myworkdayjobs.com" not in host and "myworkdaysite.com" not in host:
        return None
    parts = [part for part in parsed.path.split("/") if part]
    while parts and re.fullmatch(r"[a-z]{2}-[a-z]{2}", parts[0], re.I):
        parts.pop(0)
    if "job" not in parts:
        return None
    job_at = parts.index("job")
    if job_at < 1:
        return None
    site = parts[job_at - 1]
    job_path = urllib.parse.unquote("/".join(parts[job_at + 1 :]))
    if not site or not job_path or site.lower() in {"en-us", "job"}:
        return None
    if "myworkdaysite.com" in host and parts[0] == "recruiting" and job_at >= 3:
        tenant = parts[1]
    else:
        tenant = host.split(".")[0]
    return host, tenant, site, job_path


def clip(text: str, limit: int = 500) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= limit:
        return text
    return text[: limit - 1].rstrip() + "…"


def fetch_text_uncached(url: str) -> tuple[str, str, bool]:
    """Return final_url, plain text, and whether a real description was read."""
    gh = greenhouse_ids(url)
    if gh:
        board, job_id = gh
        api = f"https://boards-api.greenhouse.io/v1/boards/{board}/jobs/{job_id}"
        final, status, _, body = request(api, headers={"Accept": "application/json"})
        if status == 200:
            try:
                payload = json.loads(body.decode("utf-8", "replace"))
                text = html_to_text(payload.get("content") or "")
                official = payload.get("absolute_url") or url
                return official, text, len(text) > 180
            except json.JSONDecodeError:
                pass
        return url, "", False

    lever = lever_ids(url)
    if lever:
        company, posting_id = lever
        api = f"https://api.lever.co/v0/postings/{company}/{posting_id}"
        _, status, _, body = request(api, headers={"Accept": "application/json"})
        if status == 200:
            try:
                payload = json.loads(body.decode("utf-8", "replace"))
                chunks = [
                    payload.get("descriptionPlain") or "",
                    payload.get("openingPlain") or "",
                    payload.get("additionalPlain") or "",
                ]
                for item in payload.get("lists") or []:
                    chunks.append(item.get("text") or "")
                    chunks.append(html_to_text(item.get("content") or ""))
                text = html_to_text("\n".join(chunks))
                return payload.get("hostedUrl") or url, text, len(text) > 180
            except json.JSONDecodeError:
                pass
        return url, "", False

    ashby = ashby_ids(url)
    if ashby:
        board, job_id = ashby
        api = f"https://api.ashbyhq.com/posting-api/job-board/{board}"
        _, status, _, body = request(
            api, timeout=60, headers={"Accept": "application/json"}, max_bytes=12_000_000
        )
        if status == 200:
            try:
                payload = json.loads(body.decode("utf-8", "replace"))
                for job in payload.get("jobs") or []:
                    if str(job.get("id")) == job_id:
                        text = html_to_text(job.get("descriptionHtml") or job.get("descriptionPlain") or "")
                        return job.get("jobUrl") or url, text, len(text) > 180
            except json.JSONDecodeError:
                pass
        return url, "", False

    smart = smartrecruiters_ids(url)
    if smart:
        company, posting_id = smart
        api = f"https://api.smartrecruiters.com/v1/companies/{company}/postings/{posting_id}"
        _, status, _, body = request(api, headers={"Accept": "application/json"})
        if status == 200:
            try:
                payload = json.loads(body.decode("utf-8", "replace"))
                sections = (payload.get("jobAd") or {}).get("sections") or {}
                chunks = []
                for section in sections.values():
                    if isinstance(section, dict):
                        chunks.append(section.get("text") or "")
                text = html_to_text("\n".join(chunks))
                return payload.get("postingUrl") or url, text, len(text) > 180
            except json.JSONDecodeError:
                pass
        return url, "", False

    oracle = oracle_ids(url)
    if oracle:
        host, site, job_id = oracle
        api = (
            f"https://{host}/hcmRestApi/resources/latest/recruitingCEJobRequisitionDetails"
            f"?onlyData=true&expand=all&finder=ById;Id={job_id},siteNumber={site}"
        )
        _, status, _, body = request(api, headers={"Accept": "application/json"})
        if status == 200:
            try:
                payload = json.loads(body.decode("utf-8", "replace"))
                text = oracle_text(payload)
                return url, text, len(text) > 180
            except json.JSONDecodeError:
                pass
        return url, "", False

    workday = workday_parts(url)
    if workday:
        host, tenant, site, job_path = workday
        api = f"https://{host}/wday/cxs/{tenant}/{site}/job/{urllib.parse.quote(job_path, safe='/-._~()')}"
        _, status, _, body = request(api, timeout=30, headers={"Accept": "application/json"})
        if status == 200:
            try:
                payload = json.loads(body.decode("utf-8", "replace"))
                info = payload.get("jobPostingInfo") or {}
                text = html_to_text(info.get("jobDescription") or "")
                official = info.get("externalUrl") or url
                return official, text, len(text) > 180
            except json.JSONDecodeError:
                pass
        return url, "", False

    final, status, headers, body = request(url, timeout=25)
    if status != 200:
        return final or url, "", False
    content_type = (headers.get("Content-Type") or headers.get("content-type") or "").lower()
    decoded = body.decode("utf-8", "replace")
    if "json" in content_type:
        text = html_to_text(decoded)
        return final, text, looks_like_description(text)
    text = html_to_text(decoded)
    return final, text, looks_like_description(text)


def cached_job(cache: Cache, key: str, fallback: str) -> tuple[str, str, bool] | None:
    cached = cache.get(key)
    if not cached:
        return None
    return cached.get("final") or fallback, cached.get("text") or "", bool(cached.get("read"))


def remember_job(cache: Cache, key: str, final: str, text: str, read: bool) -> None:
    cache.set(key, {"final": final, "text": text[:60000], "read": read})


def prime_ats(urls: list[str], cache: Cache) -> None:
    """Read each Lever and Ashby board once, then reuse it per job.

    Greenhouse boards with full descriptions are too large to download whole.
    Those jobs are read one at a time.
    """
    levers: dict[str, set[str]] = {}
    ashby: dict[str, set[str]] = {}
    for url in urls:
        lever = lever_ids(url)
        if lever and cache.get(f"leverjob:{lever[0]}:{lever[1]}") is None:
            levers.setdefault(lever[0], set()).add(lever[1])
        board = ashby_ids(url)
        if board and cache.get("ashbyjob:" + board[1]) is None:
            ashby.setdefault(board[0], set()).add(board[1])

    def pull_lever(company: str) -> int:
        api = f"https://api.lever.co/v0/postings/{company}?mode=json"
        _, status, _, body = request(api, timeout=60, headers={"Accept": "application/json"})
        if status != 200:
            return 0
        try:
            payload = json.loads(body.decode("utf-8", "replace"))
        except json.JSONDecodeError:
            return 0
        if not isinstance(payload, list):
            return 0
        for posting in payload:
            posting_id = str(posting.get("id") or "")
            chunks = [
                posting.get("descriptionPlain") or "",
                posting.get("openingPlain") or "",
                posting.get("additionalPlain") or "",
            ]
            for item in posting.get("lists") or []:
                chunks.append(item.get("text") or "")
                chunks.append(html_to_text(item.get("content") or ""))
            text = html_to_text("\n".join(chunks))
            remember_job(
                cache,
                f"leverjob:{company}:{posting_id}",
                posting.get("hostedUrl") or "",
                text,
                len(text) > 180,
            )
        return len(payload)

    def pull_ashby(board: str) -> int:
        api = f"https://api.ashbyhq.com/posting-api/job-board/{board}"
        _, status, _, body = request(
            api, timeout=60, headers={"Accept": "application/json"}, max_bytes=12_000_000
        )
        if status != 200:
            return 0
        try:
            payload = json.loads(body.decode("utf-8", "replace"))
        except json.JSONDecodeError:
            return 0
        jobs = payload.get("jobs") or []
        for job in jobs:
            text = html_to_text(job.get("descriptionHtml") or job.get("descriptionPlain") or "")
            remember_job(
                cache,
                "ashbyjob:" + str(job.get("id")),
                job.get("jobUrl") or "",
                text,
                len(text) > 180,
            )
        return len(jobs)

    # Greenhouse job lists with content are tens of megabytes and get cut off.
    # Each Greenhouse job is fetched on its own below. Ashby has no per-job URL.
    tasks = [("lever", company, pull_lever) for company in levers]
    tasks += [("ashby", board, pull_ashby) for board in ashby]
    if not tasks:
        return
    log(f"prime {len(levers)} lever, {len(ashby)} ashby boards")
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = {pool.submit(func, key): (kind, key) for kind, key, func in tasks}
        for future in as_completed(futures):
            kind, key = futures[future]
            try:
                count = future.result()
            except Exception as error:  # noqa: BLE001
                log(f"  {kind} {key} failed {error}")
                continue
            if count == 0:
                log(f"  {kind} {key} returned no jobs")


def fetch_official(url: str, cache: Cache) -> tuple[str, str, bool]:
    gh = greenhouse_ids(url)
    if gh:
        hit = cached_job(cache, "ghjob:" + gh[1], url)
        if hit and hit[2]:
            return hit
    lever = lever_ids(url)
    if lever:
        hit = cached_job(cache, f"leverjob:{lever[0]}:{lever[1]}", url)
        if hit and hit[2]:
            return hit
    board = ashby_ids(url)
    if board:
        hit = cached_job(cache, "ashbyjob:" + board[1], url)
        if hit and hit[2]:
            return hit
    cached = cache.get("page:" + url)
    # A failed read is retried. Workday shells and truncated Ashby boards used to stick.
    if (
        cached
        and cached.get("read")
        and "ExternalDescriptionStr" not in (cached.get("text") or "")
    ):
        return cached.get("final") or url, cached.get("text") or "", True
    final, text, read = fetch_text_uncached(url)
    cache.set("page:" + url, {"final": final, "text": text[:60000], "read": read})
    return final, text, read


def resolve_url(url: str, cache: Cache) -> str:
    if not url or not is_shortener(url):
        return url
    cached = cache.get("redir:" + url)
    if cached and cached.get("final"):
        return cached["final"]
    final, status, _, _ = request(url, timeout=20)
    if status and final:
        cache.set("redir:" + url, {"final": final, "text": "", "read": False})
        return final
    return url


def company_key(name: str) -> str:
    text = name.lower().replace("&", " and ")
    text = re.sub(r"[^a-z0-9]+", " ", text)
    text = re.sub(r"\b(inc|llc|ltd|corp|co|company|corporation|plc|gmbh|limited)\b", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def better_url(current: str, candidate: str) -> str:
    if not current:
        return candidate
    if not candidate:
        return current
    return candidate if url_rank(candidate) < url_rank(current) else current


def merge_key(role: dict) -> str:
    def norm(value: str) -> str:
        return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()

    return "|".join([company_key(role["company"]), norm(role["role"]), norm(role.get("location") or "")])


def posting_id(url: str) -> str:
    cid = canonical_id(url)
    if cid.startswith(("gh:", "lever:", "ashby:", "wd:", "sr:", "oracle:", "jr:")):
        return cid
    return ""


def absorb_role(current: dict, role: dict) -> None:
    current["applyUrl"] = better_url(current.get("applyUrl") or "", role.get("applyUrl") or "")
    if url_rank(role.get("companyUrl") or "z") < url_rank(current.get("companyUrl") or "z"):
        current["companyUrl"] = role.get("companyUrl") or current.get("companyUrl")
    for source in role.get("sources") or []:
        if source not in current["sources"]:
            current["sources"].append(source)
    current["noSponsorship"] = current["noSponsorship"] or role["noSponsorship"]
    current["citizenship"] = current["citizenship"] or role["citizenship"]
    current["closed"] = current["closed"] or role["closed"]
    if role.get("posted") and (not current.get("posted") or role["posted"] > current["posted"]):
        current["posted"] = role["posted"]
    if current["category"] == "Other" and role["category"] != "Other":
        current["category"] = role["category"]
    if not current.get("workModel") and role.get("workModel"):
        current["workModel"] = role["workModel"]
    if len(role["role"]) > len(current["role"]):
        current["role"] = role["role"]
    if len(role.get("location") or "") > len(current.get("location") or ""):
        current["location"] = role["location"]


def merge_roles(roles: list[dict]) -> list[dict]:
    merged: dict[str, dict] = {}
    order: list[str] = []
    for role in roles:
        apply_url = role.get("applyUrl") or ""
        key = merge_key(role) or canonical_id(apply_url)
        current = merged.get(key)
        if current is None:
            merged[key] = {
                **role,
                "sources": list(role["sources"]),
                "id": key,
            }
            order.append(key)
            continue
        absorb_role(current, role)

    collapsed: dict[str, dict] = {}
    collapsed_order: list[str] = []
    for role in (merged[key] for key in order):
        pid = posting_id(role.get("applyUrl") or "")
        key = pid or ("row:" + role["id"])
        current = collapsed.get(key)
        if current is None:
            if pid:
                role["id"] = pid
            collapsed[key] = role
            collapsed_order.append(key)
            continue
        absorb_role(current, role)
        if pid:
            current["id"] = pid
    return [collapsed[key] for key in collapsed_order]


def search_official(company: str, role: str, cache: Cache) -> str:
    query = f"{company} {role} internship"
    key = "ddg:" + query.lower()
    cached = cache.get(key)
    if cached:
        return cached.get("final") or ""
    url = "https://html.duckduckgo.com/html/?" + urllib.parse.urlencode({"q": query})
    _, status, _, body = request(url, timeout=20)
    found = ""
    if status == 200:
        decoded = body.decode("utf-8", "replace")
        links = [urllib.parse.unquote(item) for item in re.findall(r"uddg=([^&\"']+)", decoded)]
        preferred = []
        fallback = []
        for link in links:
            host = host_of(link)
            if any(skip in host for skip in ("duckduckgo", "jobright.ai", "google.", "youtube.")):
                continue
            if any(token in host for token in ("greenhouse.io", "lever.co", "ashbyhq.com", "smartrecruiters.com", "myworkday", "oraclecloud.com")):
                preferred.append(link)
            elif any(skip in host for skip in ("linkedin.com", "indeed.com", "glassdoor.", "ziprecruiter.")):
                continue
            elif any(token in link.lower() for token in ("career", "/job", "intern")):
                fallback.append(link)
        found = preferred[0] if preferred else (fallback[0] if fallback else "")
    cache.set(key, {"final": found, "text": "", "read": False})
    return found


def region_for(location: str) -> str:
    return "us" if is_us_location(location) else "other"


def decide(role: dict, text: str, read: bool) -> dict:
    kind, evidence = classify_text(text) if read else ("unknown", "")
    if kind == "no":
        acceptance = "rejected"
    elif kind in {"sponsorship", "cpt_opt", "international"}:
        acceptance = kind
    elif role.get("closed"):
        acceptance = "rejected"
    elif not read:
        acceptance = "unread"
    elif role.get("citizenship") or role.get("noSponsorship"):
        acceptance = "rejected"
    else:
        acceptance = "silent"
    if (role.get("citizenship") or role.get("noSponsorship")) and acceptance not in {
        "sponsorship",
        "cpt_opt",
        "international",
    }:
        acceptance = "rejected"
    if role.get("closed"):
        acceptance = "rejected"
    return {
        "acceptance": acceptance,
        "evidence": clip(evidence) if acceptance in {"sponsorship", "cpt_opt", "international", "rejected"} else "",
        "read": read,
        "kind": kind,
    }


def load_sources() -> list[dict]:
    roles: list[dict] = []
    for source in SOURCES:
        log(f"fetch list {source['id']}")
        _, status, _, body = request(source["url"], timeout=60)
        if status != 200:
            log(f"  failed {source['id']} status {status}")
            continue
        text = body.decode("utf-8", "replace")
        parsed = parse_document(text, source["id"], source.get("category"))
        log(f"  {source['id']}: {len(parsed)} rows")
        roles.extend(parsed)
    return roles


def resolve_shorteners(roles: list[dict], cache: Cache) -> None:
    log(f"resolve {sum(1 for role in roles if is_shortener(role.get('applyUrl') or ''))} shorteners")
    with ThreadPoolExecutor(max_workers=12) as pool:
        futures = {
            pool.submit(resolve_url, role.get("applyUrl") or "", cache): role
            for role in roles
            if is_shortener(role.get("applyUrl") or "")
        }
        for future in as_completed(futures):
            role = futures[future]
            try:
                resolved = future.result()
            except Exception as error:  # noqa: BLE001
                log(f"redirect failed {error}")
                continue
            if resolved:
                role["applyUrl"] = resolved


def enrich(roles: list[dict], cache: Cache, limit: int | None = None) -> list[dict]:
    closed = []
    us_roles = []
    other_roles = []
    for role in roles:
        if role.get("closed"):
            role["decision"] = decide(role, "", False)
            role["decision"]["acceptance"] = "rejected"
            closed.append(role)
            continue
        if region_for(role.get("location") or "") == "us":
            us_roles.append(role)
        else:
            other_roles.append(role)
    if limit is not None:
        us_roles = us_roles[:limit]
        other_roles = other_roles[:limit]

    resolve_shorteners(us_roles + other_roles, cache)
    unique = merge_roles(us_roles)
    other = merge_roles(other_roles)
    for role in other:
        role["officialUrl"] = role.get("applyUrl") or ""
        role["decision"] = {
            "acceptance": "listed",
            "evidence": "",
            "read": False,
            "kind": "unknown",
        }
    prime_ats([role.get("applyUrl") or "" for role in unique], cache)
    log(f"read official pages for {len(unique)} US roles")
    with ThreadPoolExecutor(max_workers=10) as pool:
        futures = {
            pool.submit(fetch_official, role.get("applyUrl") or "", cache): role
            for role in unique
            if role.get("applyUrl")
        }
        done = 0
        for future in as_completed(futures):
            role = futures[future]
            done += 1
            try:
                final, text, read = future.result()
            except Exception as error:  # noqa: BLE001
                log(f"read failed {error}")
                final, text, read = role.get("applyUrl") or "", "", False
            role["officialUrl"] = final or role.get("applyUrl")
            role["decision"] = decide(role, text, read)
            role["_text_kind"] = role["decision"]["kind"]
            if done % 50 == 0:
                log(f"  read {done}/{len(futures)}")

    for role in unique:
        if "decision" not in role:
            role["officialUrl"] = role.get("applyUrl") or ""
            role["decision"] = decide(role, "", False)

    # Lists that only link to Jobright still need the employer's own posting.
    pending = [
        role
        for role in unique
        if role.get("decision", {}).get("acceptance") == "unread"
        and "jobright.ai" in host_of(role.get("applyUrl") or "")
    ][:80]
    log(f"look up {len(pending)} Jobright roles on the company site")

    def lookup(role: dict) -> tuple[dict, str, str, bool]:
        official = search_official(role["company"], role["role"], cache)
        if not official:
            return role, "", "", False
        final, text, read = fetch_official(official, cache)
        return role, final or official, text, read

    with ThreadPoolExecutor(max_workers=4) as pool:
        futures = [pool.submit(lookup, role) for role in pending]
        finished = 0
        for future in as_completed(futures):
            finished += 1
            try:
                role, official, text, read = future.result()
            except Exception as error:  # noqa: BLE001
                log(f"  company-site lookup failed {error}")
                continue
            if read and official:
                role["officialUrl"] = official
                role["applyUrl"] = better_url(role.get("applyUrl") or "", official)
                role["decision"] = decide(role, text, True)
            if finished % 20 == 0:
                log(f"  searched {finished}/{len(pending)}")

    return closed + unique + other


def public_role(role: dict) -> dict | None:
    decision = role.get("decision") or {}
    acceptance = decision.get("acceptance")
    if acceptance == "rejected":
        return None
    item = {
        "id": role.get("id") or canonical_id(role.get("applyUrl") or ""),
        "company": role["company"],
        "role": role["role"],
        "location": role.get("location") or "",
        "category": role.get("category") or "Other",
        "applyUrl": role.get("officialUrl") or role.get("applyUrl") or "",
        "officialUrl": role.get("officialUrl") or role.get("applyUrl") or "",
        "companyUrl": role.get("companyUrl") or "",
        "posted": role.get("posted"),
        "workModel": role.get("workModel"),
        "sources": role.get("sources") or [],
        "region": region_for(role.get("location") or ""),
        "acceptance": acceptance,
        "evidence": decision.get("evidence") or "",
        "checkedOfficial": bool(decision.get("read")),
    }
    if decision.get("evidenceRole"):
        item["evidenceRole"] = decision["evidenceRole"]
    if role.get("evidenceUrl"):
        item["evidenceUrl"] = role["evidenceUrl"]
    return item


def build(limit: int | None = None) -> dict:
    cache = Cache(CACHE_PATH)
    parsed = load_sources()
    merged_preview = merge_roles(parsed)
    log(f"parsed {len(parsed)} rows, {len(merged_preview)} unique before location filter")
    # Resolve and read inside enrich, which also merges the US subset.
    # Run enrich on the unmerged parsed rows so shorteners can be resolved first.
    enriched = enrich(parsed, cache, limit)
    cache.save()
    public = [item for item in (public_role(role) for role in enriched) if item]
    public.sort(key=lambda item: (item.get("posted") or "", item["company"]), reverse=True)
    counts: dict[str, int] = {}
    regions: dict[str, int] = {}
    for item in public:
        counts[item["acceptance"]] = counts.get(item["acceptance"], 0) + 1
        regions[item["region"]] = regions.get(item["region"], 0) + 1
    rejected = sum(
        1
        for role in enriched
        if (role.get("decision") or {}).get("acceptance") == "rejected" and not role.get("closed")
    )
    generated = datetime.now(ZoneInfo("America/Detroit")).isoformat(timespec="minutes")
    payload = {
        "generatedAt": generated,
        "timezone": "America/Detroit",
        "sources": [{"id": source["id"], "label": source["label"], "url": source["listing"]} for source in SOURCES],
        "stats": {
            "parsed": len(parsed),
            "uniqueBeforeFilter": len(merged_preview),
            "skippedClosed": rejected,
            "officialChecked": sum(1 for role in enriched if region_for(role.get("location") or "") == "us"),
            "rejected": rejected,
            "listed": len(public),
            "byAcceptance": counts,
            "byRegion": regions,
        },
        "roles": public,
    }
    return payload


def main() -> None:
    limit = None
    if "--limit" in sys.argv:
        limit = int(sys.argv[sys.argv.index("--limit") + 1])
    payload = build(limit)
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    temporary = OUT_PATH.with_suffix(".tmp")
    temporary.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    temporary.replace(OUT_PATH)
    stats = payload["stats"]
    log(
        "wrote "
        f"{OUT_PATH} listed={stats['listed']} rejected={stats['rejected']} "
        f"counts={stats['byAcceptance']}"
    )


if __name__ == "__main__":
    main()
