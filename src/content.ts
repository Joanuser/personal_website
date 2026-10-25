export type Locale = "en" | "zh";

export type Metric = {
  value: string;
  label: Record<Locale, string>;
  slug: string;
};

export type Section = {
  id: string;
  heading: Record<Locale, string>;
  body: Record<Locale, string>;
};

export type CaseStudy = {
  slug: string;
  index: string;
  lens: Record<Locale, string>;
  company: string;
  role: Record<Locale, string>;
  place: Record<Locale, string>;
  dates: string;
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
  metrics: { value: string; label: Record<Locale, string> }[];
  sections: Section[];
  study?: "market";
};

export type Role = {
  company: string;
  role: Record<Locale, string>;
  place: Record<Locale, string>;
  dates: string;
  caseSlug?: string;
  points: Record<Locale, string[]>;
};

export const person = {
  name: "Chih-Chi Huang",
  short: "Joan",
  email: "chihchi@umich.edu",
  phoneDisplay: "+1 (734) 646-3520",
  phoneHref: "+17346463520",
  location: { en: "Ann Arbor, Michigan", zh: "密西根州安娜堡" },
  linkedin: "https://www.linkedin.com/in/chihchi-h-b862a9136",
  github: "https://github.com/Joanuser",
};

export const proof: Metric[] = [
  {
    value: "−95%",
    slug: "apac-quotation",
    label: {
      en: "weekly Salesforce tickets within two months",
      zh: "兩個月內，每週 Salesforce 系統工單",
    },
  },
  {
    value: "−90%",
    slug: "pricing-catalog",
    label: {
      en: "inconsistent or incorrect catalog inputs",
      zh: "不一致或錯誤的報價目錄輸入",
    },
  },
  {
    value: "−80%",
    slug: "salesforce-adoption",
    label: {
      en: "onboarding time for new sales reps",
      zh: "新業務代表的到職上手時間",
    },
  },
];

