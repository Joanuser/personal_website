import { employers, experience } from "../content";
import { useI18n } from "../i18n";
import { Logo } from "./Logos";

const hulls = ["#e08a72", "#1a3148", "#e3b341", "#7f9a78", "#8eafc4"];

function Boat({ hull }: { hull: string }) {
  return (
    <svg className="boat" viewBox="0 0 160 108" aria-hidden="true">
      <path d="M6 86c18-10 34-10 52 0s34 10 52 0 34-10 44 0" fill="none" stroke="#6f97b3" strokeWidth="3" strokeLinecap="round" />
      <path d="M34 78l14 18h64l14-18H34z" fill={hull} stroke="#1c2430" strokeWidth="2" strokeLinejoin="round" />
      <path d="M46 96h68" stroke="#1c2430" strokeWidth="2" />
      <path d="M80 78V30" stroke="#1c2430" strokeWidth="2" />
      <path d="M80 34l34 22-34 16V34z" fill="#fffdf8" stroke="#1c2430" strokeWidth="2" strokeLinejoin="round" />
      <path d="M80 40l-22 16 22 12V40z" fill="#f6f1e6" stroke="#1c2430" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="80" cy="26" r="3.5" fill="#e3b341" stroke="#1c2430" strokeWidth="1.5" />
    </svg>
  );
}

function Harbor() {
  return (
    <svg className="boat" viewBox="0 0 160 108" aria-hidden="true">
      <path d="M8 88c22-12 40-8 62 2s40 10 82-4" fill="none" stroke="#6f97b3" strokeWidth="3" strokeLinecap="round" />
      <path d="M96 88V48h28v40" fill="#f3e2cf" stroke="#1c2430" strokeWidth="2" />
      <path d="M92 48h36" stroke="#1c2430" strokeWidth="2" />
      <path d="M108 48V34h8v14" fill="#fffdf8" stroke="#1c2430" strokeWidth="2" />
      <path d="M24 88c8-16 18-24 28-24" fill="none" stroke="#7f9a78" strokeWidth="3" strokeLinecap="round" />
      <circle cx="54" cy="62" r="4" fill="#e08a72" />
    </svg>
  );
}

export function Voyage({ nextHref, nextLabel }: { nextHref: string; nextLabel: string }) {
  const { t } = useI18n();
  const route = [...experience].reverse();

  return (
    <div className="sea">
      <p className="voyage-note">{t.voyageNote}</p>
      <ol className="voyage">
        {route.map((role, index) => {
          const employer = employers.find((item) => item.id === role.logoId);
          return (
            <li key={role.company}>
              <a className="ship" href={role.logoId ? `#role-${role.logoId}` : "#experience"}>
                <Boat hull={hulls[index % hulls.length]} />
                {role.logoId ? <Logo id={role.logoId} /> : null}
                <strong>{employer?.name ?? role.company}</strong>
                <span>{role.dates}</span>
              </a>
            </li>
          );
        })}
        <li>
          <a className="ship harbor" href={nextHref}>
            <Harbor />
            <span>{t.nextChapter}</span>
            <strong>{nextLabel}</strong>
          </a>
        </li>
      </ol>
    </div>
  );
}
