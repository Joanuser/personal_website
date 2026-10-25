import { useI18n } from "../i18n";

const copy = {
  en: {
    title: "Market desk",
    sample: "Sample",
    price: "Sample price",
    priceNote: "A composed path, for the layout.",
    change: "+0.8%",
    rate: "Sample rate",
    rateNote: "Interest-rate context beside the price.",
    rateValue: "4.25%",
    news: "Sample headlines",
    items: [
      ["Rates held at the sample setting", "09:40"],
      ["Price path turns with the open", "09:31"],
      ["A headline sits under both signals", "09:12"],
    ],
    caption:
      "Interface study. Sample readings show how price, rate, and news share one desk. Live data stays in the tool.",
  },
  zh: {
    title: "市場桌",
    sample: "樣本",
    price: "樣本價格",
    priceNote: "這條走勢是為版面組成的。",
    change: "+0.8%",
    rate: "樣本利率",
    rateNote: "利率放在價格旁邊，當作對照。",
    rateValue: "4.25%",
    news: "樣本標題",
    items: [
      ["利率維持在樣本水準", "09:40"],
      ["開盤時價格路徑轉向", "09:31"],
      ["一則標題放在兩個訊號下面", "09:12"],
    ],
    caption: "介面試作。樣本數字用來呈現價格、利率和新聞如何共用一張桌子。即時數據留在工具裡。",
  },
} as const;

export function MarketStudy() {
  const { locale } = useI18n();
  const text = copy[locale];

  return (
    <figure>
      <div className="desk">
        <div className="desk-bar">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
          <strong>{text.title}</strong>
          <span className="sample">{text.sample}</span>
        </div>
        <div className="desk-grid">
          <section className="chart" aria-label={text.price}>
            <header>
              <div>
                <strong>{text.price}</strong>
                <p>{text.priceNote}</p>
              </div>
              <span className="up">{text.change}</span>
            </header>
            <svg viewBox="0 0 320 120" role="img" aria-label={text.priceNote}>
              <path
                d="M0 86 C 30 84, 40 70, 68 74 S 110 96, 140 78 S 190 30, 220 42 S 270 70, 320 28"
                fill="none"
                stroke="#E3B341"
                strokeWidth="3"
              />
              <path
                d="M0 86 C 30 84, 40 70, 68 74 S 110 96, 140 78 S 190 30, 220 42 S 270 70, 320 28 V 120 H 0 Z"
                fill="rgba(227,179,65,0.16)"
              />
            </svg>
          </section>
          <section className="side" aria-label={text.rate}>
            <header>
              <strong>{text.rate}</strong>
            </header>
            <b>{text.rateValue}</b>
            <p>{text.rateNote}</p>
          </section>
          <section className="news" aria-label={text.news}>
            <header>
              <strong>{text.news}</strong>
            </header>
            <ol>
              {text.items.map(([headline, time]) => (
                <li key={headline}>
                  <span>{headline}</span>
                  <time>{time}</time>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
      <figcaption className="study-caption">{text.caption}</figcaption>
    </figure>
  );
}