export const cases: CaseStudy[] = [
  {
    slug: "apac-quotation",
    index: "01",
    lens: { en: "Launch quality", zh: "上線品質" },
    company: "Uber",
    role: {
      en: "Sales Operation Analyst",
      zh: "Sales Operation Analyst｜銷售營運分析師",
    },
    place: { en: "Taipei, Taiwan", zh: "台北" },
    dates: "Jul 2025 – May 2026",
    title: {
      en: "After launch, the quotation tool was still hard to use",
      zh: "功能上線之後，報價工具還是不好用",
    },
    summary: {
      en: "On Uber’s APAC Quotation Feature, I traced post-launch Salesforce tickets to their causes and ranked the fixes by frequency and business impact.",
      zh: "在 Uber 的 APAC Quotation Feature 上線後，我把 Salesforce 工單追到根因，並依發生頻率與業務影響排列修復順序。",
    },
    metrics: [
      {
        value: "−95%",
        label: {
          en: "weekly system tickets in two months",
          zh: "兩個月內的每週系統工單",
        },
      },
      {
        value: "−80%",
        label: {
          en: "time spent on system modifications",
          zh: "系統修改所花的時間",
        },
      },
      {
        value: "5 min",
        label: {
          en: "monthly readout for Sales and Operations",
          zh: "給 Sales 與 Operations 的每月摘要",
        },
      },
    ],
    sections: [
      {
        id: "situation",
        heading: { en: "Situation", zh: "情境" },
        body: {
          en: "During the APAC Quotation Feature rollout, people hit Salesforce problems after the feature had already launched. The visible signal was a stream of system tickets from teams trying to quote.",
          zh: "APAC Quotation Feature 上線之後，使用者在 Salesforce 裡遇到問題。看得到的訊號，是正在報價的團隊送出的一串系統工單。",
        },
      },
      {
        id: "decision",
        heading: { en: "Decision", zh: "決定" },
        body: {
          en: "I diagnosed the root causes of those post-launch issues. Tickets did not arrive with a priority, so I set a framework that ranked critical fixes by how often an issue appeared and how much it affected the business. Engineering work then followed that order.",
          zh: "我先診斷這些上線後問題的根因。工單本身沒有優先順序，所以我用問題出現的頻率，以及它對業務的影響，建立關鍵修復的排序，再依這個順序與工程團隊協調。",
        },
      },
      {
        id: "outcome",
        heading: { en: "Outcome", zh: "結果" },
        body: {
          en: "Targeted system improvements cut weekly system tickets by 95% within two months. Coordinating with engineering around that framework reduced overall system modification time by 80%. I also started a monthly user report for local Sales, Operations, and APAC Sales: a five-minute summary of what had been resolved, and whether people were adopting the new feature.",
          zh: "針對根因的系統改善，讓每週系統工單在兩個月內減少 95%。依這個框架與工程團隊協調後，整體系統修改時間減少 80%。我也為本地 Sales、Operations 與 APAC Sales 開始一份每月使用者報告，用五分鐘說明問題解決的進度，以及新功能的採用情況。",
        },
      },
    ],
  },
  {
    slug: "pricing-catalog",
    index: "02",
    lens: { en: "Workflow", zh: "工作流程" },
    company: "eCloudvalley",
    role: {
      en: "IT System Engineer",
      zh: "IT System Engineer｜資訊系統工程師",
    },
    place: { en: "Taipei, Taiwan", zh: "台北" },
    dates: "Jan 2025 – Jun 2025",
    title: {
      en: "Every team was typing the price catalog its own way",
      zh: "每個部門用自己的方式填報價目錄",
    },
    summary: {
      en: "I led a cross-departmental cleanup of pricing-catalog uploads, then adapted the architecture for departments whose quoting process had never been defined.",
      zh: "我帶跨部門把報價目錄的上傳方式標準化，並為報價流程還沒被定義的部門調整既有架構。",
    },
    metrics: [
      {
        value: ">90%",
        label: {
          en: "fewer inconsistent or incorrect inputs",
          zh: "不一致或錯誤的輸入減少",
        },
      },
      {
        value: "+75%",
        label: { en: "efficiency on the workflow", zh: "流程效率" },
      },
      {
        value: "3 wks",
        label: { en: "to onboard the new teams", zh: "新團隊完成導入" },
      },
    ],
    sections: [
      {
        id: "situation",
        heading: { en: "Situation", zh: "情境" },
        body: {
          en: "Pricing-catalog uploads were inefficient. Departments entered data differently, and inconsistent or incorrect rows were getting into the catalog. Other departments were joining with quoting needs that the current architecture did not describe.",
          zh: "報價目錄的上傳流程沒有效率。各部門的填法不同，不一致或錯誤的資料會進到目錄裡。還有一些新部門要接進來，他們的報價需求，既有架構並沒有寫清楚。",
        },
      },
      {
        id: "decision",
        heading: { en: "Decision", zh: "決定" },
        body: {
          en: "I led the cross-departmental work to standardize how the catalog was uploaded. For the departments with an undefined process, I clarified what was unique about their quoting, then adapted the existing architecture to those needs.",
          zh: "我主導跨部門，把目錄上傳的方式標準化。對流程尚未定義的部門，我先釐清他們報價時真正不同的需求，再調整他們要接上的既有架構。",
        },
      },
      {
        id: "outcome",
        heading: { en: "Outcome", zh: "結果" },
        body: {
          en: "Inconsistent or incorrect data input fell by over 90%. The new teams were onboarded in three weeks, and the workflow ran 75% more efficiently.",
          zh: "不一致或錯誤的資料輸入減少超過 90%。新團隊在三週內完成導入，流程效率提升 75%。",
        },
      },
    ],
  },
  {
    slug: "salesforce-adoption",
    index: "03",
    lens: { en: "Adoption", zh: "採用與上手" },
    company: "Mead Johnson Nutrition",
    role: {
      en: "Salesforce Effectiveness Assistant (Internship)",
      zh: "Salesforce Effectiveness Assistant｜實習",
    },
    place: { en: "Taipei, Taiwan", zh: "台北" },
    dates: "Jan 2022 – Aug 2022",
    title: {
      en: "Contracts stalled, and new reps could not learn the tool",
      zh: "合約卡在簽核，新人也學不會系統",
    },
    summary: {
      en: "I ran the contract-approval path end to end and wrote the manual that removed the early bottleneck for new sales reps in Salesforce.",
      zh: "我端到端管理合約核准流程，並寫了一份操作手冊，解開新業務代表在 Salesforce 早期採用時的卡點。",
    },
    metrics: [
      {
        value: "−50%",
        label: {
          en: "administrative time for sales managers",
          zh: "業務主管的行政時間",
        },
      },
      {
        value: "−80%",
        label: {
          en: "onboarding time for new sales reps",
          zh: "新業務代表的上手時間",
        },
      },
    ],
    sections: [
      {
        id: "situation",
        heading: { en: "Situation", zh: "情境" },
        body: {
          en: "Contract approval needed the right people to sign, and delays were reaching delivery. At the same time, new sales reps were slow to become effective because early Salesforce steps had no shared explanation.",
          zh: "合約核准要找到該簽名的人，拖延已經影響到出貨。同時，新業務代表遲遲無法上手，因為 Salesforce 早期的步驟沒有一份大家共用的說明。",
        },
      },
      {
        id: "decision",
        heading: { en: "Decision", zh: "決定" },
        body: {
          en: "I managed the approval workflow from request to signature, coordinating the signers so the path kept moving. Alongside that, I wrote a step-by-step user manual aimed at the adoption bottlenecks new reps actually hit.",
          zh: "我從申請到簽名管理整段核准流程，協調所有需要簽核的人，讓流程持續往前。同時寫了一份逐步操作手冊，對準新業務代表真正卡住的採用瓶頸。",
        },
      },
      {
        id: "outcome",
        heading: { en: "Outcome", zh: "結果" },
        body: {
          en: "The workflow eliminated the delivery delays that missing signatures had been causing, and saved sales managers 50% of the administrative time on that path. New sales reps’ onboarding time fell by 80%.",
          zh: "這套流程消除了缺簽名造成的出貨延遲，也讓業務主管在這段行政工作上省下 50% 的時間。新業務代表的到職上手時間減少 80%。",
        },
      },
    ],
  },
  {
    slug: "market-desk",
    index: "04",
    lens: { en: "Interface", zh: "介面" },
    company: "Independent",
    role: {
      en: "Personal project",
      zh: "個人專案",
    },
    place: { en: "Self-directed", zh: "自行開發" },
    dates: "Ongoing",
    title: {
      en: "Prices, rates, and the news, on one desk",
      zh: "把價格、利率和新聞放在同一張桌子上",
    },
    summary: {
      en: "I built an automated market dashboard that joins real-time financial APIs so stock prices, interest rates, and live news can be read together.",
      zh: "我自己做了一個自動化股市儀表板，接上即時金融 API，讓股價、利率和即時新聞可以放在一起看。",
    },
    metrics: [
      {
        value: "3",
        label: {
          en: "signals in one view: price, rate, news",
          zh: "個訊號同屏：價格、利率、新聞",
        },
      },
      {
        value: "Live",
        label: {
          en: "financial APIs for prices, rates, and news",
          zh: "金融 API，接價格、利率與新聞",
        },
      },
    ],
    study: "market",
    sections: [
      {
        id: "situation",
        heading: { en: "Situation", zh: "情境" },
        body: {
          en: "I follow the market as a practice. Stock prices, interest-rate moves, and headlines lived in separate tools, so the relationship among them was easy to miss in the moment.",
          zh: "看盤是我持續在做的事。股價、利率波動和新聞原本散在不同工具裡，當下很難同時看見它們之間的關係。",
        },
      },
      {
        id: "decision",
        heading: { en: "What I built", zh: "我做了什麼" },
        body: {
          en: "I developed an automated stock-market dashboard and integrated real-time financial APIs. The tool tracks stock prices, interest-rate fluctuations, and live news. The study below puts the price path first, the rate beside it, and the news underneath, so a move in price can be read against the other two signals.",
          zh: "我開發了自動化股市儀表板，並接上即時金融 API，用來追蹤股價、利率波動和即時新聞。下方的試作把價格走勢放在主位，利率放在旁邊，新聞放在下面，讓價格一動就能對上另外兩個訊號。",
        },
      },
      {
        id: "outcome",
        heading: { en: "How to read this screen", zh: "怎麼看這個畫面" },
        body: {
          en: "The screen on this page is an interface study of those three signals. The figures are samples composed for the layout. Live readings stay in the tool itself. This page is a design artifact, and it is an account of a personal project rather than a trading recommendation.",
          zh: "這一頁的畫面，是依照這三個訊號做的介面試作。數字是為了版面組成的樣本，即時數據留在工具裡。這是一份設計作品，用來說明個人專案，不是交易建議。",
        },
      },
    ],
  },
  {
    slug: "margin-review",
    index: "05",
    lens: { en: "Commercial judgment", zh: "商業判斷" },
    company: "LVMH Watches & Jewelry",
    role: {
      en: "Financial Analyst (Short-term Contractor)",
      zh: "Financial Analyst｜短期約聘",
    },
    place: { en: "Taipei, Taiwan", zh: "台北" },
    dates: "Jul 2024 – Sep 2024",
    title: {
      en: "Find where the margin actually moved",
      zh: "找出毛利真正移動的地方",
    },
    summary: {
      en: "I used variance analysis to explain gross-margin swings and rising expenses, then re-forecast the second half against how the business was actually spending.",
      zh: "我用差異分析解釋毛利波動和費用上升的原因，再依實際花費重編下半年預測。",
    },
    metrics: [
      {
        value: "−80%",
        label: { en: "management review time", zh: "管理層審閱時間" },
      },
      {
        value: "≤1%",
        label: {
          en: "annual profit-margin fluctuation",
          zh: "年度利潤率波動",
        },
      },
    ],
    sections: [
      {
        id: "situation",
        heading: { en: "Situation", zh: "情境" },
        body: {
          en: "Gross margin was fluctuating and expenses were rising. Leadership needed a clear account of the causes before those numbers could inform product sales strategy, and the second-half budget still had to be reset.",
          zh: "毛利在波動，費用也在上升。主管需要先看清原因，這些數字才支撐得了產品銷售策略；下半年預算也需要重編。",
        },
      },
      {
        id: "decision",
        heading: { en: "Decision", zh: "決定" },
        body: {
          en: "I pinpointed the root causes through financial variance analysis and turned that into a readout leadership could use in the sales conversation. I re-forecast the second half from year-to-date spending and from the business needs that had changed since the original plan.",
          zh: "我用財務差異分析找出根因，整理成主管在銷售討論裡用得上的說明。下半年預測則依照年初至今的花費趨勢，以及計畫之後改變的業務需求重編。",
        },
      },
      {
        id: "outcome",
        heading: { en: "Outcome", zh: "結果" },
        body: {
          en: "The readout supported product sales strategy and reduced management review time by 80%. Annual profit-margin fluctuation stayed within 1%.",
          zh: "這份分析支持了產品銷售策略，並讓管理層審閱時間減少 80%。年度利潤率的波動維持在 1% 以內。",
        },
      },
    ],
  },
  {
    slug: "initial-audit",
    index: "06",
    lens: { en: "Ambiguity", zh: "在模糊裡建立節奏" },
    company: "Ernst & Young",
    role: {
      en: "Audit Associate (Staff 2), Financial Accounting Advisory Services",
      zh: "Audit Associate（Staff 2）｜財務會計諮詢服務",
    },
    place: { en: "Taipei, Taiwan", zh: "台北" },
    dates: "Jul 2022 – Jul 2024",
    title: {
      en: "An initial audit, with no papers to inherit",
      zh: "初次查核，沒有現成底稿可以接",
    },
    summary: {
      en: "On an ambiguous first-year audit, I built the working papers from scratch and gave interns a checkpointed way to deliver work on time.",
      zh: "在一份條件很模糊的初次查核裡，我從零建立工作底稿，並用檢查點讓實習同事準時交付。",
    },
    metrics: [
      {
        value: "−90%",
        label: { en: "follow-up queries", zh: "後續查詢" },
      },
      {
        value: "+80%",
        label: { en: "on-time task delivery", zh: "任務準時交付" },
      },
    ],
    sections: [
      {
        id: "situation",
        heading: { en: "Situation", zh: "情境" },
        body: {
          en: "The engagement was an initial audit, so there was no inherited file to follow. The work was ambiguous, and the audit trail still had to be something another person could rely on. Interns on the team also needed assignments broken into a cadence they could hit.",
          zh: "這是初次查核，沒有上一期的檔案可以沿用。工作範圍很模糊，但查核軌跡仍要讓下一個人跟得下去。團隊裡的實習同事，也需要把任務拆成他們趕得上的節奏。",
        },
      },
      {
        id: "decision",
        heading: { en: "Decision", zh: "決定" },
        body: {
          en: "I built the audit working papers from scratch and standardized the trail so the file stayed compliant and reviewable. For intern delivery, I broke assignments down and set progress checkpoints before a due date could slip past unspoken expectations.",
          zh: "我從零建立查核工作底稿，把軌跡標準化，讓檔案符合規範、也可以被覆核。對實習同事的交付，我把任務拆開並設立進度檢查點，避免期限到了才發現彼此期待沒有對上。",
        },
      },
      {
        id: "outcome",
        heading: { en: "Outcome", zh: "結果" },
        body: {
          en: "Follow-up queries fell by 90%. On-time task delivery improved by 80%.",
          zh: "後續查詢減少 90%。任務準時交付提升 80%。",
        },
      },
    ],
  },
];

