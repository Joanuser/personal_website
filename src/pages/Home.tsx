import { useEffect } from "react";
import { Link } from "react-router-dom";
import { person, proof } from "../content";
import { useI18n } from "../i18n";

export function Home() {
  const { locale, t } = useI18n();

  useEffect(() => {
    document.title = "Chih-Chi Huang — Technical Product Management";
  }, []);

  return (
    <main id="content" className="hello-page">
      <div className="hello">
        <div className="hello-copy">
          <h1>{t.hello}</h1>
          <p className="hello-role">{t.helloRole}</p>
          <p className="hello-more">{t.support}</p>
          <p className="hello-where">
            {person.location[locale]} · {person.email}
          </p>
          <ul className="hello-proof">
            {proof.map((item) => (
              <li key={item.slug}>
                <Link to={`/work/${item.slug}`}>
                  <strong>{item.value}</strong>
                  <span>{item.label[locale]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <figure className="hello-art">
          <img src={`${import.meta.env.BASE_URL}cover.png`} alt={t.coverAlt} />
        </figure>
      </div>
      <Link className="hello-arrow" to="/chapter/projects" aria-label={t.seeCases}>
        <svg viewBox="0 0 88 88" aria-hidden="true">
          <circle cx="44" cy="44" r="40" />
          <path d="M44 24v36" />
          <path d="M28 46l16 16 16-16" />
        </svg>
        <span>{t.seeCases}</span>
      </Link>
    </main>
  );
}
