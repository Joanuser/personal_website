export function CompareChart({
  caption,
  rows,
}: {
  caption: string;
  rows: { label: string; value: number; display: string }[];
}) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <figure className="compare">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="compare-top">
            <span>{row.label}</span>
            <strong>{row.display}</strong>
          </div>
          <div className="track track-ink" aria-hidden="true">
            <span style={{ width: `${Math.max(8, (row.value / max) * 100)}%` }} />
          </div>
        </div>
      ))}
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

const monthIndex: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

export function tenureMonths(dates: string): number | null {
  const match = dates.match(/^([A-Za-z]{3}) (\d{4}) – ([A-Za-z]{3}) (\d{4})$/);
  if (!match) return null;
  const startMonth = monthIndex[match[1]];
  const endMonth = monthIndex[match[3]];
  if (startMonth === undefined || endMonth === undefined) return null;
  const start = Number(match[2]) * 12 + startMonth;
  const end = Number(match[4]) * 12 + endMonth;
  return Math.max(1, end - start + 1);
}

export function percentIn(value: string): number | null {
  if (value.includes("≤")) return null;
  const match = value.match(/(\d+(?:\.\d+)?)%/);
  if (!match) return null;
  const amount = Number(match[1]);
  if (amount <= 0 || amount > 100) return null;
  return amount;
}