export const experience: Role[] = [
  {
    company: "Uber Technologies",
    role: {
      en: "Sales Operation Analyst",
      zh: "Sales Operation Analyst｜銷售營運分析師",
    },
    place: { en: "Taipei, Taiwan", zh: "台北" },
    dates: "Jul 2025 – May 2026",
    caseSlug: "apac-quotation",
    points: {
      en: [
        "Diagnosed root causes of post-launch Salesforce issues on the APAC Quotation Feature and cut weekly system tickets by 95% within two months.",
        "Ranked critical fixes by issue frequency and business impact, and coordinated with engineering to cut system modification time by 80%.",
        "Started a monthly user report for local Sales, Operations, and APAC Sales: a five-minute view of resolution progress and feature adoption.",
      ],
      zh: [
        "診斷 APAC Quotation Feature 上線後的 Salesforce 問題根因，兩個月內將每週系統工單減少 95%。",
        "依問題頻率與業務影響排序關鍵修復，並與工程團隊協調，將系統修改時間減少 80%。",
        "為本地 Sales、Operations 與 APAC Sales 建立每月使用者報告，用五分鐘說明解決進度與功能採用。",
      ],
    },
  },
  {
    company: "eCloudvalley Digital Technology",
    role: {
      en: "IT System Engineer",
      zh: "IT System Engineer｜資訊系統工程師",
    },
    place: { en: "Taipei, Taiwan", zh: "台北" },
    dates: "Jan 2025 – Jun 2025",
    caseSlug: "pricing-catalog",
    points: {
      en: [
        "Led a cross-departmental effort to standardize pricing-catalog uploads, cutting inconsistent or incorrect data input by over 90%.",
        "Clarified quoting needs for departments without a defined process, adapted the existing architecture, and onboarded those teams in three weeks while improving efficiency by 75%.",
      ],
      zh: [
        "主導跨部門把報價目錄上傳標準化，不一致或錯誤的資料輸入減少超過 90%。",
        "釐清尚無既定流程的部門的報價需求，調整既有架構，三週內完成導入，效率提升 75%。",
      ],
    },
  },
  {
    company: "LVMH Watches & Jewelry",
    role: {
      en: "Financial Analyst (Short-term Contractor)",
      zh: "Financial Analyst｜短期約聘",
    },
    place: { en: "Taipei, Taiwan", zh: "台北" },
    dates: "Jul 2024 – Sep 2024",
    caseSlug: "margin-review",
    points: {
      en: [
        "Located the causes of gross-margin swings and rising expenses through variance analysis. The readout supported product sales strategy and cut management review time by 80%.",
        "Re-forecast the second half from year-to-date spending and changing business needs, holding annual profit-margin fluctuation within 1%.",
      ],
      zh: [
        "用差異分析找出毛利波動與費用上升的原因。分析支持產品銷售策略，並使管理層審閱時間減少 80%。",
        "依年初至今的花費與改變中的業務需求重編下半年預測，年度利潤率波動維持在 1% 以內。",
      ],
    },
  },
  {
    company: "Ernst & Young",
    role: {
      en: "Audit Associate (Staff 2), Financial Accounting Advisory Services",
      zh: "Audit Associate（Staff 2）｜財務會計諮詢服務",
    },
    place: { en: "Taipei, Taiwan", zh: "台北" },
    dates: "Jul 2022 – Jul 2024",
    caseSlug: "initial-audit",
    points: {
      en: [
        "Built audit working papers from scratch on an ambiguous initial audit, standardized the trail for compliance, and cut follow-up queries by 90%.",
        "Split intern assignments into checkpoints, which kept expectations visible and improved on-time task delivery by 80%.",
      ],
      zh: [
        "在條件模糊的初次查核中從零建立工作底稿，標準化查核軌跡以符合規範，後續查詢減少 90%。",
        "把實習任務拆成檢查點，讓期待保持可見，任務準時交付提升 80%。",
      ],
    },
  },
  {
    company: "Mead Johnson Nutrition",
    role: {
      en: "Salesforce Effectiveness Assistant (Internship)",
      zh: "Salesforce Effectiveness Assistant｜實習",
    },
    place: { en: "Taipei, Taiwan", zh: "台北" },
    dates: "Jan 2022 – Aug 2022",
    caseSlug: "salesforce-adoption",
    points: {
      en: [
        "Ran the contract-approval workflow end to end, coordinating signers so deliveries were no longer waiting on signatures, and saved sales managers 50% of that administrative time.",
        "Wrote a step-by-step manual for early Salesforce adoption bottlenecks, cutting new sales reps’ onboarding time by 80%.",
      ],
      zh: [
        "端到端管理合約核准流程，協調簽核人，出貨不再等簽名，業務主管的相關行政時間減少 50%。",
        "針對 Salesforce 早期採用瓶頸撰寫逐步手冊，新業務代表上手時間減少 80%。",
      ],
    },
  },
];

