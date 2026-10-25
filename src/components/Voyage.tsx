import { employers, experience } from "../content";
import { Logo } from "./Logos";

const hulls = ["#e08a72", "#1a3148", "#e3b341", "#7f9a78", "#8eafc4"];

function Boat({ hull }: { hull: string }) {
  return (
    <svg className="boat" viewBox="0 0 160 108" aria-hidden="true">
      <path d="M6 86c18-10 34-10 52 0s34 10 52 0 34-10 44 0" fill="none" stroke="#6f97b3" strokeWidth="3" strokeLinecap="round" />
      <path d="M34 78l14 18h64l14-18H34z" fill={hull} stroke="#1c2430" strokeWidth="2" strokeLinejoin="round" />
      <path d="M80 78V30" stroke="#1c2430" strokeWidth="2" />
      <path d="M80 34l34 22-34 16V34z" fill="#fffdf8" stroke="#1c2430" strokeWidth="2" strokeLinejoin="round" />
      <path d="M80 40l-22 16 22 12V40z" fill="#f6f1e6" stroke="#1c2430" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="80" cy="26" r="3.5" fill="#e3b341" stroke="#1c2430" strokeWidth="1.5" />
    </svg>
  );
}

export function Voyage({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const route = [...experience].reverse();

  return (
    <ol className="voyage voyage-stack">
      {route.map((role, index) => {
        const id = role.logoId ?? role.company;
        const employer = employers.find((item) => item.id === role.logoId);
        const on = selected === id;
        return (
          <li key={role.company}>
            <button
              type="button"
              className={on ? "ship is-selected" : "ship"}
              aria-pressed={on}
              onMouseEnter={() => onSelect(id)}
              onFocus={() => onSelect(id)}
              onClick={() => onSelect(id)}
            >
              <Boat hull={hulls[index % hulls.length]} />
              {role.logoId ? <Logo id={role.logoId} /> : null}
              <strong>{employer?.name ?? role.company}</strong>
              <span>{role.dates}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
