# Chih-Chi Huang

Personal site for a UMSI product-management student aiming at technical product management.

The biography, case studies, and both languages live in `src/content.ts`. Case studies stay inside the roles and results on the résumé.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

`public/404.html` restores deep links when the site is hosted as a GitHub Pages project at `/personal_website/`.

## Publish

GitHub Pages on a free account needs this repository to be public. After it is public and this branch is on `main`, the Deploy site workflow publishes:

https://joanuser.github.io/personal_website/

In Settings → Pages, set Build and deployment to GitHub Actions.