export const education = [
  {
    school: {
      en: "University of Michigan School of Information",
      zh: "密西根大學資訊學院 UMSI",
    },
    detail: {
      en: "Master of Science in Information, Product Management",
      zh: "資訊科學碩士 MSI，主修產品管理",
    },
    place: { en: "Ann Arbor, Michigan", zh: "安娜堡" },
    dates: "Sep 2026 – Jun 2028",
    note: { en: "Expected", zh: "預計" },
    points: {
      en: [] as string[],
      zh: [] as string[],
    },
  },
  {
    school: {
      en: "National Central University",
      zh: "國立中央大學",
    },
    detail: {
      en: "BBA, Business Administration and Finance (double major)",
      zh: "企管系與財務金融雙主修，學士",
    },
    place: { en: "Taoyuan, Taiwan", zh: "桃園" },
    dates: "Sep 2018 – Jun 2022",
    note: { en: "GPA 3.9 / 4.0", zh: "GPA 3.9 / 4.0" },
    points: {
      en: [
        "Academic Excellence Award and Dean’s List, class top 5%.",
        "Ambassador, Impact Entrepreneur Lab. Field visits to Grameen Bank in Bangladesh, and engagement with Dr. Muhammad Yunus, to study social-enterprise ecosystems.",
      ],
      zh: [
        "學術優異獎與院長名單，班級前 5%。",
        "Impact Entrepreneur Lab 大使。走訪孟加拉 Grameen Bank，並與 Muhammad Yunus 博士交流，認識社會企業的生態。",
      ],
    },
  },
];

export const skills: { label: Record<Locale, string>; items: Record<Locale, string[]> }[] = [
  {
    label: { en: "Languages", zh: "語言" },
    items: {
      en: ["Mandarin · native", "English · proficient"],
      zh: ["中文 · 母語", "英文 · 精通"],
    },
  },
  {
    label: { en: "Tools", zh: "工具" },
    items: {
      en: ["Salesforce", "SOQL", "Python", "Jira", "Slack automation", "MS Office"],
      zh: ["Salesforce", "SOQL", "Python", "Jira", "Slack 自動化", "MS Office"],
    },
  },
  {
    label: { en: "Licenses", zh: "證照" },
    items: {
      en: ["Senior Securities Specialist", "Futures Specialist", "ERP planner"],
      zh: ["高級證券商業務員", "期貨商業務員", "企業資源規劃師"],
    },
  },
];

export const ui = {
  en: {
    skip: "Skip to content",
    navWork: "Work",
    navExperience: "Experience",
    navAbout: "About",
    navContact: "Contact",
    menu: "Menu",
    close: "Close",
    kicker: "University of Michigan · Product Management",
    lede: "I find where a system is failing the people who have to use it, then get the right fix shipped.",
    support:
      "MSI student at the School of Information, concentrating in Product Management. Before Ann Arbor I was a Sales Operation Analyst at Uber in Taipei. The work before that was pricing systems, Salesforce adoption, audit, and financial analysis. I am aiming at technical product management in big technology companies and large global firms.",
    seeWork: "See the work",
    write: "Email Joan",
    nowLabel: "Now",
    nowValue: "UMSI · Product Management",
    nextLabel: "Aiming at",
    nextValue: "Technical product management",
    proofTitle: "Selected outcomes",
    proofHint: "Choose a result to jump to the work behind it.",
    workTitle: "Selected work",
    workNote:
      "Ordered by the product question each piece answers. Dates sit on every row. The employment timeline is just below.",
    readCase: "Read the story",
    experienceTitle: "Experience",
    experienceNote: "Same facts as the résumé, in the order I held the roles.",
    aboutTitle: "About",
    aboutBody:
      "I trained in business administration and finance at National Central University, then spent four years inside companies where the product was often an internal system: a quotation tool, a price catalog, an approval path, a set of audit papers. The pattern across those jobs is the same. Name the user problem, choose what to fix first, and leave the people who depend on it with a short, honest update. At Michigan I am building the product-management toolkit around that pattern, including the interface craft on this site.",
    aboutSite:
      "This website is part of the work sample. The hierarchy, the bilingual reading, and the case structure are here so you can see how I organize a product story.",
    alsoTitle: "Also",
    alsoBody:
      "I translate financial reports, articles of association, and shareholder handbooks as a freelance practice. Outside work I trade stocks, practice yoga, and do pilates. The market dashboard in the selected work grew out of that trading practice.",
    educationTitle: "Education",
    contactTitle: "Let’s talk about the product role.",
    contactBody:
      "I read every note. The best ones name the team, the product, and what you want a technical product manager to be responsible for.",
    phone: "Phone",
    linkedin: "LinkedIn",
    github: "GitHub",
    back: "All work",
    previous: "Previous",
    next: "Next",
    writtenFrom: "Written from the roles and results on my résumé. I can walk through the working detail in conversation.",
    notFoundTitle: "This page is not on the site.",
    notFoundBody: "The work, the timeline, and a way to write to me are on the home page.",
    home: "Back home",
    colophon: "Fraunces and Outfit. English and 繁體中文. Outcomes, then the decision, then the résumé.",
    langLabel: "Language",
  },
  zh: {
    skip: "跳到本文",
    navWork: "作品",
    navExperience: "經歷",
    navAbout: "關於",
    navContact: "聯絡",
    menu: "選單",
    close: "關閉",
    kicker: "密西根大學資訊學院 · 產品管理",
    lede: "我先找到系統卡在使用者身上的地方，再把該修的部分送上線。",
    support:
      "我是密西根大學資訊學院碩士生，主修產品管理。來安娜堡之前，我在台北的 Uber 擔任 Sales Operation Analyst。更早的工作涵蓋報價系統、Salesforce 採用、查核與財務分析。下一步想進大型科技公司或大型外商，做 Technical Product Manager。",
    seeWork: "看作品",
    write: "寫信給 Joan",
    nowLabel: "現在",
    nowValue: "UMSI · 產品管理",
    nextLabel: "目標",
    nextValue: "Technical Product Manager",
    proofTitle: "幾個結果",
    proofHint: "點一個數字，跳到它後面的那份工作。",
    workTitle: "精選作品",
    workNote: "順序依照每一則在回答的產品問題。日期寫在每一列上。任職時間軸就在下面。",
    readCase: "閱讀過程",
    experienceTitle: "工作經歷",
    experienceNote: "與履歷同一組事實，依任職順序排列。",
    aboutTitle: "關於",
    aboutBody:
      "我在中央大學讀企業管理與財務金融，之後四年待在公司裡。那些「產品」常常是內部系統：報價工具、價格目錄、核准流程、一套查核底稿。這幾份工作的形狀很接近。先說清楚使用者的問題，決定先修什麼，再留給依賴它的人一份短而誠實的更新。在密西根，我把產品管理的方法疊到這個形狀上，也包括這個網站上的介面。",
    aboutSite:
      "這個網站本身就是作品的一部分。階層、雙語閱讀，以及案例的結構，是為了讓你看見我怎麼組織一個產品故事。",
    alsoTitle: "其他",
    alsoBody:
      "我接案翻譯財務報告、公司章程與股東手冊。工作之外會看股票、練瑜伽和皮拉提斯。精選作品裡的市場儀表板，就是從看盤長出來的。",
    educationTitle: "學歷",
    contactTitle: "如果有產品職缺，寫信給我。",
    contactBody:
      "每封信我都會看。最好順便寫上團隊、產品，以及你希望一位 Technical Product Manager 負責什麼。",
    phone: "電話",
    linkedin: "LinkedIn",
    github: "GitHub",
    back: "全部作品",
    previous: "上一則",
    next: "下一則",
    writtenFrom: "內容依照履歷上的職位與結果撰寫。細節可以在談話裡展開。",
    notFoundTitle: "這個頁面不在站上。",
    notFoundBody: "作品、時間軸，以及寫信給我的方式，都在首頁。",
    home: "回首頁",
    colophon: "字體是 Fraunces 與 Outfit。英文與繁體中文。先看結果，再看決定，最後是履歷。",
    langLabel: "語言",
  },
} as const;
